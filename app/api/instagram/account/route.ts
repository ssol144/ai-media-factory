import {NextResponse} from "next/server";
import {getAccount} from "@/lib/store";
export async function GET(){
 try{const a=await getAccount();return NextResponse.json({connected:!!a,account:a?{username:a.username,ig_user_id:a.ig_user_id,token_expires_at:a.token_expires_at}:null});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"계정 조회 오류"},{status:500});}
}
