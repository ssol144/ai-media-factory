import { NextResponse } from "next/server";
export async function GET(){
  const id=process.env.INSTAGRAM_APP_ID;
  const redirect=process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`;
  if(!id || !process.env.INSTAGRAM_APP_SECRET) return NextResponse.redirect(new URL("/?error=meta_config",process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"));
  const state=crypto.randomUUID();
  const scopes=["instagram_business_basic","instagram_business_content_publish","instagram_business_manage_insights"].join(",");
  const url=new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id",id); url.searchParams.set("redirect_uri",redirect);
  url.searchParams.set("response_type","code"); url.searchParams.set("scope",scopes);
  url.searchParams.set("state",state);
  const response=NextResponse.redirect(url);
  response.cookies.set("ig_oauth_state",state,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:600,path:"/"});
  return response;
}
