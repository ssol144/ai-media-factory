# AI Media Factory 제품 로드맵

## 1. 현재 MVP
- 브라우저 로컬 워크스페이스: 내 계정/고객 계정 목록 구분
- Gemini 플랫폼별 콘텐츠 초안 생성
- 초안 보관함
- 브라우저 영상 업로드, 구간 자르기, 고정 자막 오버레이, WebM 내보내기
- Gemini 기반 영상 편집 기획(사용자 제공 주제/파일명/길이 입력 기반)
- 기존 Instagram/Threads 단일 계정 OAuth 코드 보존

## 2. 다음 릴리스의 필수 구현
1. Supabase Auth: 이메일 로그인, 비밀번호 재설정, 세션
2. Workspace 생성 및 초대: owner/admin/editor/viewer
3. 모든 API에서 세션 + workspace membership 검증
4. social_accounts를 통한 다중 OAuth 계정 연결
5. OAuth token encryption, refresh, revoke, audit log
6. Supabase Storage private bucket + signed upload/download
7. Publishing adapter interface와 플랫폼별 job queue
8. TikTok Content Posting API 및 YouTube Data API 연결/검수
9. 예약 발행 idempotency, retry/backoff, webhook/logs
10. 분석 데이터 수집과 제휴 링크 전환 추적

## 3. 영상 편집 고도화
- MVP: 브라우저 구간 자르기 + 자막 오버레이
- V1: 업로드 영상의 음성 전사(STT), 장면 전환 감지, AI 컷 추천
- V2: 서버 FFmpeg worker, 작업 큐, 렌더 상태, SRT/ASS 자막, 템플릿
- V3: 음성 합성, B-roll 추천, 브랜드 프리셋, 자동 리사이즈

## 4. 출시 기준
- 외부 고객 데이터 격리 테스트 통과
- 토큰이 브라우저/로그에 노출되지 않음
- 고객 위임 동의 및 연결 해제 지원
- 실제 계정 테스트에서 게시/실패/중복 방지 확인
- 플랫폼 앱 심사 및 공개 게시 권한 확인
- 비용/사용량 한도 및 개인정보/약관 준비
