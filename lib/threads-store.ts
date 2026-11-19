import {hasSupabase,supabaseAdmin} from "./supabase";
export async function getThreadsAccount(){if(!hasSupabase())return null;const {data,error}=await supabaseAdmin().from("threads_account").select("*").eq("id",1).maybeSingle();if(error)throw error;return data;}
export async function saveThreadsAccount(a:{threads_user_id:string;username:string;access_token:string;token_expires_at:string|null}){const {error}=await supabaseAdmin().from("threads_account").upsert({id:1,...a});if(error)throw error;}
