import {NextResponse} from "next/server";
import {getAccount} from "@/lib/store";
import {igRequest} from "@/lib/instagram";
export async function GET(){
 try{
  const a=await getAccount();if(!a)return NextResponse.json({error:"계정을 연결해주세요."},{status:400});
  const profile=await igRequest(a.ig_user_id,a.access_token,{fields:"username,followers_count,follows_count,media_count"});
  const media=await igRequest(`${a.ig_user_id}/media`,a.access_token,{fields:"id,caption,media_type,timestamp,permalink,like_count,comments_count",limit:"10"});
  return NextResponse.json({profile,media:media.data||[]});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"인사이트 조회 실패"},{status:500});}
}
