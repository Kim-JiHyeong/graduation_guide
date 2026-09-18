# PROJECT_OVERVIEW

> 이 문서는 README가 아니라 현재 소스 코드와 `resources/`의 교육과정 PDF를 기준으로 정리한 개발 인수인계 문서다. 마지막 확인 기준은 2026-09-19이다.

## 1. 프로젝트 개요

컴퓨터공학과 학생이 이수한 전공·교양 과목과 인증 점수를 입력해 현재 및 수강예정 기준 졸업요건 충족 상태를 확인하는 Next.js 웹 애플리케이션이다. 브라우저 `localStorage`에 데이터를 저장하며, Gemini 기반 졸업요건 질의 기능도 제공한다.

현재 실제 화면은 프론트엔드만으로 동작한다. 저장소의 Express/SQLite 백엔드는 별도 초기 구현이며 프론트엔드와 연결되어 있지 않다.

## 2. 기술 스택

### Frontend

- **Next.js 16 / App Router**: 단일 페이지 UI와 `/api/chat` 서버 라우트 제공
- **React 19 + TypeScript**: 화면, 상태 및 졸업요건 타입 관리
- **Tailwind CSS 4**: 컴포넌트 스타일링
- **Google Gen AI SDK (`@google/genai`)**: Gemini 질의 API 호출
- **Browser localStorage**: 사용자 입력과 과목 상태 영구 저장
- **ESLint**: 정적 검사

### Backend

- **Node.js + Express 5**: 회원, 과목, 졸업요건 API의 별도 구현
- **SQLite (`node:sqlite`)**: 사용자·과목·요건 데이터 저장
- **JWT + bcryptjs**: 쿠키 기반 인증과 비밀번호 해시
- **CORS / cookie-parser**: 교차 출처 및 쿠키 처리

백엔드는 현재 Next.js 화면에서 호출되지 않는다. 프론트엔드의 데이터 모델과 계산 규칙도 백엔드 구현보다 더 확장된 상태다.

### 교육과정 원본

- `resources/2022_curriculum.pdf`: 2022학번 졸업요건과 교양 교과목
- `resources/all_curriculum.pdf`: 2022~2026 교육과정 및 2026 전공 대표명·목록 검증
- `resources/Major_Course_Equivalents.pdf`: 전공 동일·대체교과목 관계

### 배포

- 별도 배포 설정 파일은 없다.
- Next.js 기본 production build/start 스크립트만 제공한다.
- 백엔드의 `frontend/dist` 정적 제공 코드는 Next.js의 `.next` 산출물과 호환되지 않는다.

## 3. 프로젝트 구조

```text
graduation_guide/
├─ frontend/                         # 현재 실제 사용자 화면
│  ├─ src/app/
│  │  ├─ page.tsx                    # 앱 진입점, 전체 상태와 탭 전환
│  │  ├─ globals.css                 # 전역 색상·폰트·대형 화면 배율
│  │  └─ api/chat/route.ts           # Gemini 프록시 API
│  ├─ src/components/
│  │  ├─ Dashboard.tsx               # 현재/예정 이수 현황과 미충족 요건
│  │  ├─ MajorCourses.tsx            # 전공 목록, 동일·대체, 현장실습
│  │  ├─ GeneralCourses.tsx          # 교양 목록과 예외 직접 입력
│  │  ├─ CourseStatusPicker.tsx       # 공통 과목 상태 선택기
│  │  ├─ CourseSearchBar.tsx          # 공통 검색 입력 UI
│  │  ├─ ChatWidget.tsx               # 졸업요건 AI 질의 UI
│  │  ├─ Onboarding.tsx               # 최초 학번 선택
│  │  └─ Settings.tsx                 # 스쿨·학과·입학연도 변경
│  ├─ src/hooks/useCourseSearch.ts    # 검색, 이동, 펼침, 강조 공통 로직
│  └─ src/lib/
│     ├─ defaultRequirements.ts       # 졸업요건·전공·교양 기준 데이터
│     ├─ majorCourseEquivalents.ts    # 동일·대체교과목 데이터
│     ├─ calculate.ts                 # 모든 졸업요건 계산
│     ├─ storage.ts                   # localStorage 저장·마이그레이션
│     ├─ types.ts                     # 도메인 타입
│     └─ formatStatus.ts              # AI 전달용 현황 문자열
├─ backend/                           # 프론트와 미연결된 Express API
│  └─ src/
│     ├─ server.js                    # 서버 진입점과 API 라우팅
│     ├─ auth.js                      # JWT 인증 미들웨어
│     ├─ db.js                        # SQLite 초기화·스키마
│     ├─ calculate.js                 # 백엔드용 구형 계산 로직
│     └─ defaultRequirements.js       # 백엔드용 기본 요건
└─ resources/                         # 교육과정 원본 PDF
```

## 4. 현재 구현된 기능

### 초기 설정과 저장

- 최초 접속 시 입학연도(2022~2026)를 선택한다.
- 모든 프론트엔드 데이터는 `gradcalc:v2:data` 키로 `localStorage`에 저장한다.
- 이전 저장 데이터에 새 필드가 없으면 로딩 시 기본값을 채운다.
- 입학연도 변경 시 과목 상태는 유지하고 요건 객체를 다시 생성한다.
- 설정에서 7개 스쿨·대학과 소속 학과·전공을 연동 드롭다운으로 선택하며 해당 값을 저장한다.
- 현재 졸업요건 계산이 검증된 조합은 컴퓨터공학전공 2022학번뿐이며, 다른 조합에는 미지원 안내를 표시한다.

### 전공 교과목

- 34개 대표 과목을 전공필수 12개, 전공선택 22개로 표시한다.
- 졸업요건 구분은 2022학번 기준을 유지하면서 표시명·코드는 확인된 최신 2026 교육과정을 대표값으로 사용한다.
- 18개 대표 그룹에 30개 동일·대체 항목이 연결되어 있다.
- 관계가 있는 과목만 펼침 UI가 나타나며, 이전 과목의 상태를 개별 입력할 수 있다.
- 이전 과목 이수도 대표 과목의 필수요건을 충족할 수 있지만 대표 필수학점은 한 그룹당 한 번만 계산한다.
- `현장실습`은 별도 전공선택 항목으로 항상 학점 입력란을 표시하며, 입력 학점을 전공 및 총 학점에 반영한다.
- 대표명과 동일·대체 과목명을 모두 검색한다. 검색 시 그룹을 자동으로 펼치고 과목 위치로 이동하며, 사용자가 해당 항목을 클릭할 때까지 강조한다.
- 전공 초기화는 대표·동일대체 상태와 현장실습 입력을 함께 비운다.

### 교양 교과목

- PDF에서 정리한 205개 교양 과목을 12개 영역으로 그룹화한다.
- 화면에는 과목명·학점·상태를 표시하고 과목코드는 숨긴다.
- 목록에 없는 과목은 이름, 학점, 구분, 상태를 직접 입력할 수 있다.
- 직접 입력 구분은 12개 교양 영역과 `일반선택`을 제공한다.
- 직접 입력 과목도 검색, 상태 변경, 삭제가 가능하다.
- 교양 초기화는 카탈로그 상태와 직접 입력 과목을 함께 비운다.

### 대시보드와 졸업 판정

- `현재 이수`와 `수강예정 포함` 기준을 전환한다.
- 총 졸업학점, 전공학점, 전공필수, 교양학점, 공통교양, 심화교양, 일반선택을 표시한다.
- 일반선택은 입력 학점을 보여주되 최대 20학점만 총 졸업학점에 반영한다.
- 미이수 전공필수와 미충족 교양요건을 별도 목록으로 표시한다.
- 인증 점수는 4개 영역 중 하나라도 100점 이상이면 충족으로 판정한다.
- 1600px 이상 화면에서는 루트 글자 크기를 110%로 적용해 전체 `rem` 기반 UI를 확대한다.

### Gemini 질의

- 화면에서 계산한 졸업요건 요약과 사용자 질문을 `/api/chat`으로 전송한다.
- 기본 모델은 `gemini-3.6-flash`, 503 발생 시 `gemini-3.5-flash-lite`를 한 번 시도한다.
- 모델에는 전달된 계산 결과를 임의로 다시 계산하거나 없는 규정을 만들지 않도록 시스템 지시를 제공한다.
- 두 모델 모두 혼잡하면 사용자에게 재시도 가능한 503 응답을 반환한다.

### 별도 Express 백엔드

- 회원가입, 로그인/로그아웃, 현재 사용자 조회
- 사용자별 졸업요건 조회·수정
- 사용자별 과목 CRUD
- 백엔드 자체 졸업상태 계산

위 기능은 코드에 존재하지만 현재 Next.js 앱에서는 사용하지 않는다.

## 5. 핵심 데이터와 계산 규칙

### 전공 데이터

- 대표 과목: `MajorCourseDef`
- 동일·대체 과목: `MajorCourseEquivalent`
- 대표 상태: `majorCourseStatus[course.id]`
- 동일·대체 상태: `majorCourseStatus[equivalent.statusId]`
- 현장실습: `fieldTraining = { credits, status }`

전공 총 학점은 선택된 대표 과목, 선택된 동일·대체 과목, 현장실습 학점을 합산한다. 동일·대체 과목은 각각 실제 이수 학점을 반영하지만, 전공필수 충족 학점은 대표 그룹별로 중복 계산하지 않는다.

### 교양 데이터

- 카탈로그 과목: `GeneralCourseDef`
- 카탈로그 상태: `generalCourseStatus[course.id]`
- 직접 입력: `GeneralCourseEntry[]`
- 영역 구분: `areaId`, `areaName`

직접 입력 과목은 해당 영역 학점 합계에는 반영된다. 다만 과목코드가 없으므로 특정 지정 과목 이수 조건을 대신 충족하지는 못한다.

### 현재 적용 요건

| 항목 | 기준 |
| --- | ---: |
| 총 졸업학점 | 130학점 |
| 전공 | 70학점 |
| 전공필수 | 36학점 |
| 교양 | 30학점 |
| 공통교양 | 15학점 |
| 심화교양 | 15학점 |
| 일반선택 총학점 반영 상한 | 20학점 |

공통교양 세부 조건:

- 대학생활과목표설정 1학점
- 독서와표현 2학점
- 사고와글쓰기 또는 정량적사고와컴퓨팅사고 중 하나 2학점
- 핵심/인문학 3학점 이상
- 핵심/사회과학 3학점 이상
- 글로벌의사소통 2학점 이상
- 인성 2학점 이상
- 핵심/자연과학은 최소 조건 없음

심화교양은 총 15학점 이상이어야 하며, 컴퓨터공학과 지정 과목인 `자바프로그래밍` 3학점과 `컴퓨터개념및실습` 3학점도 각각 이수해야 한다.

### 총 학점 산식

```text
총 반영 학점
= 전공 학점
+ 교양 학점
+ min(일반선택 학점, 20)
```

`현재 이수`는 `completed`만, `수강예정 포함`은 `completed`와 `planned`를 계산한다.

## 6. 주요 데이터 흐름

```text
앱 시작
page.tsx
→ loadData()
→ localStorage 데이터 보정 또는 initData()
→ calculateStatus(..., includePlanned=false/true)
→ Dashboard 렌더링
```

```text
전공/교양 상태 변경
CourseStatusPicker
→ storage.ts의 상태 변경 함수
→ localStorage 저장
→ page.tsx 상태 갱신
→ calculateStatus 재실행
→ 대시보드 즉시 갱신
```

```text
동일·대체 과목 이수
MajorCourses의 펼침 목록에서 상태 선택
→ equivalent.statusId로 저장
→ 실제 과목 학점은 전공학점에 합산
→ satisfiesRequired 관계면 대표 필수요건 충족
→ 같은 대표 필수학점은 한 번만 반영
```

```text
AI 질문
ChatWidget
→ formatStatusForAI()로 계산 결과 요약
→ POST /api/chat
→ Gemini 기본 모델 호출
→ 503이면 폴백 모델 호출
→ 답변 표시
```

## 7. API 구조

### Next.js API

| Method | Endpoint | 기능 | 관련 파일 |
| --- | --- | --- | --- |
| POST | `/api/chat` | Gemini에 졸업요건 현황과 질문 전달 | `frontend/src/app/api/chat/route.ts` |

요청은 `{ question, statusSummary }`, 성공 응답은 `{ answer }` 형식이다. 입력 누락은 400, 키 누락과 일반 호출 실패는 500, 모델 혼잡은 503으로 반환한다.

### Express API

| Method | Endpoint | 기능 | 인증 |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | 회원가입 | 불필요 |
| POST | `/api/auth/login` | 로그인 및 JWT 쿠키 발급 | 불필요 |
| POST | `/api/auth/logout` | 인증 쿠키 삭제 | 불필요 |
| GET | `/api/auth/me` | 현재 사용자 조회 | 필요 |
| GET | `/api/requirements` | 사용자 졸업요건 조회 | 필요 |
| PUT | `/api/requirements` | 사용자 졸업요건 수정 | 필요 |
| GET | `/api/courses` | 사용자 과목 목록 조회 | 필요 |
| POST | `/api/courses` | 과목 추가 | 필요 |
| PUT | `/api/courses/:id` | 과목 수정 | 필요 |
| DELETE | `/api/courses/:id` | 과목 삭제 | 필요 |
| GET | `/api/status` | 백엔드 기준 졸업상태 계산 | 필요 |

## 8. 저장소 및 데이터베이스

### 현재 프론트엔드 저장 구조

```text
localStorage["gradcalc:v2:data"]
├─ requirements
│  ├─ school / department / admissionYear
│  └─ certificationAreas             # 영역 정의와 사용자가 입력한 점수
├─ majorCourseStatus
├─ generalCourseStatus
├─ generalCourses
└─ fieldTraining
```

- 서버 동기화와 사용자 계정 연동은 없다.
- 브라우저 또는 사이트 데이터를 삭제하면 입력 내용이 사라진다.
- 저장 구조 변경에 대비한 기본값 보정은 있으나 명시적인 버전별 마이그레이션 체계는 없다.

### Express SQLite 구조

`backend/src/db.js`가 다음 테이블을 생성한다.

- `users`: 사용자 계정과 입학연도
- `requirements`: 사용자별 최소 학점·인증 점수
- `courses`: 사용자별 과목, 구분, 학점, 이수 여부

관계는 `users 1:1 requirements`, `users 1:N courses`이며 사용자 삭제 시 연관 데이터도 삭제한다. DB 경로는 `backend/data/app.db`지만 저장소에는 `backend/data/` 디렉터리가 기본 생성되어 있지 않다.

## 9. 환경 변수 및 설정

### Frontend

```text
GEMINI_API_KEY
- Gemini 서버 호출용 API 키. 필수이며 NEXT_PUBLIC_ 접두사를 사용하지 않는다.

GEMINI_MODEL
- 기본 Gemini 모델. 미지정 시 gemini-3.6-flash.

GEMINI_FALLBACK_MODEL
- 기본 모델이 503일 때 사용할 모델. 미지정 시 gemini-3.5-flash-lite.
```

실제 키는 `frontend/.env.local`에만 저장한다. 이 파일은 `frontend/.gitignore`에서 제외되며, `frontend/.env.local.example`에는 변수명과 기본 모델만 기록되어 있다.

### Backend

```text
PORT
- Express 포트. 기본값 4000.

FRONTEND_ORIGIN
- CORS 허용 출처. 기본값 http://localhost:5173.

JWT_SECRET
- JWT 서명 키. 운영 환경에서 필수.

NODE_ENV
- production일 때 보안 쿠키와 정적 파일 제공 로직 활성화.
```

## 10. 실행 및 검증

### Frontend

필요 항목: Node.js와 npm, Gemini 기능 사용 시 API 키

```bash
cd frontend
npm install
```

`frontend/.env.local.example`을 참고해 `frontend/.env.local`을 만든 뒤 키를 입력한다.

```bash
npm run dev
```

기본 주소는 `http://localhost:3000`이다. 포트가 사용 중이면 다음처럼 다른 포트를 지정할 수 있다.

```bash
npm run dev -- -p 3001
```

검증 명령:

```bash
npm run lint
npm run build
```

### Backend

현재 프론트엔드 실행에는 필요하지 않다. 별도로 확인하려면 DB 디렉터리를 먼저 만든다.

```bash
cd backend
npm install
mkdir data
npm run dev
```

기본 주소는 `http://localhost:4000`이다.

## 11. 미완성 및 주의사항

- `defaultRequirements.ts`에 명시된 대로 2022학번만 실제 기준이 검증되어 있다. 2023~2026 선택 시에도 현재 동일한 졸업요건을 재사용한다.
- 전공 목록은 2022학번의 필수/선택 구분과 2026 대표명·추가 과목을 함께 사용하는 구조다. 학번별 전공 분리가 필요한 경우 데이터 모델 확장이 필요하다.
- 동일·대체 관계는 PDF에 명시된 항목만 등록했다. 이름이 비슷하다는 이유만으로 자동 병합하지 않는다.
- 직접 입력 교양 과목에는 코드가 없어 영역 학점은 채울 수 있지만 `자바프로그래밍` 같은 지정 과목 이수로 판정되지 않는다.
- 현장실습은 사용자 입력 학점을 그대로 전공선택에 반영한다. 교육과정상 인정 가능한 최대 학점 규칙은 코드에 없다.
- 일반선택은 화면 입력값 전체를 보여주지만 총 졸업학점에는 최대 20학점만 반영한다.
- Express 백엔드의 요건·계산 모델은 현재 프론트엔드보다 단순하고 동일·대체, 교양 영역, 현장실습, 일반선택 상한을 반영하지 않는다.
- Express 기본 CORS 주소는 Vite 기본 포트인 5173이며 현재 Next.js 기본 포트 3000과 다르다.
- 프론트엔드와 백엔드 모두 자동화 테스트 스크립트가 없다.
- Gemini는 외부 서비스이므로 기본 및 폴백 모델 모두 혼잡하거나 모델명이 변경되면 질의 기능이 실패할 수 있다. 핵심 졸업요건 계산 자체는 Gemini에 의존하지 않는다.
- 교육과정 데이터는 TypeScript 상수로 관리한다. PDF 개정 시 원본과 수동 대조해 갱신해야 한다.

## 12. 먼저 볼 파일

1. `frontend/src/app/page.tsx` - 앱 전체 상태, 저장 호출, 탭과 계산 연결의 중심
2. `frontend/src/lib/types.ts` - 전공·교양·동일대체·계산 결과 데이터 구조
3. `frontend/src/lib/defaultRequirements.ts` - 실제 학점 기준과 전체 과목 카탈로그
4. `frontend/src/lib/majorCourseEquivalents.ts` - 동일·대체 관계와 필수 인정 여부
5. `frontend/src/lib/calculate.ts` - 졸업요건 판정의 단일 계산 지점
6. `frontend/src/lib/storage.ts` - localStorage 형식, 초기화, 호환 보정
7. `frontend/src/components/MajorCourses.tsx` - 전공 선택, 펼침, 현장실습 UI
8. `frontend/src/components/GeneralCourses.tsx` - 교양 선택과 직접 입력 UI
9. `frontend/src/components/Dashboard.tsx` - 계산 결과의 실제 표시 구조
10. `frontend/src/app/api/chat/route.ts` - Gemini 모델 선택, 폴백 및 오류 처리
