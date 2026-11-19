import {NextRequest,NextResponse} from "next/server";
import {getAccount} from "@/lib/store";
import {supabaseAdmin} from "@/lib/supabase";
import {publishImage} from "@/lib/instagram";
import {getThreadsAccount} from "@/lib/threads-store";
import {publishThread} from "@/lib/threads";
export const maxDuration=60;
export async function GET(req:NextRequest){
 if(req.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const account=await getAccount();
  const results=[];
  if(account){
   const {data:due,error}=await supabaseAdmin().from("scheduled_posts").select("*").eq("status","scheduled").lte("scheduled_at",new Date().toISOString()).limit(5);
   if(error)throw error;
   for(const post of due||[]){
    try{
     const result=await publishImage(account.access_token,account.ig_user_id,post.image_url,post.caption);
     await supabaseAdmin().from("scheduled_posts").update({status:"published",published_at:new Date().toISOString(),instagram_media_id:result.id}).eq("id",post.id);
     results.push({id:post.id,platform:"instagram",status:"published"});
    }catch(e){
     await supabaseAdmin().from("scheduled_posts").update({status:"failed",error_message:e instanceof Error?e.message:"발행 실패"}).eq("id",post.id);
     results.push({id:post.id,platform:"instagram",status:"failed"});
    }
   }
  }
  const ta=await getThreadsAccount();
  if(ta){
   const {data:dueThreads,error:threadErr}=await supabaseAdmin().from("threads_posts").select("*").eq("status","scheduled").lte("scheduled_at",new Date().toISOString()).limit(5);
   if(threadErr)throw threadErr;
   for(const post of dueThreads||[]){
    try{const result=await publishThread(ta.access_token,ta.threads_user_id,post.text);await supabaseAdmin().from("threads_posts").update({status:"published",published_at:new Date().toISOString(),threads_post_id:result.id}).eq("id",post.id);results.push({id:post.id,platform:"threads",status:"published"});}
    catch(e){await supabaseAdmin().from("threads_posts").update({status:"failed",error_message:e instanceof Error?e.message:"발행 실패"}).eq("id",post.id);results.push({id:post.id,platform:"threads",status:"failed"});}
   }
  }
  return NextResponse.json({processed:results.length,results});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"예약 발행 오류"},{status:500});}
}
