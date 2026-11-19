const version = process.env.INSTAGRAM_GRAPH_VERSION || "v27.0";
const base = `https://graph.instagram.com/${version}`;

export async function igRequest(path: string, token: string, params: Record<string,string> = {}) {
  const url = new URL(`${base}/${path.replace(/^\//,"")}`);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  url.searchParams.set("access_token", token);
  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || "Instagram API 요청에 실패했습니다.");
  return data;
}
export async function publishImage(token:string, igUserId:string, imageUrl:string, caption:string) {
  const container = await igRequest(`${igUserId}/media`, token, {
    image_url:imageUrl, caption
  });
  let status = "IN_PROGRESS";
  for(let i=0;i<12;i++){
    await new Promise(r=>setTimeout(r,5000));
    const check = await igRequest(`${container.id}`, token, {fields:"status_code"});
    status = check.status_code;
    if(status === "FINISHED") break;
    if(status === "ERROR" || status === "EXPIRED") throw new Error("이미지 게시물 준비에 실패했습니다. 이미지 URL과 파일 형식을 확인해주세요.");
  }
  if(status !== "FINISHED") throw new Error("게시물 준비 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
  return igRequest(`${igUserId}/media_publish`, token, {creation_id:container.id});
}
