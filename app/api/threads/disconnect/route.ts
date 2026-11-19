import {NextResponse} from "next/server";import {supabaseAdmin} from "@/lib/supabase";
export async function POST(){try{const {error}=await supabaseAdmin().from("threads_account").delete().eq("id",1);if(error)throw error;return NextResponse.json({ok:true})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"연결 해제 실패"},{status:500})}}
