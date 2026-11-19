import {NextRequest,NextResponse} from "next/server";
import {getAccount} from "@/lib/store";
import {supabaseAdmin} from "@/lib/supabase";
import {publishImage} from "@/lib/instagram";
export async function POST(req:NextRequest){
 try{
  const {id}=await req.json(); const account=await getAccount();
  if(!account)return NextResponse.json({error:"인스타그램 계정을 연결해주세요."},{status:400});
  const {data:post,error}=await supabaseAdmin().from("scheduled_posts").select("*").eq("id",id).single();
  if(error||!post)throw new Error("게시물을 찾을 수 없습니다.");
  const result=await publishImage(account.access_token,account.ig_user_id,post.image_url,post.caption);
  await supabaseAdmin().from("scheduled_posts").update({status:"published",published_at:new Date().toISOString(),instagram_media_id:result.id}).eq("id",id);
  return NextResponse.json({ok:true,id:result.id});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"발행 실패"},{status:500});}
}
