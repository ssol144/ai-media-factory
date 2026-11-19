import { NextRequest, NextResponse } from "next/server";

const allowed = ["instagram", "tiktok", "youtube", "threads", "naver"] as const;
type Platform = typeof allowed[number];

export async function POST(req: NextRequest) {
  try {
    const { topic, niche, audience, tone, keywords, platforms } = await req.json();
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY 환경변수를 설정해주세요." }, { status: 503 });
    if (typeof topic !== "string" || !topic.trim()) return NextResponse.json({ error: "콘텐츠 주제를 입력해주세요." }, { status: 400 });
    const selected: Platform[] = Array.isArray(platforms) ? platforms.filter((p: string): p is Platform => allowed.includes(p as Platform)) : [...allowed];
    if (!selected.length) return NextResponse.json({ error: "플랫폼을 하나 이상 선택해주세요." }, { status: 400 });
    const prompt = `너는 멀티 플랫폼 콘텐츠 전략가다. 한국어로 플랫폼별로 완전히 다른 형식의 콘텐츠를 만들어라.\n주제: ${topic}\n분야: ${niche || "일반"}\n타깃: ${audience || "관심 사용자"}\n말투: ${tone || "친근하고 신뢰감 있게"}\n키워드: ${keywords || "없음"}\n대상 플랫폼: ${selected.join(", ")}\n각 플랫폼에 맞는 콘텐츠를 만들고 JSON만 출력한다. 형식: {"items":[{"platform":"instagram|tiktok|youtube|threads|naver","title":"제목","body":"본문 또는 대본","hashtags":["태그"],"cta":"행동 유도 문구"}]}. 인스타그램은 피드 캡션, 틱톡은 30~45초 영상 대본(장면/내레이션/자막), 유튜브는 쇼츠 대본과 제목/설명, Threads는 500자 이내 대화형 글, 네이버는 검색 의도에 맞는 블로그 초안 구조로 작성한다. 사실을 지어내거나 검증되지 않은 효능·수익을 약속하지 않는다.`;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.75, responseMimeType: "application/json", maxOutputTokens: 5000 } })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Gemini 요청에 실패했습니다.");
    const raw = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("").trim();
    if (!raw) throw new Error("AI 응답이 비어 있습니다.");
    const parsed = JSON.parse(raw);
    return NextResponse.json({ items: Array.isArray(parsed.items) ? parsed.items : [] });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "콘텐츠 생성 오류" }, { status: 500 }); }
}
