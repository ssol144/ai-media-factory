import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { filename, duration, topic, goal, platform } = await req.json();
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY 환경변수를 설정해주세요." }, { status: 503 });
    if (!topic?.trim()) return NextResponse.json({ error: "영상 주제나 내용을 입력해주세요." }, { status: 400 });
    const prompt = `한국어 숏폼 영상 편집 디렉터다. 영상 파일 자체를 직접 분석했다고 주장하지 말고, 사용자가 제공한 정보만 바탕으로 편집안을 작성한다. 파일명:${filename || "미입력"}, 길이:${duration || "미확인"}초, 주제:${topic}, 목표:${goal || "시청 지속시간 향상"}, 플랫폼:${platform || "공통 9:16"}. JSON만 반환: {"hook":"첫 2초 후킹","title":"영상 제목","caption":"게시 캡션","subtitles":[{"time":"00:00-00:03","text":"화면 자막"}],"editPlan":[{"step":1,"action":"컷 편집 지시","reason":"이유"}],"coverText":"썸네일 문구","hashtags":["태그"]}. 과장·허위·근거 없는 수치 금지. 30~45초 숏폼에 적합하게 구성.`;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, responseMimeType: "application/json", maxOutputTokens: 3000 } }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || "Gemini 요청 실패");
    const raw = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("").trim();
    if (!raw) throw new Error("AI 응답이 비어 있습니다.");
    return NextResponse.json({ plan: JSON.parse(raw) });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "영상 편집안 생성 오류" }, { status: 500 }); }
}
