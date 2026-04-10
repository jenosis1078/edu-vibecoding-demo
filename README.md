
# TODO 웹 앱

할 일을 등록, 관리, 추적할 수 있는 풀스택 웹 애플리케이션입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프로젝트 구조 | 모노레포 (npm workspaces) |
| 프론트엔드 | React, TypeScript, Vite, Mantine v7 |
| 상태 관리 | React Context + useReducer |
| 테스트 | Jest, React Testing Library |
| 코드 품질 | ESLint, Prettier, Husky (pre-commit hook) |
| 백엔드 | AWS Lambda (Node.js 20.x / TypeScript) |
| 데이터베이스 | Amazon DynamoDB (PAY_PER_REQUEST) |
| 권한 제어 | AWS Cognito Identity Pool (비인증 접근) |
| API | Amazon API Gateway (REST) + IAM 인증 |
| 인프라 | AWS CDK (TypeScript) + NodejsFunction |
| 프론트엔드 호스팅 | AWS Amplify Hosting |
| CI/CD | GitHub Actions (lint/build/test + Amplify 배포) |

## 프로젝트 구조

```
todo-app/
├── packages/
│   ├── shared/      # 공유 타입 (@todo-app/shared)
│   ├── frontend/    # React 프론트엔드 (@todo-app/frontend)
│   └── backend/     # CDK + Lambda 통합 (@todo-app/backend)
├── docs/            # 요건 정의서, 설계 문서, 프롬프트 히스토리
├── package.json     # 루트 (npm workspaces)
└── tsconfig.base.json
```

## 시작하기

```bash
# 의존성 설치
npm install

# 프론트엔드 개발 서버
npm run dev:frontend

# 전체 테스트 (shared + frontend + backend)
npm test

# 빌드
npm run build:frontend   # Vite
npm run build:backend    # tsc

# 린트/포맷 (프론트엔드)
npm run lint
npm run format

# 린트/포맷 (백엔드)
npm run lint:backend
npm run format:backend

# CDK (백엔드 인프라)
npm run synth            # CloudFormation 템플릿 생성 (로컬 검증)
npm run deploy           # AWS에 배포 (계정 설정 필요)
```

## Git Hooks

Husky pre-commit hook이 staged 파일을 감지해 작업 영역별로 자동 검증을 수행합니다:

**프론트엔드** (`packages/frontend/src/**/*.{ts,tsx,js,jsx}` 변경 시)
1. ESLint `--fix` (lint-staged)
2. 빌드 (`tsc -b && vite build`)
3. 테스트 (`jest`)

**백엔드** (`packages/backend/{src,lib,bin,test}/**/*.ts` 변경 시)
1. ESLint `--fix` + Prettier (lint-staged)
2. 빌드 (`tsc`)
3. 테스트 (`jest`)

해당 영역 파일 변경이 없으면 자동으로 스킵됩니다 (빠른 문서 전용 커밋 가능).

## 주요 기능

- TODO 등록 (제목, 설명, 우선순위, 마감일)
- TODO 목록 조회 및 완료/미완료 토글
- TODO 삭제
- 제목 검색
- 우선순위별 필터링
- 생성일 / 마감일 / 우선순위 / 이름순 정렬
- Cognito Identity Pool 기반 비인증 사용자 식별 (로그인 불필요)

## 개발 단계

| Phase | 설명 | 포인트 |
|-------|------|--------|
| Phase 0 | 모노레포 초기화 | 8pt |
| Phase 1 | 프론트엔드 단독 동작 (로컬 스토리지) | 40pt |
| Phase 2 | 백엔드 구현 (CDK + Lambda + DynamoDB) | 28pt |
| Phase 3 | 프론트-백엔드 연동 | 13pt |
| Phase 4 | 배포 및 CI/CD | 8pt |

## 문서

### 프로젝트 관리

| 문서 | 설명 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | Claude Code 프로젝트 가이드 + 명명/브랜칭 규칙 |
| [docs/requirements.md](docs/requirements.md) | 요건 정의서 — 기능/비기능 요건, 기술 스택 결정 |
| [docs/tasks.md](docs/tasks.md) | 기능 개발 체크리스트 — Phase별 항목, 포인트, 인수조건(AC) |
| [docs/cursorrules.md](docs/cursorrules.md) | AI 코딩 어시스턴트 상세 규칙 |
| [docs/prompt-history.md](docs/prompt-history.md) | 바이브 코딩 프롬프트 히스토리 (학습용) |

### DevOps

| 문서 | 설명 |
|------|------|
| [docs/DevOps/prd.md](docs/DevOps/prd.md) | DevOps 운영 원칙 (프리 티어, MVP, 빠른 반복) |
| [docs/DevOps/tasks.md](docs/DevOps/tasks.md) | DevOps 작업 태스크 (로컬 환경, CI, 배포, 보안, 모니터링) |

### 설계 문서 (docs/design/)

| 문서 | 설명 | 참고 시점 |
|------|------|----------|
| [design/README.md](docs/design/README.md) | 시스템 아키텍처, 기술 스택 요약, 마일스톤 | 전체 개요 파악 시 |
| [design/project-structure.md](docs/design/project-structure.md) | 모노레포 디렉토리 구조, 패키지 설정 | 파일/패키지 추가 시 |
| [design/data-model.md](docs/design/data-model.md) | Todo 데이터 모델, DynamoDB 테이블 설계 | 데이터 구조 변경 시 |
| [design/api.md](docs/design/api.md) | API 엔드포인트, 응답 형식, 권한 제어 흐름 | API 계약 확인 시 |
| [design/frontend.md](docs/design/frontend.md) | Mantine UI, 상태 관리, 화면 구성, 컴포넌트 트리 | 프론트엔드 개발 시 |
| [design/backend.md](docs/design/backend.md) | CDK 스택 + Lambda 핸들러 + DynamoDB 유틸, 테스트 전략 | 백엔드 개발 시 |
| [design/infrastructure.md](docs/design/infrastructure.md) | 배포 파이프라인, 환경변수, AWS 리소스/비용 | 배포/운영 시 |
