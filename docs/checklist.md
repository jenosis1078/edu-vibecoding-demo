# TODO 웹 앱 - 작업 체크리스트

> 포인트 기준: 1pt = 단순 설정/보일러플레이트, 2pt = 소규모 구현, 3pt = 중간 규모 구현, 5pt = 복합 기능, 8pt = 대규모 구현
>
> TDD 대상: UI/UX를 제외한 코어 비즈니스 로직 (테스트 작성 → 구현 → 리팩터링)

---

## Phase 0: 모노레포 초기화 (총 8pt)

### 0.1 모노레포 구조 설정 (5pt)

- [x] **(1pt)** 루트 `package.json` 생성 (npm workspaces 설정: `packages/*`)
- [x] **(1pt)** `tsconfig.base.json` 생성 (공통 TypeScript 설정)
- [x] **(1pt)** `.gitignore` 설정 (node_modules, dist, .env 등)
- [x] **(1pt)** `packages/frontend`, `packages/backend`, `packages/infra`, `packages/shared` 디렉토리 생성
- [x] **(1pt)** 각 패키지의 `package.json` 및 `tsconfig.json` 초기화 (`extends ../../tsconfig.base.json`)

### 0.2 공유 타입 패키지 (3pt) — TDD

- [x] **(1pt)** `packages/shared/src/types/todo.ts` — `Todo` 인터페이스, `Priority` enum 타입 정의
- [x] **(1pt)** 타입 유효성 테스트 작성 (필수 필드 존재 여부, Priority 값 범위)
- [x] **(1pt)** 프론트엔드·백엔드에서 `@todo-app/shared` 의존성 참조 확인

---

## Phase 1: 프론트엔드 단독 동작 (총 40pt)

### 1.1 프로젝트 초기화 (7pt)

- [ ] **(1pt)** `packages/frontend`에 Vite + React + TypeScript 프로젝트 생성
- [ ] **(2pt)** Mantine 설치 및 설정 (`@mantine/core`, `@mantine/hooks`, `@mantine/dates`, `@mantine/notifications`, `@mantine/form`)
- [ ] **(1pt)** `MantineProvider` + `Notifications` 프로바이더 설정 (`main.tsx`)
- [ ] **(1pt)** Mantine 테마 커스터마이징 (`theme.ts` — primaryColor, fontFamily, defaultRadius)
- [ ] **(1pt)** ESLint + Prettier 설정
- [ ] **(1pt)** Jest + React Testing Library 설치 및 설정
- [ ] **(1pt)** 프로젝트 디렉토리 구조 생성:
  ```
  src/
  ├── assets/            # 정적 자산
  ├── components/
  │   ├── common/        # 공통 컴포넌트
  │   ├── layout/        # 레이아웃 (Header, Footer)
  │   └── todo/          # Todo 관련 컴포넌트
  ├── contexts/          # React Context API
  ├── hooks/             # 커스텀 훅
  ├── pages/             # 페이지 컴포넌트
  ├── services/
  │   └── storage/       # 스토리지 서비스
  ├── types/             # 로컬 타입 (shared 외 프론트 전용)
  └── utils/             # 유틸리티 함수
  ```

### 1.2 스토리지 서비스 구현 (5pt) — TDD

- [ ] **(1pt)** `StorageService` 인터페이스 정의 (`getTodos`, `saveTodos`)
- [ ] **(2pt)** **테스트 작성**: `LocalStorageService` — getTodos 빈 배열 반환, saveTodos 후 getTodos 데이터 일치 검증
- [ ] **(2pt)** `LocalStorageService` 구현 (`services/storage/`)

### 1.3 상태 관리 구현 (8pt) — TDD

- [ ] **(1pt)** `TodoAction` 타입 정의 (ADD_TODO, UPDATE_TODO, DELETE_TODO, TOGGLE_TODO, SET_TODOS)
- [ ] **(2pt)** **테스트 작성**: `todoReducer` — ADD_TODO 시 새 TODO 추가 검증
- [ ] **(2pt)** **테스트 작성**: `todoReducer` — DELETE_TODO 시 목록에서 제거, TOGGLE_TODO 시 completed 반전 검증
- [ ] **(1pt)** **테스트 작성**: `todoReducer` — SET_TODOS 시 전체 목록 교체 검증
- [ ] **(3pt)** `todoReducer` 및 `TodoContext` 구현 (Context API + useReducer)
- [ ] **(1pt)** 로컬 스토리지 연동 (StorageService를 통한 persist) 및 테스트 통과 확인

### 1.4 검색/필터/정렬 로직 (8pt) — TDD

- [ ] **(2pt)** **테스트 작성**: 제목 검색 — 부분 문자열 매칭, 대소문자 무시, 빈 문자열 처리
- [ ] **(2pt)** **테스트 작성**: 우선순위 필터 — ALL/HIGH/MEDIUM/LOW 필터링 결과 검증
- [ ] **(2pt)** **테스트 작성**: 정렬 — 생성일순/마감일순/우선순위순/이름순 각각 검증
- [ ] **(3pt)** 검색/필터/정렬 로직 구현 (순수 함수)
- [ ] **(1pt)** 모든 검색/필터/정렬 테스트 통과 확인

### 1.5 UI 컴포넌트 구현 (13pt)

- [ ] **(2pt)** `AppShell` 레이아웃 구성 (`AppShell.Header` + `AppShell.Main` + `Container`)
- [ ] **(2pt)** Header 컴포넌트 (`Group`, `Title`, `Text`, `Button` — 앱 제목, 사용자 정보, 로그아웃)
- [ ] **(3pt)** TodoForm 컴포넌트 (`TextInput`, `Textarea`, `Select`, `DatePickerInput`, `Button` + `@mantine/form` 유효성 검증)
- [ ] **(2pt)** TodoSearch 컴포넌트 (`TextInput` — leftSection에 검색 아이콘)
- [ ] **(2pt)** TodoFilter 컴포넌트 (`Group`, `Select` × 2 — 우선순위 필터 + 정렬 드롭다운)
- [ ] **(3pt)** TodoList + TodoItem 컴포넌트 (`Stack`, `Card`, `Group`, `Checkbox`, `Badge`(color: red/yellow/blue), `Text`, `ActionIcon`)
- [ ] **(1pt)** Footer 컴포넌트

### 1.6 통합 및 접근성 (5pt)

- [ ] **(2pt)** App.tsx에서 전체 컴포넌트 조합 및 데이터 흐름 연결
- [ ] **(2pt)** ARIA 속성 적용 (role, aria-label, aria-checked 등)
- [ ] **(1pt)** 키보드 네비게이션 (Tab, Enter, Space) 동작 확인

### 1.7 Git Hooks & 자동화 (2pt)

- [ ] **(1pt)** Husky 설치 및 `.husky/pre-commit` 설정
- [ ] **(1pt)** pre-commit hook 구성 (프론트엔드 실행 코드 변경 시 lint fix → build → test 자동 수행)

### 1.8 Phase 1 검증 (2pt)

- [ ] **(1pt)** 전체 테스트 스위트 통과 (`npm test -w @todo-app/frontend`)
- [ ] **(1pt)** 수동 확인: 로컬 스토리지 기반 CRUD + 검색/필터/정렬 동작 검증

---

## Phase 2: 백엔드 구현 (총 30pt)

### 2.1 AWS CDK 프로젝트 초기화 (3pt)

- [ ] **(1pt)** `packages/infra`에 CDK 프로젝트 설정
- [ ] **(1pt)** TypeScript 설정 및 CDK 의존성 설치
- [ ] **(1pt)** TodoStack 클래스 기본 구조 작성

### 2.2 DynamoDB 테이블 (3pt) — TDD

- [ ] **(1pt)** **테스트 작성**: CDK 스냅샷 테스트 — DynamoDB 테이블 리소스 존재, PK/SK 설정 검증
- [ ] **(2pt)** CDK에서 DynamoDB 테이블 정의 (PK: userId, SK: id, PAY_PER_REQUEST)

### 2.3 Lambda 핸들러 구현 (16pt) — TDD

#### createTodo (4pt)

- [ ] **(2pt)** **테스트 작성**: 유효한 요청 → UUID 생성, DynamoDB PutItem 호출, 201 응답
- [ ] **(1pt)** **테스트 작성**: 필수 필드 누락 시 400 에러 응답
- [ ] **(2pt)** createTodo 핸들러 구현
- [ ] **(1pt)** 테스트 통과 확인

#### getTodos (3pt)

- [ ] **(1pt)** **테스트 작성**: userId로 Query 호출, TODO 목록 반환
- [ ] **(1pt)** **테스트 작성**: TODO가 없을 때 빈 배열 반환
- [ ] **(2pt)** getTodos 핸들러 구현
- [ ] **(1pt)** 테스트 통과 확인

#### deleteTodo (3pt)

- [ ] **(1pt)** **테스트 작성**: 유효한 id → DynamoDB DeleteItem 호출, 200 응답
- [ ] **(1pt)** **테스트 작성**: 존재하지 않는 id → 404 에러 응답
- [ ] **(2pt)** deleteTodo 핸들러 구현
- [ ] **(1pt)** 테스트 통과 확인

#### toggleTodo (4pt)

- [ ] **(1pt)** **테스트 작성**: completed: false → true 로 토글
- [ ] **(1pt)** **테스트 작성**: completed: true → false 로 토글
- [ ] **(1pt)** **테스트 작성**: 존재하지 않는 id → 404 에러 응답
- [ ] **(2pt)** toggleTodo 핸들러 구현
- [ ] **(1pt)** 테스트 통과 확인

### 2.4 DynamoDB 유틸리티 (3pt) — TDD

- [ ] **(1pt)** **테스트 작성**: DynamoDB 클라이언트 래퍼 함수 (put, query, delete, update)
- [ ] **(2pt)** `packages/backend/src/utils/dynamodb.ts` 구현

### 2.5 API Gateway + Cognito (CDK) (5pt)

- [ ] **(2pt)** Cognito User Pool + User Pool Client 정의
- [ ] **(2pt)** API Gateway REST API 정의 (리소스, 메서드, Lambda 연결)
- [ ] **(1pt)** Cognito Authorizer 연동 및 CORS 설정

### 2.6 Phase 2 검증 (3pt)

- [ ] **(1pt)** 전체 백엔드 테스트 통과 (`npm test -w @todo-app/backend`)
- [ ] **(1pt)** CDK synth 성공 확인
- [ ] **(1pt)** `cdk deploy`로 AWS 리소스 배포 및 수동 API 테스트 (curl/Postman)

---

## Phase 3: 프론트-백엔드 연동 (총 21pt)

### 3.1 Cognito 인증 연동 (8pt)

- [ ] **(2pt)** AWS Amplify Auth 또는 amazon-cognito-identity-js 설치 및 설정
- [ ] **(3pt)** authContext 구현 (login, signUp, logout, getCurrentUser)
- [ ] **(2pt)** LoginForm + SignUpForm 컴포넌트 구현 (`Paper`, `Tabs`, `TextInput`, `PasswordInput`, `Button`)
- [ ] **(1pt)** 인증 상태에 따른 화면 분기 (미로그인 → LoginForm / 로그인 → TodoApp)

### 3.2 API 클라이언트 (5pt) — TDD

- [ ] **(2pt)** **테스트 작성**: API 호출 함수 (createTodo, getTodos, deleteTodo, toggleTodo) — mock fetch 기반
- [ ] **(1pt)** **테스트 작성**: Authorization 헤더에 토큰 포함 검증
- [ ] **(1pt)** **테스트 작성**: API 에러 응답 처리 (401, 404, 500)
- [ ] **(3pt)** `packages/frontend/src/services/todoApi.ts` 구현 (fetch 래퍼 + 토큰 자동 첨부)
- [ ] **(1pt)** 테스트 통과 확인

### 3.3 상태 관리 API 연결 (5pt) — TDD

- [ ] **(2pt)** **테스트 작성**: Context 액션 호출 시 API 호출 + 로컬 상태 동기화 검증
- [ ] **(1pt)** **테스트 작성**: API 에러 시 에러 상태 설정 검증
- [ ] **(3pt)** TodoContext를 API 호출 기반으로 전환 (로컬 스토리지는 캐시로 유지)
- [ ] **(1pt)** 테스트 통과 확인

### 3.4 Phase 3 검증 (3pt)

- [ ] **(1pt)** 전체 테스트 통과 (`npm test -w @todo-app/frontend`)
- [ ] **(1pt)** 로그인 → TODO CRUD → 로그아웃 E2E 수동 테스트
- [ ] **(1pt)** 새로고침 후 데이터 유지 확인 (DynamoDB에서 재조회)

---

## Phase 4: 배포 및 CI/CD (총 10pt)

### 4.1 GitHub Actions CI/CD (5pt)

- [ ] **(2pt)** 프론트엔드 빌드 + 테스트 워크플로 작성 (`.github/workflows/deploy-frontend.yml`)
- [ ] **(2pt)** GitHub Pages 자동 배포 설정
- [ ] **(1pt)** 환경변수 설정 (API Gateway URL, Cognito User Pool ID/Client ID)

### 4.2 최종 배포 (3pt)

- [ ] **(1pt)** CDK로 프로덕션 AWS 인프라 배포
- [ ] **(1pt)** GitHub Pages에 프론트엔드 배포
- [ ] **(1pt)** CORS 설정 최종 확인 (GitHub Pages 도메인 허용)

### 4.3 최종 검증 (2pt)

- [ ] **(1pt)** 프로덕션 환경 전체 기능 테스트
- [ ] **(1pt)** CI/CD 파이프라인 동작 확인 (push → 자동 빌드 → 배포)

---

## 요약

| Phase | 설명 | 포인트 | TDD 대상 |
|-------|------|--------|----------|
| Phase 0 | 모노레포 초기화 | 8pt | 공유 타입 |
| Phase 1 | 프론트엔드 단독 동작 | 40pt | 스토리지 서비스, 상태 관리(Reducer), 검색/필터/정렬 |
| Phase 2 | 백엔드 구현 | 30pt | Lambda 핸들러, DynamoDB 유틸, CDK |
| Phase 3 | 프론트-백엔드 연동 | 21pt | API 클라이언트, 상태 관리 API 연결 |
| Phase 4 | 배포 및 CI/CD | 10pt | - |
| **합계** | | **109pt** | |
