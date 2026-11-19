import {NextRequest,NextResponse} from "next/server";
export async function POST(req:NextRequest){
 try{
  const {topic,tone,audience,keywords}=await req.json();
  if(!process.env.GEMINI_API_KEY)return NextResponse.json({error:"GEMINI_API_KEY 환경변수를 설정해주세요."},{status:503});
  if(!topic?.trim())return NextResponse.json({error:"게시물 주제를 입력해주세요."},{status:400});
  const model=process.env.GEMINI_MODEL||"gemini-2.5-flash";
  const prompt=`너는 한국 브랜드의 인스타그램 콘텐츠 전문 마케터다. 다음 조건으로 자연스럽고 매력적인 피드 캡션 1개를 한국어로 작성해라.
주제: ${topic}
톤: ${tone||"친근하고 전문적인"}
타깃: ${audience||"관심 고객"}
키워드: ${keywords||"없음"}
규칙: 첫 문장은 시선을 끄는 후킹 문장, 본문은 읽기 쉬운 짧은 문단, 과장·허위 효능 금지, 마지막은 부담 없는 행동 유도 문장, 관련 해시태그 5~10개. 제목이나 설명 없이 캡션만 출력.`;
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,{
   method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.8,maxOutputTokens:700}})
  });
  const data=await response.json();
  if(!response.ok)throw new Error(data.error?.message||"Gemini 요청에 실패했습니다.");
  const caption=data.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("").trim();
  if(!caption)throw new Error("AI 응답이 비어 있습니다.");
  return NextResponse.json({caption});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"AI 생성 오류"},{status:500});}
}
