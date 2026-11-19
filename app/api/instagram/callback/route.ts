import { NextRequest,NextResponse } from "next/server";
import { saveAccount } from "@/lib/store";

export async function GET(req:NextRequest){
  const appUrl=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";
  const code=req.nextUrl.searchParams.get("code");
  const state=req.nextUrl.searchParams.get("state");
  const saved=req.cookies.get("ig_oauth_state")?.value;
  if(!code || !state || !saved || state!==saved) return NextResponse.redirect(`${appUrl}/?error=oauth_state`);
  try{
    const body=new URLSearchParams({
      client_id:process.env.INSTAGRAM_APP_ID!,client_secret:process.env.INSTAGRAM_APP_SECRET!,
      grant_type:"authorization_code",redirect_uri:process.env.INSTAGRAM_REDIRECT_URI||`${appUrl}/api/instagram/callback`,code
    });
    const shortRes=await fetch("https://api.instagram.com/oauth/access_token",{method:"POST",body});
    const short=await shortRes.json();
    if(!shortRes.ok || !short.access_token) throw new Error(short.error_message||"Instagram 인증에 실패했습니다.");
    const longUrl=new URL("https://graph.instagram.com/access_token");
    longUrl.searchParams.set("grant_type","ig_exchange");
    longUrl.searchParams.set("client_secret",process.env.INSTAGRAM_APP_SECRET!);
    longUrl.searchParams.set("access_token",short.access_token);
    const longRes=await fetch(longUrl);
    const long=await longRes.json();
    const token=long.access_token||short.access_token;
    const profileUrl=new URL("https://graph.instagram.com/me");
    profileUrl.searchParams.set("fields","user_id,username,account_type");
    profileUrl.searchParams.set("access_token",token);
    const profileRes=await fetch(profileUrl);
    const profile=await profileRes.json();
    if(!profileRes.ok || !profile.user_id) throw new Error(profile.error?.message||"프로필 정보를 가져오지 못했습니다.");
    await saveAccount({ig_user_id:String(profile.user_id),username:profile.username||"Instagram 계정",access_token:token,token_expires_at:long.expires_in?new Date(Date.now()+long.expires_in*1000).toISOString():null});
    const response=NextResponse.redirect(`${appUrl}/?connected=1`);
    response.cookies.delete("ig_oauth_state");
    return response;
  }catch(e){
    const message=encodeURIComponent(e instanceof Error?e.message:"인증 오류");
    return NextResponse.redirect(`${appUrl}/?error=${message}`);
  }
}
