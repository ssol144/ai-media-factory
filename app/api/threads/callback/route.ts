import {NextRequest,NextResponse} from "next/server";
import {saveThreadsAccount} from "@/lib/threads-store";
export async function GET(req:NextRequest){
 const appUrl=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";const code=req.nextUrl.searchParams.get("code"),state=req.nextUrl.searchParams.get("state");
 if(!code||!state||state!==req.cookies.get("threads_oauth_state")?.value)return NextResponse.redirect(`${appUrl}/?error=threads_oauth_state`);
 try{
  const redirect=process.env.THREADS_REDIRECT_URI||`${appUrl}/api/threads/callback`;
  const body=new URLSearchParams({client_id:process.env.THREADS_APP_ID!,client_secret:process.env.THREADS_APP_SECRET!,grant_type:"authorization_code",redirect_uri:redirect,code});
  const shortRes=await fetch("https://api.threads.net/oauth/access_token",{method:"POST",body});const short=await shortRes.json();if(!shortRes.ok||!short.access_token)throw new Error(short.error_message||"Threads 인증 실패");
  const longUrl=new URL("https://graph.threads.net/access_token");longUrl.searchParams.set("grant_type","th_exchange_token");longUrl.searchParams.set("client_secret",process.env.THREADS_APP_SECRET!);longUrl.searchParams.set("access_token",short.access_token);
  const longRes=await fetch(longUrl);const long=await longRes.json();const token=long.access_token||short.access_token;
  const me=new URL("https://graph.threads.net/v1.0/me");me.searchParams.set("fields","id,username");me.searchParams.set("access_token",token);const meRes=await fetch(me);const profile=await meRes.json();if(!meRes.ok||!profile.id)throw new Error(profile.error?.message||"Threads 프로필 조회 실패");
  await saveThreadsAccount({threads_user_id:String(profile.id),username:profile.username||"Threads 계정",access_token:token,token_expires_at:long.expires_in?new Date(Date.now()+long.expires_in*1000).toISOString():null});
  const response=NextResponse.redirect(`${appUrl}/?threads_connected=1`);response.cookies.delete("threads_oauth_state");return response;
 }catch(e){return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent(e instanceof Error?e.message:"Threads 인증 오류")}`)}
}
