import {NextResponse} from "next/server";
export async function GET(){
 const appId=process.env.THREADS_APP_ID;const secret=process.env.THREADS_APP_SECRET;const appUrl=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";
 if(!appId||!secret)return NextResponse.redirect(`${appUrl}/?error=threads_config`);
 const state=crypto.randomUUID();const redirect=process.env.THREADS_REDIRECT_URI||`${appUrl}/api/threads/callback`;
 const url=new URL("https://threads.net/oauth/authorize");url.searchParams.set("client_id",appId);url.searchParams.set("redirect_uri",redirect);url.searchParams.set("scope","threads_basic,threads_content_publish");url.searchParams.set("response_type","code");url.searchParams.set("state",state);
 const response=NextResponse.redirect(url);response.cookies.set("threads_oauth_state",state,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:600,path:"/"});return response;
}
