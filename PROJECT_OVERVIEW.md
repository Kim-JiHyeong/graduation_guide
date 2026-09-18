# PROJECT_HANDOFF

## 1. 프로젝트 개요

순천대학교 컴퓨터공학과 졸업요건 충족 여부를 계산하는 웹앱이다. 전공 과목 이수 상태, 교양 과목 입력, 졸업자격인증제 점수를 바탕으로 현재/수강예정 포함 졸업 가능 여부를 계산하고, 계산 결과를 OpenAI 기반 AI 상담에 전달한다.

## 2. 기술 스택

- Frontend: Next.js 16 App Router, React 19, TypeScript
  - `frontend/src/app/page.tsx`에서 단일 화면 앱을 구성하고, 탭 상태에 따라 대시보드/전공/교양/AI 상담/설정을 렌더링한다.
- Styling: Tailwind CSS 4
  - `frontend/src/app/globals.css`에서 테마 색상과 폰트 변수를 정의한다.
- Frontend 저장소: 브라우저 `localStorage`
  - `frontend/src/lib/storage.ts`에서 `gradcalc:v2:data` 키로 사용자 입력 데이터를 저장한다.
- AI / 외부 서비스: OpenAI API
  - `frontend/src/app/api/chat/route.ts`에서 `openai` SDK로 `gpt-4o-mini` 채팅 완성을 호출한다.
- Backend: Express 5, Node.js ES Modules
  - `backend/src/server.js`에 인증/요건/과목/status API가 구현되어 있다.
  - 현재 프론트엔드 코드에서 이 백엔드 API를 호출하는 부분은 확인되지 않는다.
- Backend DB: `node:sqlite`의 `DatabaseSync`
  - `backend/src/db.js`에서 `backend/data/app.db` SQLite 파일을 사용한다.
- Authentication: JWT + HTTP-only cookie
  - `backend/src/auth.js`에서 `bcryptjs` 비밀번호 해시, `jsonwebtoken` 토큰 발급, `token` 쿠키 설정을 처리한다.
- 빌드/개발 도구
  - Frontend: `npm run dev`, `npm run build`, `npm run lint`
  - Backend: `npm run dev`, `npm start`
- 배포 관련
  - README에는 Vercel 권장만 언급되어 있고, 별도 Vercel 설정 파일은 없다.
  - `backend/src/server.js`의 production 정적 서빙은 `frontend/dist`를 바라보지만, 현재 프론트엔드는 Next.js라 기본 빌드 산출물이 `dist`가 아니다. 확인 필요.

## 3. 프로젝트 구조

```text
.
├─ README.md
├─ frontend/
│  ├─ package.json              # Next.js 프론트엔드 스크립트/의존성
│  ├─ .env.local.example        # OPENAI_API_KEY 예시
│  ├─ next.config.ts            # Turbopack root 설정
│  └─ src/
│     ├─ app/
│     │  ├─ layout.tsx          # HTML 레이아웃, 메타데이터, Pretendard CDN
│     │  ├─ page.tsx            # 앱 진입점, 탭 라우팅, 상태 연결
│     │  ├─ globals.css         # Tailwind CSS, 색상/폰트 테마
│     │  └─ api/chat/route.ts   # OpenAI 상담 API Route
│     ├─ components/
│     │  ├─ Onboarding.tsx      # 입학년도 선택 초기 화면
│     │  ├─ Header.tsx          # 상단 탭 네비게이션
│     │  ├─ Dashboard.tsx       # 졸업요건 계산 결과 표시
│     │  ├─ MajorCourses.tsx    # 전공 과목 이수 상태 체크
│     │  ├─ GeneralCourses.tsx  # 교양 과목 수동 입력/삭제
│     │  ├─ ChatWidget.tsx      # AI 상담 UI
│     │  └─ Settings.tsx        # 입학년도 변경
│     └─ lib/
│        ├─ types.ts            # 프론트 데이터 타입
│        ├─ defaultRequirements.ts # 2022학번 기준 졸업요건 하드코딩
│        ├─ calculate.ts        # 졸업요건 계산 로직
│        ├─ storage.ts          # localStorage 저장/갱신 함수
│        └─ formatStatus.ts     # AI에 전달할 상태 요약 문자열 생성
└─ backend/
   ├─ package.json              # Express 백엔드 스크립트/의존성
   └─ src/
      ├─ server.js              # Express 앱, API 라우팅
      ├─ auth.js                # JWT/쿠키 인증 유틸과 미들웨어
      ├─ db.js                  # SQLite 테이블 생성 및 CRUD
      ├─ calculate.js           # 백엔드용 졸업요건 계산 로직
      └─ defaultRequirements.js # 백엔드용 기본 졸업요건
```

## 4. 현재 구현된 기능

- 초기 설정 / 온보딩
  - 역할: 사용자가 22~26학번 중 입학년도를 선택해 앱 데이터를 초기화한다.
  - 관련 파일: `frontend/src/components/Onboarding.tsx`, `frontend/src/lib/storage.ts`
  - 상태: 프론트엔드 구현 완료. 서버 연결 없음. 2022학번 외 연도는 같은 템플릿을 임시 재사용한다.

- 졸업요건 계산
  - 역할: 총 졸업학점, 교양학점, 전공학점, 전공필수, 졸업자격인증제 충족 여부를 계산한다.
  - 관련 파일: `frontend/src/lib/calculate.ts`, `frontend/src/lib/defaultRequirements.ts`, `frontend/src/components/Dashboard.tsx`
  - 상태: 프론트엔드 localStorage 데이터 기준 구현. 현재 상태와 수강예정 포함 상태를 모두 계산한다.

- 전공 과목 이수 상태 관리
  - 역할: 2022학번 컴퓨터공학과 전공필수 12개, 전공선택 19개의 상태를 `미이수`, `수강예정`, `이수완료`로 관리한다.
  - 관련 파일: `frontend/src/components/MajorCourses.tsx`, `frontend/src/lib/defaultRequirements.ts`, `frontend/src/lib/storage.ts`
  - 상태: 프론트엔드 구현 완료. localStorage 저장.

- 교양 과목 관리
  - 역할: 과목명, 학점, 상태를 직접 입력하고 삭제/상태 변경한다.
  - 관련 파일: `frontend/src/components/GeneralCourses.tsx`, `frontend/src/lib/storage.ts`
  - 상태: 프론트엔드 구현 완료. localStorage 저장.

- 졸업자격인증제 점수 입력
  - 역할: 인성·예술·체육, 지역·해외봉사, 컴퓨터·정보화, 외국어 4개 영역 중 하나 이상 100점이면 충족으로 계산한다.
  - 관련 파일: `frontend/src/components/Dashboard.tsx`, `frontend/src/lib/defaultRequirements.ts`, `frontend/src/lib/calculate.ts`
  - 상태: 프론트엔드 구현 완료. localStorage 저장.

- AI 졸업 상담
  - 역할: 프론트에서 계산한 상태 요약과 사용자 질문을 `/api/chat`으로 보내고, OpenAI 응답을 표시한다.
  - 관련 파일: `frontend/src/components/ChatWidget.tsx`, `frontend/src/app/api/chat/route.ts`, `frontend/src/lib/formatStatus.ts`
  - 상태: 프론트엔드와 Next API Route 연결 구현. `OPENAI_API_KEY`가 필요하다.

- 회원가입 / 로그인 / 로그아웃
  - 역할: 학번, 이름, 비밀번호로 가입하고 JWT 쿠키 기반 인증을 처리한다.
  - 관련 파일: `backend/src/server.js`, `backend/src/auth.js`, `backend/src/db.js`
  - 상태: 백엔드 API만 구현. 현재 프론트엔드와 연결되어 있지 않다.

- 백엔드 사용자별 요건/과목 CRUD 및 status 계산
  - 역할: 인증된 사용자별 requirements와 courses를 SQLite에 저장하고 졸업 상태를 계산한다.
  - 관련 파일: `backend/src/server.js`, `backend/src/db.js`, `backend/src/calculate.js`
  - 상태: 백엔드 API만 구현. 현재 프론트엔드와 연결되어 있지 않다. `backend/data` 디렉터리가 없으면 DB open 실패.

## 5. 주요 데이터 흐름

```text
프론트 초기화
Onboarding 입학년도 선택
→ storage.initData(year)
→ defaultRequirements.buildRequirements(year)
→ StudentData 생성
→ localStorage("gradcalc:v2:data") 저장
→ page.tsx 상태 갱신
```

```text
졸업요건 계산
page.tsx에서 localStorage 데이터 로드
→ calculateStatus(requirements, majorCourseStatus, generalCourses, false)
→ calculateStatus(..., true)
→ Dashboard에 현재/수강예정 포함 결과 전달
```

```text
AI 상담
ChatWidget 질문 입력
→ formatStatusSummary(current, projected)로 계산 결과 요약
→ POST /api/chat
→ Next API Route가 OPENAI_API_KEY로 OpenAI 호출
→ 응답을 ChatWidget 메시지 목록에 추가
```

```text
백엔드 로그인 흐름
POST /api/auth/login
→ SQLite users 테이블에서 student_id 조회
→ bcryptjs로 비밀번호 검증
→ JWT 생성
→ HTTP-only token 쿠키 설정
→ 이후 authMiddleware가 쿠키 토큰 검증
```

## 6. API 구조

### Frontend Next API Route

| Method | Endpoint | 기능 | 관련 파일 |
| --- | --- | --- | --- |
| POST | `/api/chat` | 질문과 졸업요건 상태 요약을 받아 OpenAI 응답 생성 | `frontend/src/app/api/chat/route.ts` |

### Express Backend API

현재 백엔드에는 아래 API가 구현되어 있지만, 프론트엔드 코드에서 호출되는 부분은 확인되지 않는다.

| Method | Endpoint | 기능 | 관련 파일 |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | 사용자 생성, 기본 졸업요건 생성, JWT 쿠키 설정 | `backend/src/server.js`, `backend/src/db.js`, `backend/src/auth.js` |
| POST | `/api/auth/login` | 학번/비밀번호 로그인, JWT 쿠키 설정 | `backend/src/server.js`, `backend/src/auth.js` |
| POST | `/api/auth/logout` | 인증 쿠키 삭제 | `backend/src/server.js`, `backend/src/auth.js` |
| GET | `/api/auth/me` | 현재 로그인 사용자 조회 | `backend/src/server.js`, `backend/src/auth.js` |
| GET | `/api/requirements` | 로그인 사용자의 졸업요건 조회 | `backend/src/server.js`, `backend/src/db.js` |
| PUT | `/api/requirements` | 로그인 사용자의 졸업요건 저장 | `backend/src/server.js`, `backend/src/db.js` |
| GET | `/api/courses` | 로그인 사용자의 과목 목록 조회 | `backend/src/server.js`, `backend/src/db.js` |
| POST | `/api/courses` | 로그인 사용자의 과목 추가 | `backend/src/server.js`, `backend/src/db.js` |
| PUT | `/api/courses/:id` | 로그인 사용자의 과목 수정 | `backend/src/server.js`, `backend/src/db.js` |
| DELETE | `/api/courses/:id` | 로그인 사용자의 과목 삭제 | `backend/src/server.js`, `backend/src/db.js` |
| GET | `/api/status` | 로그인 사용자의 요건/과목 기반 졸업 상태 계산 | `backend/src/server.js`, `backend/src/calculate.js` |

## 7. 데이터베이스 구조

### Frontend localStorage 데이터

`frontend/src/lib/types.ts` 기준:

- `StudentData`
  - `requirements`: 졸업요건 템플릿
  - `majorCourseStatus`: 전공 과목 ID별 `completed` 또는 `planned`
  - `generalCourses`: 사용자가 입력한 교양 과목 목록
- `Requirements`
  - 학과, 입학년도, 검증 여부, 총/교양/전공/전공필수 요구 학점, 전공 과목 목록, 졸업자격인증제 영역
- `GeneralCourseEntry`
  - `id`, `name`, `credits`, `status`

### Backend SQLite

`backend/src/db.js` 기준:

- `users`
  - `id` PK, `student_id` UNIQUE, `name`, `password_hash`, `created_at`
- `requirements`
  - `user_id` PK, `data` JSON 문자열
  - `user_id`는 `users(id)`를 참조한다.
- `courses`
  - `id` PK, `user_id`, `name`, `category_id`, `credits`, `semester`
  - `user_id`는 `users(id)`를 참조한다.

주의: `backend/data/app.db`를 사용하도록 되어 있지만 `backend/data` 디렉터리가 현재 없어서 DB import 시 `unable to open database file`이 발생한다.

## 8. 환경 변수 및 설정

```text
OPENAI_API_KEY
- frontend/src/app/api/chat/route.ts에서 OpenAI API 호출에 사용.
- frontend/.env.local.example에 이름만 존재.

PORT
- backend/src/server.js에서 Express 서버 포트로 사용.
- 기본값: 4000

FRONTEND_ORIGIN
- backend/src/server.js에서 CORS origin으로 사용.
- 기본값: http://localhost:5173
- 현재 Next dev 기본 포트는 3000이므로 백엔드 연동 시 확인 필요.

JWT_SECRET
- backend/src/auth.js에서 JWT 생성/검증에 사용.
- 없으면 dev-only-secret-change-me 기본값 사용.
- production에서 없으면 경고 로그 출력.

NODE_ENV
- backend/src/auth.js에서 쿠키 secure 옵션과 production 경고에 사용.
- backend/src/server.js에서 production 정적 파일 서빙 조건에 사용.
```

## 9. 프로젝트 실행 방법

### 사전 준비

- Node.js / npm
- Backend 실행 시 `node:sqlite`를 지원하는 Node.js 버전 필요. 현재 코드에서 정확한 `engines` 조건은 지정되어 있지 않다.
- AI 상담 사용 시 OpenAI API Key 필요.

### Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
# .env.local에 OPENAI_API_KEY 입력. AI 상담을 쓰지 않으면 비워도 다른 기능은 동작 가능.
npm run dev
```

- 기본 접속: `http://localhost:3000`
- 검증 결과: `npm run build` 성공.
- 검증 결과: `npm run lint`는 `frontend/src/app/page.tsx`의 `react-hooks/set-state-in-effect` 규칙 위반으로 실패.

### Backend

```bash
cd backend
npm install
mkdir data
npm run dev
```

- 기본 접속: `http://localhost:4000`
- `backend/data` 디렉터리를 만들지 않으면 `backend/src/db.js`에서 SQLite 파일을 열지 못한다.
- 현재 프론트엔드는 이 백엔드 API를 호출하지 않는다.

## 10. 미완성 / TODO / 주의할 부분

- 학번별 요건 분리 TODO
  - `frontend/src/lib/defaultRequirements.ts`에 “추후 학번별로 실제 교육과정이 다르면 연도별 템플릿을 분리” TODO가 있다.
  - 현재 2022학번만 검증된 것으로 표시하고, 2023~2026학번은 같은 템플릿을 임시 재사용한다.
- 프론트엔드와 백엔드 미연결
  - 프론트엔드는 `localStorage`와 Next `/api/chat`만 사용한다.
  - Express 백엔드의 인증/SQLite API는 구현되어 있으나 호출 코드가 없다.
- 백엔드 DB 디렉터리 누락
  - `backend/src/db.js`는 `backend/data/app.db`를 열지만 `backend/data` 디렉터리가 없다.
  - 실제 확인 시 `unable to open database file` 발생.
- 백엔드 CORS 기본 origin 불일치 가능성
  - `FRONTEND_ORIGIN` 기본값은 `http://localhost:5173`인데, Next dev 기본 포트는 `3000`이다.
- Backend production static serving 확인 필요
  - `backend/src/server.js`는 production에서 `frontend/dist`를 서빙하지만, 현재 frontend는 Next.js 프로젝트다.
- Lint 실패
  - `frontend/src/app/page.tsx`의 `useEffect`에서 `setData`와 `setReady`를 동기 호출해 ESLint `react-hooks/set-state-in-effect` 에러가 발생한다.
- 테스트 없음
  - `frontend/package.json`, `backend/package.json` 모두 test script가 없다.
- 데이터 하드코딩
  - 졸업요건, 전공 과목, 졸업자격인증제 설명이 `frontend/src/lib/defaultRequirements.ts`와 `backend/src/defaultRequirements.js`에 하드코딩되어 있다.
- OpenAI API Key 필요
  - `OPENAI_API_KEY`가 없으면 `/api/chat`은 500 응답을 반환한다.
- 백엔드 `node:sqlite`
  - Node.js 내장 SQLite API는 실행 시 ExperimentalWarning을 출력한다.
- Git 소유권 보호
  - 일반 `git status`는 dubious ownership 오류가 발생했다. `git -c safe.directory=C:/graduation_guide ...`로는 확인 가능했다.

## 11. 다음 개발자가 먼저 볼 파일

1. `frontend/src/app/page.tsx`
   - 프론트 앱의 상태 로딩, 탭 전환, 주요 컴포넌트 연결을 한 번에 볼 수 있다.
2. `frontend/src/lib/types.ts`
   - 프론트에서 사용하는 핵심 데이터 모델이 정의되어 있다.
3. `frontend/src/lib/defaultRequirements.ts`
   - 현재 졸업요건과 전공 과목 데이터의 실제 출처이자 하드코딩 지점이다.
4. `frontend/src/lib/calculate.ts`
   - 졸업 가능 여부를 판정하는 핵심 계산 로직이다.
5. `frontend/src/lib/storage.ts`
   - localStorage 저장 구조와 모든 데이터 변경 함수가 모여 있다.
6. `frontend/src/components/Dashboard.tsx`
   - 계산 결과가 사용자에게 어떻게 표시되고 인증제 점수가 어떻게 입력되는지 확인할 수 있다.
7. `frontend/src/components/ChatWidget.tsx`
   - AI 상담 UI와 `/api/chat` 호출 흐름을 확인할 수 있다.
8. `frontend/src/app/api/chat/route.ts`
   - OpenAI API 호출 방식과 프롬프트 정책이 들어 있다.
9. `backend/src/server.js`
   - Express 백엔드 API 전체 라우팅을 볼 수 있다.
10. `backend/src/db.js`
    - 백엔드 SQLite 스키마와 CRUD 구현을 확인할 수 있다.
