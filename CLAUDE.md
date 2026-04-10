# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 커뮤니케이션

**한국어로 소통한다.** 모든 응답, 커밋 메시지, 문서는 한국어로 작성한다.

## 이 프로젝트의 특성

이 프로젝트는 **바이브 코딩 교육용 데모 프로젝트**다. 실질적 작업 프롬프트는 `docs/prompt-history.md`에 번호/원문/의도/결과 형식으로 기록한다 (단순 확인/질문은 기록하지 않음).

## 모노레포 구조 (npm workspaces)

3개 패키지로 구성된 워크스페이스다:

- `packages/shared` (`@todo-app/shared`) — Todo/Priority 공유 타입. 프론트엔드·백엔드에서 반드시 여기서 import하며 타입 중복 정의 금지
- `packages/frontend` (`@todo-app/frontend`) — React 19 + Vite + Mantine v7
- `packages/backend` (`@todo-app/backend`) — **CDK 인프라와 Lambda 비즈니스 로직 통합**. CDK `NodejsFunction`이 `src/handlers/*.ts`를 자동 번들링하므로 별도 build 불필요

각 패키지의 `tsconfig.json`은 루트 `tsconfig.base.json`을 extends한다.

## 주요 명령어

### 루트에서 실행

```bash
npm install                    # 모든 워크스페이스 의존성 설치
npm run dev:frontend            # 프론트엔드 개발 서버
npm run build:all               # shared → frontend → backend 순차 빌드
npm test                        # 모든 워크스페이스 테스트
npm run lint                    # 프론트엔드 lint
npm run lint:backend            # 백엔드 lint
npm run format / format:backend # Prettier
npm run synth                   # CDK CloudFormation 템플릿 생성
npm run deploy                  # CDK AWS 배포
```

### 단일 테스트 실행

```bash
# 프론트엔드 특정 파일
npx -w @todo-app/frontend jest --testPathPattern="App.integration"

# 백엔드 특정 파일
npx -w @todo-app/backend jest --testPathPattern="handlers"
```

## 아키텍처

### 프론트엔드

- **상태 관리**: `TodoContext` (React Context + useReducer). API 설정(`config.apiUrl`)이 있으면 서버 호출, 없으면 로컬 스토리지 폴백. 이 이중 모드 덕에 백엔드 없이도 완전한 CRUD 동작
- **데이터 저장 추상화**: `StorageService` 인터페이스 → `LocalStorageService` 구현. 백엔드 연동 시에도 캐시로 유지됨
- **환경변수**: `import.meta.env` 대신 `process.env.VITE_*` 사용 (Vite의 `define`으로 주입, Jest 호환을 위함)
- **Cognito 자격증명**: `services/auth/cognitoService.ts` — 비인증 Identity Pool에서 `identityId` + 임시 자격증명 발급, 50분 캐싱
- **API 클라이언트**: `services/todoApi.ts` — `@smithy/signature-v4`로 SigV4 서명 후 fetch

### 백엔드 (CDK + Lambda 통합)

- **단일 스택 `TodoStack`** (`lib/todo-stack.ts`): DynamoDB + Lambda×4 + Cognito Identity Pool + API Gateway (IAM 인증)를 한 파일에 정의
- **권한 제어 모델**: Cognito Identity Pool 비인증 접근 → 임시 자격증명 → API Gateway IAM 인증 → Lambda에서 `event.requestContext.identity.cognitoIdentityId`로 사용자 식별. **로그인/회원가입 UI는 없음**
- **Lambda 핸들러 공통 패턴**: `event` → userId 추출 → 입력 파싱/검증 → `dynamodb.ts` 유틸 호출 → `response.ts`의 `success()`/`error()` 반환
- **DynamoDB 스키마**: PK=`userId` (Cognito identityId), SK=`id` (TODO UUID), PAY_PER_REQUEST

### CDK 관련 주의

- `cdk.json`은 `npx tsx bin/app.ts`로 실행 (ts-node ESM 이슈로 tsx 사용)
- `Lambda.NodejsFunction`이 esbuild로 핸들러를 자동 번들링 — 별도 `tsc` build 단계 불필요
- CDK 스냅샷 테스트는 `test/todo-stack.test.ts`에서 `Template.fromStack()`로 리소스 검증

## 개발 방식

### TDD 원칙 (코어 비즈니스 로직에만 적용)

- **TDD 대상**: 스토리지 서비스, todoReducer, 검색/필터/정렬, Lambda 핸들러, DynamoDB 유틸, API 클라이언트
- **UI 우선 구현**: 프론트엔드 UI 컴포넌트는 실행 코드를 먼저 작성 (테스트 후행)
- 테스트 파일은 `__tests__/` 디렉토리에 `{대상}.test.ts` 형식

### 프론트엔드 UI

- **Mantine v7 컴포넌트를 최우선 사용**. 직접 HTML 요소 스타일링 금지
- **반응형**: Mantine의 `visibleFrom`/`hiddenFrom`, breakpoint 객체 `{ base, sm, md }` 활용
- **접근성**: ARIA 속성 필수, 키보드 네비게이션 지원
- Clean Architecture + SOLID 원칙

### 코드 스타일

- `interface` 선호 (`type` 대신), `any` 금지
- 이벤트 핸들러는 `handle` 접두사 (handleClick, handleSubmit)
- 컴포넌트는 named export
- early return 패턴 활용

### Git Hooks (Husky pre-commit)

staged 파일을 감지하여 작업 영역별로 자동 검증 수행:

- `packages/frontend/src/**/*.{ts,tsx,js,jsx}` 변경 → **lint fix → build → test**
- `packages/backend/{src,lib,bin,test}/**/*.ts` 변경 → **ESLint+Prettier → tsc → jest**
- 해당 영역 파일이 없으면 스킵 (빠른 문서 전용 커밋 가능)

커밋은 **작업 단위별로 분리하여 순차 커밋**한다. `git diff --stat`으로 파일을 확인 후 관련 파일끼리 그룹핑해 여러 번 나눠 커밋.

## 문서 체계

작업 영역에 따라 관련 설계 문서를 참조한다:

- 요건 변경 → `docs/requirements.md`
- 프로젝트 구조/패키지 → `docs/design/project-structure.md`
- 데이터 모델/DynamoDB → `docs/design/data-model.md`
- API 엔드포인트/권한 제어 → `docs/design/api.md`
- 프론트엔드 UI/상태 관리 → `docs/design/frontend.md`
- 백엔드 CDK+Lambda 개발 → `docs/design/backend.md`
- 배포/운영/환경변수 → `docs/design/infrastructure.md`
- 작업 체크리스트/진행 상황 → `docs/tasks.md` (커밋 전 업데이트)

상세 규칙: `docs/cursorrules.md`

## 명명 규칙

### 브랜치

**모든 작업 브랜치는 GitHub 이슈와 연동되어야 한다.** 브랜치 생성 전 `gh issue list`로 관련 이슈를 확인하고, 이슈가 없으면 먼저 생성한다.

형식: `<type>/<issue-number>-<간략-설명>`

- `feat/12-todo-form-validation` — 새 기능
- `fix/15-cognito-credential-expiry` — 버그 수정
- `refactor/18-todo-context-cleanup` — 리팩토링
- `docs/20-design-docs-update` — 문서만 변경
- `chore/22-pre-commit-hook-tuning` — 빌드/설정/도구
- `test/25-app-integration-tests` — 테스트 추가/수정

### 커밋 메시지 (Conventional Commits)

`<type>: <한국어 설명>` 형식:

- `feat: TODO 폼 유효성 검증 추가`
- `fix: Cognito 자격증명 만료 처리`
- `refactor: TodoContext 구조 개선`
- `docs: 설계 문서 업데이트`
- `chore: pre-commit hook 로그 개선`
- `test: App 통합 테스트 추가`
- `ci: GitHub Actions 워크플로 수정`

커밋 본문에 이슈 번호 참조 (`Closes #12`, `Refs #15`).

### 파일/폴더

- 컴포넌트 파일: `PascalCase.tsx` (예: `TodoForm.tsx`)
- 유틸/서비스/훅: `camelCase.ts` (예: `todoFilters.ts`, `cognitoService.ts`)
- 테스트: `{대상}.test.ts`, `__tests__/` 디렉토리에 배치
- 디렉토리: 소문자 (예: `components/todo/`, `services/auth/`)

### 코드

- 변수/함수: `camelCase`. boolean은 `is`/`has`/`can` 접두사 (isLoading, hasError, canDelete)
- 이벤트 핸들러: `handle<Event>` 접두사 (handleClick, handleSubmit, handleToggle)
- 타입/인터페이스/컴포넌트/Enum: `PascalCase`
- 상수: `UPPER_SNAKE_CASE` (STORAGE_KEY, CORS_HEADERS)
- 공유 타입: 반드시 `@todo-app/shared`에서 import (중복 정의 금지)

## 브랜칭 전략 (GitHub Flow + 이슈 연동)

1. **이슈 생성**: 작업 시작 전 `gh issue create`로 이슈 생성 (또는 기존 이슈 확인)
2. **브랜치 생성**: `git checkout -b <type>/<issue-number>-<설명>` (master에서 분기)
3. **작업 + 순차 커밋**: 작업 단위별로 `git diff --stat` 확인 후 분리 커밋
4. **PR 생성**: `gh pr create`로 PR 생성, 본문에 `Closes #<issue-number>` 포함
5. **CI 통과 확인**: GitHub Actions `ci.yml`의 lint/build/test 통과 확인
6. **master 병합**: 병합 후 feature 브랜치 삭제, 연관 이슈 자동 close

**주의**: `master`는 항상 배포 가능한 상태를 유지한다. 직접 push 금지 — 모든 변경은 PR을 통한다.

## 불필요한 기능 (구현하지 않음)

TODO 수정(편집), 카테고리/태그, 소셜 로그인, 로그인/회원가입 UI, 다크 모드, 드래그 앤 드롭, 애니메이션, 다국어, 오프라인.

## 배포 현황

- **프론트엔드**: GitHub Actions CI 구축 완료 (`.github/workflows/ci.yml` — lint/build/test)
- **백엔드**: CDK 코드 완료, AWS 배포는 계정 설정 이슈로 스킵 상태. 프론트엔드는 로컬 스토리지 모드로 독립 동작
- GitHub 레포: https://github.com/jenosis1078/edu-vibecoding-demo
