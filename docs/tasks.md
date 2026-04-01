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
- [x] **(1pt)** `packages/shared`, `packages/frontend`, `packages/backend` 디렉토리 생성
- [x] **(1pt)** 각 패키지의 `package.json` 및 `tsconfig.json` 초기화 (`extends ../../tsconfig.base.json`)

### 0.2 공유 타입 패키지 (3pt) — TDD

- [x] **(1pt)** `packages/shared/src/types/todo.ts` — `Todo` 인터페이스, `Priority` enum 타입 정의
- [x] **(1pt)** 타입 유효성 테스트 작성 (필수 필드 존재 여부, Priority 값 범위)
- [x] **(1pt)** 프론트엔드·백엔드에서 `@todo-app/shared` 의존성 참조 확인

---

## Phase 1: 프론트엔드 단독 동작 (총 40pt)

### 1.1 프로젝트 초기화 (7pt)

- [x] **(1pt)** `packages/frontend`에 Vite + React + TypeScript 프로젝트 생성
- [x] **(2pt)** Mantine 설치 및 설정 (`@mantine/core`, `@mantine/hooks`, `@mantine/dates`, `@mantine/notifications`, `@mantine/form`)
- [x] **(1pt)** `MantineProvider` + `Notifications` 프로바이더 설정 (`main.tsx`)
- [x] **(1pt)** Mantine 테마 커스터마이징 (`theme.ts` — primaryColor, fontFamily, defaultRadius)
- [x] **(1pt)** ESLint + Prettier 설정
- [x] **(1pt)** Jest + React Testing Library 설치 및 설정
- [x] **(1pt)** 프로젝트 디렉토리 구조 생성:
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

- [x] **(1pt)** `StorageService` 인터페이스 정의 (`getTodos`, `saveTodos`)
- [x] **(2pt)** **테스트 작성**: `LocalStorageService` — getTodos 빈 배열 반환, saveTodos 후 getTodos 데이터 일치 검증
- [x] **(2pt)** `LocalStorageService` 구현 (`services/storage/`)

### 1.3 상태 관리 구현 (8pt) — TDD

- [x] **(1pt)** `TodoAction` 타입 정의 (ADD_TODO, UPDATE_TODO, DELETE_TODO, TOGGLE_TODO, SET_TODOS)
- [x] **(2pt)** **테스트 작성**: `todoReducer` — ADD_TODO 시 새 TODO 추가 검증
- [x] **(2pt)** **테스트 작성**: `todoReducer` — DELETE_TODO 시 목록에서 제거, TOGGLE_TODO 시 completed 반전 검증
- [x] **(1pt)** **테스트 작성**: `todoReducer` — SET_TODOS 시 전체 목록 교체 검증
- [x] **(3pt)** `todoReducer` 및 `TodoContext` 구현 (Context API + useReducer)
- [x] **(1pt)** 로컬 스토리지 연동 (StorageService를 통한 persist) 및 테스트 통과 확인

### 1.4 검색/필터/정렬 로직 (8pt) — TDD

- [x] **(2pt)** **테스트 작성**: 제목 검색 — 부분 문자열 매칭, 대소문자 무시, 빈 문자열 처리
- [x] **(2pt)** **테스트 작성**: 우선순위 필터 — ALL/HIGH/MEDIUM/LOW 필터링 결과 검증
- [x] **(2pt)** **테스트 작성**: 정렬 — 생성일순/마감일순/우선순위순/이름순 각각 검증
- [x] **(3pt)** 검색/필터/정렬 로직 구현 (순수 함수)
- [x] **(1pt)** 모든 검색/필터/정렬 테스트 통과 확인

### 1.5 UI 컴포넌트 구현 (13pt)

- [x] **(2pt)** `AppShell` 레이아웃 구성 (`AppShell.Header` + `AppShell.Main` + `Container`)
- [x] **(2pt)** Header 컴포넌트 (`Group`, `Title`, `Text`, `Button` — 앱 제목, 사용자 정보, 로그아웃)
- [x] **(3pt)** TodoForm 컴포넌트 (`TextInput`, `Textarea`, `Select`, `DatePickerInput`, `Button` + `@mantine/form` 유효성 검증)
- [x] **(2pt)** TodoSearch 컴포넌트 (`TextInput` — leftSection에 검색 아이콘)
- [x] **(2pt)** TodoFilter 컴포넌트 (`Group`, `Select` × 2 — 우선순위 필터 + 정렬 드롭다운)
- [x] **(3pt)** TodoList + TodoItem 컴포넌트 (`Stack`, `Card`, `Group`, `Checkbox`, `Badge`(color: red/yellow/blue), `Text`, `ActionIcon`)
- [x] **(1pt)** Footer 컴포넌트

### 1.6 통합 및 접근성 (5pt)

- [x] **(2pt)** App.tsx에서 전체 컴포넌트 조합 및 데이터 흐름 연결
- [x] **(2pt)** ARIA 속성 적용 (role, aria-label, aria-checked 등)
- [x] **(1pt)** 키보드 네비게이션 (Tab, Enter, Space) 동작 확인

### 1.7 Git Hooks & 자동화 (2pt)

- [x] **(1pt)** Husky 설치 및 `.husky/pre-commit` 설정
- [x] **(1pt)** pre-commit hook 구성 (프론트엔드 실행 코드 변경 시 lint fix → build → test 자동 수행)

### 1.8 Phase 1 검증 (2pt)

- [x] **(1pt)** 전체 테스트 스위트 통과 (`npm test -w @todo-app/frontend`)
- [x] **(1pt)** 수동 확인: 로컬 스토리지 기반 CRUD + 검색/필터/정렬 동작 검증

---

## Phase 2: 백엔드 구현 (총 28pt)

### 2.1 CDK 프로젝트 초기화 (3pt)

- [x] **(1pt)** `packages/backend`에 CDK 프로젝트 설정 (`cdk.json`, `bin/app.ts`)
- [x] **(1pt)** CDK 및 Lambda 의존성 설치 (`aws-cdk-lib`, `aws-lambda-nodejs` 등)
- [x] **(1pt)** TodoStack 클래스 기본 구조 작성 (`lib/todo-stack.ts`)

### 2.2 DynamoDB 테이블 (3pt) — TDD

- [x] **(1pt)** **테스트 작성**: CDK 스냅샷 테스트 — DynamoDB 테이블 리소스 존재, PK/SK 설정 검증
- [x] **(2pt)** CDK에서 DynamoDB 테이블 정의 (PK: userId, SK: id, PAY_PER_REQUEST)

### 2.3 Lambda 핸들러 구현 (14pt) — TDD

#### createTodo (4pt)

- [x] **(2pt)** **테스트 작성**: 유효한 요청 → UUID 생성, DynamoDB PutItem 호출, 201 응답
- [x] **(1pt)** **테스트 작성**: 필수 필드 누락 시 400 에러 응답
- [x] **(2pt)** `src/handlers/createTodo.ts` 핸들러 구현

#### getTodos (3pt)

- [x] **(1pt)** **테스트 작성**: userId로 Query 호출, TODO 목록 반환
- [x] **(1pt)** **테스트 작성**: TODO가 없을 때 빈 배열 반환
- [x] **(2pt)** `src/handlers/getTodos.ts` 핸들러 구현

#### deleteTodo (3pt)

- [x] **(1pt)** **테스트 작성**: 유효한 id → DynamoDB DeleteItem 호출, 200 응답
- [x] **(1pt)** **테스트 작성**: 존재하지 않는 id → 404 에러 응답
- [x] **(2pt)** `src/handlers/deleteTodo.ts` 핸들러 구현

#### toggleTodo (4pt)

- [x] **(1pt)** **테스트 작성**: completed: false → true 로 토글
- [x] **(1pt)** **테스트 작성**: completed: true → false 로 토글
- [x] **(1pt)** **테스트 작성**: 존재하지 않는 id → 404 에러 응답
- [x] **(2pt)** `src/handlers/toggleTodo.ts` 핸들러 구현

### 2.4 DynamoDB 유틸리티 (2pt) — TDD

- [x] **(1pt)** **테스트 작성**: DynamoDB 클라이언트 래퍼 함수 (put, query, delete, update)
- [x] **(1pt)** `src/utils/dynamodb.ts` 구현

### 2.5 API Gateway + Cognito Identity Pool (CDK) (3pt)

- [x] **(1pt)** Cognito Identity Pool 정의 (비인증 접근 활성화 + IAM Role)
- [x] **(1pt)** API Gateway REST API 정의 (리소스, 메서드, `NodejsFunction` Lambda 연결)
- [x] **(1pt)** IAM 인증 + CORS 설정

### 2.6 Phase 2 검증 (3pt)

- [x] **(1pt)** 전체 백엔드 테스트 통과 (`npm test -w @todo-app/backend`)
- [ ] **(1pt)** CDK synth 성공 확인
  - **AC**: `npm run synth -w @todo-app/backend` 실행 시 에러 없이 `cdk.out/` 생성
- [ ] **(1pt)** `cdk deploy`로 AWS 리소스 배포 및 수동 API 테스트 (curl/Postman)
  - **AC**: DynamoDB 테이블, Lambda 4개, API Gateway, Cognito Identity Pool이 AWS 콘솔에서 확인됨
  - **AC**: curl로 API Gateway URL에 요청 시 정상 응답 (SigV4 서명 포함)

---

## Phase 3: 프론트-백엔드 연동 (총 13pt)

### 3.1 Cognito Identity Pool 연동 (3pt)

- [ ] **(1pt)** `@aws-sdk/client-cognito-identity` 설치 및 설정
  - **AC**: `npm install` 후 import 에러 없이 빌드 성공
- [ ] **(1pt)** 비인증 자격증명 발급 서비스 구현 (identityId + 임시 자격증명)
  - **AC**: `services/auth/cognitoService.ts` 생성, `getCredentials()` 호출 시 accessKeyId, secretAccessKey, sessionToken 반환
- [ ] **(1pt)** 자격증명 캐싱 (세션 중 재사용)
  - **AC**: 동일 세션에서 `getCredentials()` 재호출 시 새 API 요청 없이 캐시된 자격증명 반환

### 3.2 API 클라이언트 (5pt) — TDD

- [ ] **(2pt)** **테스트 작성**: API 호출 함수 (createTodo, getTodos, deleteTodo, toggleTodo) — mock 기반
  - **AC**: 각 함수가 올바른 HTTP 메서드/경로로 호출되는지 검증하는 테스트 4개 이상
- [ ] **(1pt)** **테스트 작성**: SigV4 서명이 요청에 포함되는지 검증
  - **AC**: 요청 헤더에 `Authorization`, `X-Amz-Date`, `X-Amz-Security-Token` 존재 확인
- [ ] **(1pt)** **테스트 작성**: API 에러 응답 처리 (403, 404, 500)
  - **AC**: 각 에러 코드별 적절한 에러 객체가 throw/반환되는지 검증
- [ ] **(3pt)** `services/todoApi.ts` 구현 (SigV4 서명 + API 호출)
  - **AC**: 위 테스트 전체 통과, `npm run build -w @todo-app/frontend` 성공

### 3.3 상태 관리 API 연결 (3pt) — TDD

- [ ] **(1pt)** **테스트 작성**: Context 액션 호출 시 API 호출 + 로컬 상태 동기화 검증
  - **AC**: addTodo 호출 → API createTodo 호출 + todos 배열에 추가 검증
- [ ] **(1pt)** **테스트 작성**: API 에러 시 에러 상태 설정 검증
  - **AC**: API 실패 시 error 상태가 설정되고, todos는 변경되지 않음
- [ ] **(2pt)** TodoContext를 API 호출 기반으로 전환 (로컬 스토리지는 캐시로 유지)
  - **AC**: 위 테스트 전체 통과, 로컬 스토리지에도 동기화되어 오프라인 캐시 역할 수행

### 3.4 Phase 3 검증 (2pt)

- [ ] **(1pt)** 전체 테스트 통과 (`npm test -w @todo-app/frontend`)
  - **AC**: 기존 41 tests + 새 API/Context 테스트 포함, 전체 통과
- [ ] **(1pt)** TODO CRUD → 새로고침 후 DynamoDB 데이터 유지 확인
  - **AC**: 브라우저에서 TODO 추가 → 새로고침 → 동일 데이터 표시 (DynamoDB에서 재조회)

---

## Phase 4: 배포 및 CI/CD (총 8pt)

### 4.1 GitHub Actions CI/CD (3pt)

- [x] **(2pt)** CI 워크플로 작성 (`.github/workflows/ci.yml` — lint → build → test)
- [ ] **(1pt)** GitHub Pages 자동 배포 워크플로 추가
  - **AC**: `.github/workflows/deploy.yml` 생성, master push 시 빌드 → gh-pages 브랜치 배포
  - **AC**: `https://<username>.github.io/edu-vibecoding-demo/` 접속 시 앱 렌더링

### 4.2 최종 배포 (3pt)

- [ ] **(1pt)** CDK로 프로덕션 AWS 인프라 배포
  - **AC**: `npm run deploy -w @todo-app/backend` 성공, CloudFormation 스택 CREATE_COMPLETE
- [ ] **(1pt)** GitHub Pages에 프론트엔드 배포
  - **AC**: GitHub Pages URL에서 TODO 앱 정상 로딩
- [ ] **(1pt)** 환경변수 설정 (API Gateway URL, Cognito Identity Pool ID)
  - **AC**: GitHub Secrets에 `VITE_API_URL`, `VITE_IDENTITY_POOL_ID`, `VITE_REGION` 설정, 빌드 시 주입 확인

### 4.3 최종 검증 (2pt)

- [ ] **(1pt)** 프로덕션 환경 전체 기능 테스트
  - **AC**: GitHub Pages에서 TODO CRUD + 검색/필터/정렬 + 새로고침 데이터 유지 확인
- [ ] **(1pt)** CI/CD 파이프라인 동작 확인 (push → 자동 빌드 → 배포)
  - **AC**: master에 push 후 GitHub Actions가 CI 통과 → GitHub Pages 자동 배포 → 사이트 업데이트 확인

---

## 요약

| Phase | 설명 | 포인트 | TDD 대상 |
|-------|------|--------|----------|
| Phase 0 | 모노레포 초기화 | 8pt | 공유 타입 |
| Phase 1 | 프론트엔드 단독 동작 | 40pt | 스토리지 서비스, 상태 관리(Reducer), 검색/필터/정렬 |
| Phase 2 | 백엔드 구현 (CDK+Lambda 통합) | 28pt | Lambda 핸들러, DynamoDB 유틸, CDK |
| Phase 3 | 프론트-백엔드 연동 | 13pt | API 클라이언트, 상태 관리 API 연결 |
| Phase 4 | 배포 및 CI/CD | 8pt | - |
| **합계** | | **97pt** | |
