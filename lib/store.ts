import { hasSupabase, supabaseAdmin } from "./supabase";

export type Account = { ig_user_id:string; username:string; access_token:string; token_expires_at:string|null };
export async function getAccount():Promise<Account|null>{
  if(!hasSupabase()) return null;
  const {data,error}=await supabaseAdmin().from("ig_account").select("*").eq("id",1).maybeSingle();
  if(error) throw error;
  return data;
}
export async function saveAccount(account:Account){
  const {error}=await supabaseAdmin().from("ig_account").upsert({id:1,...account});
  if(error) throw error;
}
export async function listPosts(){
  if(!hasSupabase()) return [];
  const {data,error}=await supabaseAdmin().from("scheduled_posts").select("*").order("scheduled_at",{ascending:true}).limit(100);
  if(error) throw error; return data||[];
}
