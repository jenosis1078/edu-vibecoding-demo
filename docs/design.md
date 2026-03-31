# TODO 웹 앱 - 기술 설계 문서

## 1. 시스템 아키텍처

![System Architecture](/05차시_프로젝트%20기획%20및%20설계-20251002T130745Z-1-001/docs/images/architecture.svg)

- **클라이언트**: React + Vite + Mantine (GitHub Pages 배포)
- **인증**: AWS Cognito (이메일/비밀번호)
- **API**: API Gateway (REST) + Cognito Authorizer
- **비즈니스 로직**: AWS Lambda (Node.js 20.x / TypeScript) - 4개 함수
- **데이터베이스**: DynamoDB (PK: userId, SK: id)
- **인프라 관리**: AWS CDK (TypeScript)로 전체 서버리스 스택 정의 및 배포
- **프로젝트 구조**: 모노레포 (npm workspaces) — 프론트엔드·백엔드·인프라·공유 타입을 단일 저장소에서 관리
- **CI/CD**: GitHub Actions → GitHub Pages 자동 배포

---

## 2. 프로젝트 디렉토리 구조 (모노레포)

npm workspaces를 사용하여 프론트엔드·백엔드·인프라·공유 타입을 단일 저장소에서 관리한다.

```
todo-app/                        # 모노레포 루트
├── package.json                 # 루트 package.json (workspaces 설정)
├── tsconfig.base.json           # 공통 TypeScript 설정
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml  # GitHub Actions CI/CD
│
├── packages/
│   ├── shared/                  # 공유 타입·유틸리티 (@todo-app/shared)
│   │   ├── src/
│   │   │   └── types/
│   │   │       └── todo.ts      # Todo, Priority 타입 정의
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── frontend/                # React 프론트엔드 (@todo-app/frontend)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/      # UI 컴포넌트
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── SignUpForm.tsx
│   │   │   │   ├── Todo/
│   │   │   │   │   ├── TodoItem.tsx
│   │   │   │   │   ├── TodoList.tsx
│   │   │   │   │   ├── TodoForm.tsx
│   │   │   │   │   ├── TodoFilter.tsx
│   │   │   │   │   └── TodoSearch.tsx
│   │   │   │   └── Layout/
│   │   │   │       ├── Header.tsx
│   │   │   │       └── Footer.tsx
│   │   │   ├── hooks/           # 커스텀 훅
│   │   │   │   ├── useTodos.ts
│   │   │   │   └── useAuth.ts
│   │   │   ├── store/           # 상태 관리
│   │   │   │   ├── todoStore.ts # Zustand (로컬 스토리지 연동)
│   │   │   │   └── authContext.tsx  # React Context (인증)
│   │   │   ├── api/             # API 클라이언트
│   │   │   │   └── todoApi.ts
│   │   │   ├── theme.ts         # Mantine 테마 커스터마이징
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json        # extends ../../tsconfig.base.json
│   │   └── package.json
│   │
│   ├── backend/                 # Lambda 함수 (@todo-app/backend)
│   │   ├── src/
│   │   │   ├── handlers/        # Lambda 핸들러
│   │   │   │   ├── createTodo.ts
│   │   │   │   ├── getTodos.ts
│   │   │   │   ├── deleteTodo.ts
│   │   │   │   └── toggleTodo.ts
│   │   │   └── utils/           # 유틸리티
│   │   │       └── dynamodb.ts
│   │   ├── tsconfig.json        # extends ../../tsconfig.base.json
│   │   └── package.json
│   │
│   └── infra/                   # AWS CDK 인프라 (@todo-app/infra)
│       ├── lib/
│       │   └── todo-stack.ts
│       ├── bin/
│       │   └── app.ts
│       ├── cdk.json
│       ├── tsconfig.json        # extends ../../tsconfig.base.json
│       └── package.json
```

### 2.1 모노레포 설정

#### 루트 package.json

```json
{
  "name": "todo-app",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev:frontend": "npm run dev -w @todo-app/frontend",
    "build:frontend": "npm run build -w @todo-app/frontend",
    "build:backend": "npm run build -w @todo-app/backend",
    "build:shared": "npm run build -w @todo-app/shared",
    "build:all": "npm run build:shared && npm run build:frontend && npm run build:backend",
    "deploy:infra": "npm run deploy -w @todo-app/infra"
  }
}
```

#### 공유 타입 패키지 (packages/shared)

프론트엔드와 백엔드에서 동일한 `Todo`, `Priority` 타입을 사용하기 위해 공유 패키지로 분리한다.

```json
{
  "name": "@todo-app/shared",
  "version": "1.0.0",
  "main": "src/types/todo.ts",
  "types": "src/types/todo.ts"
}
```

프론트엔드·백엔드에서 의존성으로 참조:
```json
{
  "dependencies": {
    "@todo-app/shared": "*"
  }
}
```

사용 예시:
```typescript
import { Todo, Priority } from '@todo-app/shared/src/types/todo';
```

#### tsconfig.base.json (루트 공통 설정)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## 3. 데이터 모델

### 3.1 TODO 항목

```typescript
interface Todo {
  id: string;            // UUID (PK)
  userId: string;        // Cognito User ID (SK)
  title: string;         // 제목 (필수, 최대 100자)
  description: string;   // 설명 (선택, 최대 500자)
  priority: Priority;    // 우선순위
  dueDate: string;       // 마감일 (ISO 8601, e.g. "2026-04-15")
  completed: boolean;    // 완료 여부
  createdAt: string;     // 생성일시 (ISO 8601)
}

enum Priority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}
```

### 3.2 DynamoDB 테이블 설계

| 속성 | 타입 | 키 | 설명 |
|------|------|-----|------|
| `userId` | String | Partition Key (PK) | Cognito 사용자 ID |
| `id` | String | Sort Key (SK) | TODO UUID |
| `title` | String | - | 제목 |
| `description` | String | - | 설명 |
| `priority` | String | - | HIGH / MEDIUM / LOW |
| `dueDate` | String | - | 마감일 |
| `completed` | Boolean | - | 완료 여부 |
| `createdAt` | String | - | 생성일시 |

- **PK를 userId로 설정**: 사용자별 TODO 조회를 효율적으로 처리
- **SK를 id로 설정**: 개별 TODO 접근 가능
- 정렬/필터링은 클라이언트 사이드에서 처리 (소규모 데이터)

---

## 4. API 설계

### 4.1 엔드포인트

| 메서드 | 경로 | 설명 | 요청 Body |
|--------|------|------|-----------|
| `POST` | `/todos` | TODO 생성 | `{ title, description?, priority, dueDate }` |
| `GET` | `/todos` | TODO 목록 조회 | - |
| `DELETE` | `/todos/{id}` | TODO 삭제 | - |
| `PATCH` | `/todos/{id}/toggle` | 완료/미완료 토글 | - |

> Q9에서 수정 기능은 불필요로 결정되어 PUT 엔드포인트는 제외

### 4.2 응답 형식

```json
// 성공 응답
{
  "success": true,
  "data": { ... }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "TODO_NOT_FOUND",
    "message": "해당 TODO를 찾을 수 없습니다."
  }
}
```

### 4.3 인증 흐름

1. 사용자가 Cognito Hosted UI 또는 커스텀 폼으로 로그인/회원가입
2. Cognito에서 JWT(ID Token, Access Token) 발급
3. 프론트엔드가 API 요청 시 `Authorization: Bearer <accessToken>` 헤더 포함
4. API Gateway의 Cognito Authorizer가 토큰 검증
5. Lambda에서 `event.requestContext.authorizer`로 userId 추출

### 4.4 시퀀스 다이어그램

![Sequence Diagram](/05차시_프로젝트%20기획%20및%20설계-20251002T130745Z-1-001/docs/images/sequence.svg)

각 요청의 처리 흐름:

1. **로그인**: Client → Cognito (인증) → JWT 토큰 발급 → Client 저장
2. **TODO 생성 (POST)**: Client → API Gateway (토큰 검증) → Lambda (UUID 생성) → DynamoDB (PutItem)
3. **TODO 조회 (GET)**: Client → API Gateway → Lambda → DynamoDB (Query by userId) → 클라이언트 사이드 검색/필터/정렬
4. **TODO 삭제 (DELETE)**: Client → API Gateway → Lambda → DynamoDB (DeleteItem)
5. **TODO 토글 (PATCH)**: Client → API Gateway → Lambda → DynamoDB (UpdateItem: completed 반전)

---

## 5. 프론트엔드 설계

### 5.1 UI 라이브러리 — Mantine

Mantine v7을 사용하여 UI를 구성한다.

#### 사용 패키지

| 패키지 | 용도 |
|--------|------|
| `@mantine/core` | 기본 UI 컴포넌트 (Button, TextInput, Checkbox, Badge, Card, Select 등) |
| `@mantine/hooks` | 유틸리티 훅 (useDisclosure, useLocalStorage 등) |
| `@mantine/dates` | 마감일 입력용 DatePickerInput |
| `@mantine/notifications` | TODO 생성/삭제 시 알림 토스트 |
| `@mantine/form` | 폼 유효성 검사 (TodoForm, LoginForm, SignUpForm) |

#### Mantine 프로바이더 설정

```tsx
// main.tsx
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <Notifications position="top-right" />
    <App />
  </MantineProvider>
);
```

#### 테마 커스터마이징

```typescript
// theme.ts
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Pretendard, -apple-system, sans-serif',
  defaultRadius: 'md',
  components: {
    Button: { defaultProps: { size: 'sm' } },
    TextInput: { defaultProps: { size: 'sm' } },
    Select: { defaultProps: { size: 'sm' } },
  },
});
```

#### 주요 컴포넌트 매핑

| 화면 요소 | Mantine 컴포넌트 |
|-----------|-----------------|
| TODO 입력 폼 | `TextInput`, `Textarea`, `Select`, `DatePickerInput`, `Button` |
| TODO 항목 | `Card`, `Checkbox`, `Badge`, `ActionIcon`, `Group`, `Text` |
| TODO 리스트 | `Stack`, `ScrollArea` |
| 검색 바 | `TextInput` (leftSection에 검색 아이콘) |
| 필터/정렬 | `Select`, `Group` |
| 로그인/회원가입 | `Paper`, `TextInput`, `PasswordInput`, `Button`, `Tabs` |
| 헤더 | `AppShell.Header`, `Group`, `Title`, `Button` |
| 우선순위 뱃지 | `Badge` (color: red/yellow/blue) |
| 알림 | `notifications.show()` |
| 레이아웃 | `AppShell`, `Container` |

### 5.2 상태 관리 전략

```
┌─────────────────────────────────────────┐
│           React Context (authContext)    │
│   - 로그인 상태                          │
│   - 사용자 정보                          │
│   - 로그인/로그아웃 함수                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           Zustand (todoStore)           │
│   - TODO 목록                           │
│   - 로딩/에러 상태                       │
│   - CRUD 액션                           │
│   - 로컬 스토리지 연동 (캐시)             │
└─────────────────────────────────────────┘
```

- **인증 상태**: React Context로 관리 (앱 전역에서 필요)
- **TODO 데이터**: Zustand로 관리 (로컬 스토리지에 캐시하여 로딩 UX 개선)
- **개발 초기**: 로컬 스토리지만으로 동작 → 백엔드 완성 후 API 연결

### 5.3 화면 구성

#### Desktop View (1280px)

![Desktop Wireframe](images/wireframe-desktop.svg)

- 로그인 화면: 중앙 카드 레이아웃, Login/Sign Up 탭 전환
- 메인 화면: 헤더(앱 이름 + 사용자 + 로그아웃) → 입력 폼 → 검색/필터 바 → TODO 리스트
- TODO 항목: 체크박스 + 좌측 우선순위 컬러바 + 제목/설명 + 우선순위 뱃지 + 마감일 + 삭제 버튼
- 완료 항목: 텍스트 strikethrough + 회색 처리

#### Mobile View (375px)

![Mobile Wireframe](images/wireframe-mobile.svg)

- 단일 컬럼 스택 레이아웃
- New TODO 폼: 접기/펼치기 가능 (화면 공간 절약)
- 우선순위: 좌측 컬러 바 + 컴팩트 뱃지
- 필터/정렬: 가로 2분할 드롭다운
- 삭제 버튼: 축약 표시 (Del)

### 5.4 컴포넌트 트리

```
App (MantineProvider + Notifications)
├── AuthProvider (Context)
│   ├── LoginForm          — Paper, Tabs, TextInput, PasswordInput, Button
│   └── SignUpForm         — Paper, TextInput, PasswordInput, Button
└── AuthenticatedApp
    └── AppShell
        ├── AppShell.Header
        │   └── Header     — Group, Title, Text, Button
        ├── AppShell.Main
        │   ├── Container
        │   │   ├── TodoForm    — TextInput, Textarea, Select, DatePickerInput, Button
        │   │   ├── TodoSearch  — TextInput (leftSection: IconSearch)
        │   │   ├── TodoFilter  — Group, Select × 2
        │   │   ├── TodoList    — Stack
        │   │   │   └── TodoItem — Card, Group, Checkbox, Badge, Text, ActionIcon
        │   │   └── Footer
```

---

## 6. AWS CDK 인프라 설계

### 6.1 스택 구성

```typescript
// infra/lib/todo-stack.ts 개요
class TodoStack extends Stack {
  // 1. Cognito User Pool
  //    - 이메일/비밀번호 인증
  //    - User Pool Client (프론트엔드용)

  // 2. DynamoDB Table
  //    - PK: userId, SK: id
  //    - PAY_PER_REQUEST 빌링 모드

  // 3. Lambda Functions
  //    - createTodo, getTodos, deleteTodo, toggleTodo
  //    - Node.js 20.x 런타임
  //    - DynamoDB 읽기/쓰기 권한

  // 4. API Gateway (REST)
  //    - Cognito Authorizer
  //    - CORS 설정 (GitHub Pages 도메인 허용)
  //    - 리소스 및 메서드 매핑
}
```

### 6.2 배포 파이프라인

```
[코드 Push] → [GitHub Actions] → 프론트엔드 빌드 → GitHub Pages 배포
                                → (수동/별도) CDK deploy → AWS 리소스 배포
```

---

## 7. 개발 단계별 마일스톤

### Phase 0: 모노레포 초기화

1. 루트 `package.json` 생성 (npm workspaces 설정)
2. `tsconfig.base.json` 생성 (공통 TypeScript 설정)
3. `packages/shared` 패키지 생성 — `Todo`, `Priority` 타입 정의
4. `packages/frontend`, `packages/backend`, `packages/infra` 디렉토리 구성
5. 각 패키지의 `tsconfig.json`이 루트 `tsconfig.base.json`을 extends 하도록 설정
6. `.gitignore` 설정

### Phase 1: 프론트엔드 단독 동작

1. Vite + React + TypeScript + Mantine 프로젝트 초기화 (`packages/frontend`)
2. `@todo-app/shared`에서 타입 import 확인
3. ESLint + Prettier 설정, Jest + React Testing Library 설정
4. Husky pre-commit hook 구성 (프론트엔드 실행 코드 변경 시 lint fix → build → test 자동 수행)
5. Context + useReducer 기반 상태 관리 구현 (StorageService 인터페이스를 통한 로컬 스토리지 연동)
6. UI 컴포넌트 구현 (TodoForm, TodoList, TodoItem, TodoSearch, TodoFilter)
7. 검색(제목), 필터(우선순위), 정렬 기능 구현
8. 접근성(a11y) 적용 (ARIA 속성, 키보드 네비게이션)

> 이 단계에서 백엔드 없이 로컬 스토리지만으로 완전한 CRUD 동작

### Phase 2: 백엔드 구현

1. AWS CDK 프로젝트 초기화
2. DynamoDB 테이블 생성
3. Lambda 핸들러 구현 (CRUD + toggle)
4. API Gateway 설정 및 CORS 구성
5. Cognito User Pool 설정

### Phase 3: 프론트-백엔드 연동

1. Cognito 로그인/회원가입 UI 구현
2. API 클라이언트 구현 (`todoApi.ts`)
3. Zustand 스토어를 API 호출로 전환 (로컬 스토리지는 캐시로 유지)
4. 인증 상태에 따른 라우팅 처리

### Phase 4: 배포 및 CI/CD

1. GitHub Actions 워크플로 작성 (프론트엔드 빌드 → GitHub Pages)
2. CDK로 AWS 인프라 배포
3. 환경변수 설정 (API URL, Cognito 설정)
4. 통합 테스트

---

## 8. 기술 스택 요약

| 영역 | 기술 |
|------|------|
| 프로젝트 구조 | 모노레포 (npm workspaces) |
| 프론트엔드 | React, TypeScript, Vite |
| UI 라이브러리 | Mantine v7 (@mantine/core, hooks, dates, notifications, form) |
| 상태 관리 | React Context + useReducer (TODO), React Context (인증) |
| 테스트 | Jest, React Testing Library |
| 코드 품질 | ESLint, Prettier, Husky (pre-commit hook) |
| 백엔드 | AWS Lambda (Node.js / TypeScript) |
| 데이터베이스 | Amazon DynamoDB |
| 인증 | AWS Cognito |
| API | Amazon API Gateway (REST) |
| 인프라 코드 | AWS CDK (TypeScript) |
| CI/CD | GitHub Actions |
| 호스팅 | GitHub Pages (프론트엔드), AWS (백엔드) |
