const base = "https://graph.threads.net/v1.0";
export async function threadsRequest(path:string, token:string, params:Record<string,string>={}){
 const url=new URL(`${base}/${path.replace(/^\//,"")}`);
 Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
 url.searchParams.set("access_token",token);
 const res=await fetch(url.toString(),{cache:"no-store"}); const data=await res.json();
 if(!res.ok||data.error)throw new Error(data.error?.message||"Threads API 요청에 실패했습니다.");
 return data;
}
export async function publishThread(token:string,userId:string,text:string){
 const form=new URLSearchParams({media_type:"TEXT",text,access_token:token});
 const res=await fetch(`${base}/${userId}/threads`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:form});
 const container=await res.json(); if(!res.ok||container.error)throw new Error(container.error?.message||"Threads 게시물 생성 실패");
 const publish=new URLSearchParams({creation_id:container.id,access_token:token});
 const done=await fetch(`${base}/${userId}/threads_publish`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:publish});
 const result=await done.json();if(!done.ok||result.error)throw new Error(result.error?.message||"Threads 발행 실패");return result;
}
