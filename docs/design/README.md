# TODO 웹 앱 - 기술 설계 문서

## 1. 시스템 아키텍처

![System Architecture](/05차시_프로젝트%20기획%20및%20설계-20251002T130745Z-1-001/docs/images/architecture.svg)

- **클라이언트**: React + Vite + Mantine (GitHub Pages 배포)
- **권한 제어**: AWS Cognito Identity Pool (비인증 사용자 식별, 로그인 불필요)
- **API**: API Gateway (REST) + IAM 인증 (Cognito 임시 자격증명)
- **비즈니스 로직**: AWS Lambda (Node.js 20.x / TypeScript) - 4개 함수
- **데이터베이스**: DynamoDB (PK: userId, SK: id)
- **인프라 관리**: AWS CDK (TypeScript) + NodejsFunction으로 Lambda 자동 번들링
- **프로젝트 구조**: 모노레포 (npm workspaces) — shared, frontend, backend(CDK+Lambda 통합) 3패키지
- **CI/CD**: GitHub Actions → GitHub Pages 자동 배포

---

## 문서 구성

| 문서 | 내용 |
|------|------|
| [project-structure.md](project-structure.md) | 모노레포 디렉토리 구조, 패키지 설정 |
| [data-model.md](data-model.md) | Todo 데이터 모델, DynamoDB 테이블 설계 |
| [api.md](api.md) | API 엔드포인트, 응답 형식, 권한 제어 흐름 |
| [frontend.md](frontend.md) | Mantine UI, 상태 관리, 화면 구성, 컴포넌트 트리 |
| [infrastructure.md](infrastructure.md) | CDK 스택, 배포 파이프라인 |

---

## 기술 스택 요약

| 영역 | 기술 |
|------|------|
| 프로젝트 구조 | 모노레포 (npm workspaces) |
| 프론트엔드 | React, TypeScript, Vite |
| UI 라이브러리 | Mantine v7 (@mantine/core, hooks, dates, notifications, form) |
| 상태 관리 | React Context + useReducer |
| 테스트 | Jest, React Testing Library |
| 코드 품질 | ESLint, Prettier, Husky (pre-commit hook) |
| 백엔드 | AWS Lambda (Node.js / TypeScript) |
| 데이터베이스 | Amazon DynamoDB |
| 권한 제어 | AWS Cognito Identity Pool (비인증 사용자 식별) |
| API | Amazon API Gateway (REST) |
| 인프라 코드 | AWS CDK (TypeScript) + NodejsFunction |
| CI/CD | GitHub Actions |
| 호스팅 | GitHub Pages (프론트엔드), AWS (백엔드) |

---

## 개발 단계별 마일스톤

### Phase 0: 모노레포 초기화

1. 루트 `package.json` 생성 (npm workspaces 설정)
2. `tsconfig.base.json` 생성 (공통 TypeScript 설정)
3. `packages/shared` 패키지 생성 — `Todo`, `Priority` 타입 정의
4. `packages/frontend`, `packages/backend` 디렉토리 구성
5. `.gitignore` 설정

### Phase 1: 프론트엔드 단독 동작

1. Vite + React + TypeScript + Mantine 프로젝트 초기화
2. Context + useReducer 기반 상태 관리 (StorageService 추상화)
3. UI 컴포넌트 구현 (반응형), 검색/필터/정렬, 접근성
4. Husky pre-commit hook, Jest 통합 테스트

> 이 단계에서 백엔드 없이 로컬 스토리지만으로 완전한 CRUD 동작

### Phase 2: 백엔드 구현

1. CDK 프로젝트 초기화 (`packages/backend`)
2. Cognito Identity Pool (비인증 접근 활성화)
3. DynamoDB, Lambda 핸들러 (NodejsFunction)
4. API Gateway (IAM 인증 + CORS)

### Phase 3: 프론트-백엔드 연동

1. Cognito Identity Pool 연동 (비인증 자격증명)
2. API 클라이언트 (SigV4 서명)
3. TodoContext → API 호출 전환

### Phase 4: 배포 및 CI/CD

1. GitHub Actions CI/CD
2. CDK deploy + GitHub Pages 배포
