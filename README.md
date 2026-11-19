# AI Media Factory — 멀티채널 콘텐츠 운영 스튜디오

기존 InstaFlow AI 프로젝트를 기반으로 확장한 Next.js 15 / React 19 MVP입니다. Gemini로 하나의 주제를 Instagram·TikTok·YouTube Shorts·Threads·Naver Blog 형식으로 재가공하고, 브라우저에서 영상 구간 자르기와 자막 오버레이를 적용해 WebM으로 내보낼 수 있습니다.

> **중요한 구현 범위 안내**: ZIP만으로 Meta/TikTok/YouTube 계정이 자동 연결되거나 게시되는 것은 아닙니다. 플랫폼별 개발자 앱, OAuth 권한, 검수와 계정 유형 설정이 필요합니다. 현재 신규 멀티계정 화면의 계정 목록과 콘텐츠 보관함은 브라우저 localStorage 데모입니다. 기존 Instagram·Threads OAuth 및 예약 발행 코드는 단일 계정 기반으로 유지했습니다. TikTok·YouTube의 실제 OAuth/게시 어댑터, 신규 멀티테넌트 인증/권한 연결은 다음 개발 단계입니다. 고객에게 판매 가능한 완성 SaaS라고 간주하지 마세요.

## 1. 포함된 기능

- 기존 Instagram 및 Threads 단일 계정 OAuth/게시 API 유지
- Gemini 기반 플랫폼별 콘텐츠 재가공 API (`/api/ai/repurpose`)
- AI 영상 편집 기획/후킹/자막 제안 API (`/api/ai/video-plan`)
- 브라우저 영상 미리보기, 시작/종료 구간 지정, 고정 자막 오버레이, WebM 내보내기
- 내 계정/고객 계정 분류를 지원하는 계정 운영 목록 (현재 브라우저 로컬 저장)
- 분야별 콘텐츠 생성: AI·IT, 제품 추천, 재테크, 맛집·여행 등
- 초안 보관함
- Supabase 멀티워크스페이스 DB 설계 초안 (`supabase/workspace_schema.sql`)

## 2. 로컬 실행 (Windows PowerShell)

Node.js 20 이상 권장.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## 3. 환경변수

`.env.local` 파일을 만들고 다음 값을 설정합니다.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
CRON_SECRET=긴_임의_문자열
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
INSTAGRAM_GRAPH_VERSION=v27.0
THREADS_APP_ID=
THREADS_APP_SECRET=
THREADS_REDIRECT_URI=http://localhost:3000/api/threads/callback
```

- AI 콘텐츠 제작은 `GEMINI_API_KEY`가 있어야 작동합니다.
- Supabase와 Meta 연결을 아직 하지 않아도 대시보드 및 로컬 콘텐츠 기능은 확인할 수 있습니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용입니다. `NEXT_PUBLIC_`를 붙이거나 GitHub에 올리면 안 됩니다.
- API 모델명과 Meta Graph API 버전은 실제 계정/프로젝트에서 지원하는 값을 공식 콘솔에서 확인하세요.

## 4. Supabase 설정

1. Supabase 프로젝트 생성
2. 기존 Instagram/Threads 예약 발행 기능을 사용할 경우 SQL Editor에서 `supabase/schema.sql` 실행
3. 향후 사용자/고객 워크스페이스를 위한 테이블 설계는 `supabase/workspace_schema.sql` 실행
4. Project Settings → API에서 URL 및 service_role 키를 확인해 서버 환경변수에 입력
5. 영상 파일을 영구 저장하려면 Storage에 비공개 `media` 버킷을 만들고 사용자별 경로 정책을 추가해야 합니다.

`workspace_schema.sql`은 다중 워크스페이스 데이터 모델 및 RLS 기초 정책입니다. 현재 UI는 Supabase Auth 로그인과 이 테이블을 아직 연결하지 않았습니다. 외부 고객을 받기 전에 로그인, 멤버 초대, 역할별 접근 검증, 토큰 암호화/키 관리, 파일 스토리지 정책을 구현하고 보안 테스트해야 합니다.

## 5. Gemini 설정

Google AI Studio에서 API 키를 발급해 `GEMINI_API_KEY`에 넣습니다. 기본 모델은 `gemini-2.5-flash`입니다. 키는 브라우저 코드에 넣지 말고 서버 환경변수로만 관리합니다.

## 6. Instagram / Threads 연결

기존 OAuth 라우트가 포함되어 있습니다. Meta for Developers에서 앱과 Instagram/Threads API 사용 사례를 설정하고, 정확한 Redirect URI 및 권한을 등록해야 합니다. 실제 권한은 앱 검수와 계정 유형에 따라 달라집니다.

- Instagram callback: `/api/instagram/callback`
- Threads callback: `/api/threads/callback`
- 로컬 Redirect URI 예: `http://localhost:3000/api/instagram/callback`
- 배포 Redirect URI 예: `https://YOUR_DOMAIN/api/instagram/callback`

공식 문서:
- https://developers.facebook.com/docs/instagram-platform/
- https://developers.facebook.com/docs/threads/

## 7. TikTok / YouTube / Naver 안내

- **TikTok:** Content Posting API 사용을 위한 개발자 앱, OAuth, 게시 권한 및 검수/감사가 필요할 수 있습니다. 현재 이 프로젝트는 TikTok용 콘텐츠 초안을 만들지만 실제 게시 어댑터는 포함하지 않습니다. https://developers.tiktok.com/doc/content-posting-api-get-started/
- **YouTube:** YouTube Data API의 OAuth 및 videos.insert 구현과 API 할당량 관리가 필요합니다. 현재는 쇼츠 대본/설명 초안만 생성합니다. https://developers.google.com/youtube/v3/docs/videos/insert
- **Naver Blog:** 공식 외부 글쓰기 API 종료로 자동 발행하지 않습니다. AI 초안 생성 후 네이버에서 직접 검토/발행합니다.

## 8. 영상 편집 기능의 범위와 한계

현재 영상 편집은 브라우저 내장 Video/Canvas/MediaRecorder를 사용합니다.

- 영상 파일 선택 및 미리보기
- 시작/종료 구간 지정
- 텍스트 자막 오버레이
- WebM 파일 내보내기
- Gemini가 사용자가 입력한 주제/파일명/영상 길이를 바탕으로 후킹, 자막, 컷 편집 아이디어 제안

Gemini가 업로드 영상의 실제 프레임/음성을 분석하거나 자동으로 장면을 자르고, 배경 제거·AI 음성·음악 싱크를 하는 기능은 포함되지 않았습니다. 현재 AI 편집안은 메타정보와 사용자 설명을 바탕으로 만든 편집 지시입니다. 영상 인코딩은 브라우저와 기기 성능에 영향을 받고, 일부 브라우저에서는 오디오 트랙이 빠질 수 있습니다. 긴 영상이나 대용량 파일은 로컬 PC에서 처리하는 편이 안전합니다.

## 9. Vercel 배포

1. 프로젝트 폴더를 GitHub 새 저장소에 업로드
2. Vercel → Add New → Project에서 저장소 Import
3. Framework Preset은 Next.js 자동 감지 확인
4. Settings → Environment Variables에 `.env.local`의 서버 환경변수 입력
5. `NEXT_PUBLIC_APP_URL` 및 Meta Redirect URI를 배포 도메인으로 수정
6. Deploy 실행
7. Meta 앱의 Redirect URI에도 배포 도메인 등록
8. 배포 URL에서 AI 생성, OAuth, 예약 발행을 각각 테스트

Vercel Cron은 플랜별 실행 주기/사용량 제한을 확인해야 합니다. 예약 발행은 Meta 토큰과 권한이 정상일 때만 실행됩니다.

## 10. Windows에서 GitHub 업로드

```powershell
git init
git add .
git commit -m "Initial AI Media Factory MVP"
git branch -M main
git remote add origin https://github.com/YOUR_ID/ai-media-factory.git
git push -u origin main
```

`.env.local`은 `.gitignore`에 포함되어 있어야 하며 절대 커밋하지 마세요.

## 11. 배포 전/고객 공개 전 필수 작업

- Supabase Auth 로그인/회원가입 및 이메일 확인
- workspace_id 기준 모든 API의 서버 권한 검증
- 고객 계정 위임 동의/철회 및 역할별 권한
- OAuth 토큰 암호화 저장, 갱신/폐기/재연결
- Instagram/Threads의 단일 계정 테이블을 다중 계정 구조로 이전
- TikTok/YouTube OAuth 및 실제 게시 API 구현과 앱 검수
- 파일 업로드 Storage 경로 정책, 크기/형식 제한, 악성 파일 검사
- 영상 서버 렌더링/작업 큐/비용 제한 (필요 시 FFmpeg 워커)
- 중복 발행 방지, 재시도, 웹훅/감사 로그
- 결제, 사용량 제한, 이용약관, 개인정보 처리방침
- 플랫폼별 자동화 정책 준수 및 실제 게시 전 사용자 승인 옵션

## 12. 검증

```powershell
npm run build
```

외부 API 키/Meta 앱 설정이 없으면 실제 OAuth/발행 테스트는 불가능합니다. 배포 후 반드시 테스트 계정과 비공개/검토 게시물로 검증하세요.
