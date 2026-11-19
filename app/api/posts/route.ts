import {NextRequest,NextResponse} from "next/server";
import {getAccount,listPosts} from "@/lib/store";
import {supabaseAdmin} from "@/lib/supabase";
export async function GET(){
 try{return NextResponse.json({posts:await listPosts()});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"게시물 조회 오류"},{status:500});}
}
export async function POST(req:NextRequest){
 try{
  const {imageUrl,caption,scheduledAt}=await req.json();
  if(!imageUrl||!caption||!scheduledAt) return NextResponse.json({error:"이미지 URL, 캡션, 예약 시간을 입력해주세요."},{status:400});
  const parsed=new URL(imageUrl); if(!["https:","http:"].includes(parsed.protocol)) throw new Error("올바른 이미지 URL을 입력해주세요.");
  if(new Date(scheduledAt)<=new Date()) return NextResponse.json({error:"예약 시간은 현재보다 뒤여야 합니다."},{status:400});
  const account=await getAccount(); if(!account) return NextResponse.json({error:"먼저 인스타그램 계정을 연결해주세요."},{status:400});
  const {data,error}=await supabaseAdmin().from("scheduled_posts").insert({image_url:imageUrl,caption,scheduled_at:new Date(scheduledAt).toISOString(),status:"scheduled"}).select().single();
  if(error)throw error; return NextResponse.json({post:data});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"예약 저장 오류"},{status:500});}
}
