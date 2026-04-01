
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
| 백엔드 | AWS Lambda (Node.js / TypeScript) |
| 데이터베이스 | Amazon DynamoDB |
| 인증 | AWS Cognito |
| API | Amazon API Gateway (REST) |
| 인프라 | AWS CDK (TypeScript) |
| CI/CD | GitHub Actions → GitHub Pages |

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

# 전체 테스트
npm test

# 프론트엔드 빌드
npm run build:frontend

# ESLint 검사 및 자동 수정
npm run lint -w @todo-app/frontend

# 코드 포맷팅
npm run format -w @todo-app/frontend
```

## Git Hooks

Husky pre-commit hook이 설정되어 있어, `packages/frontend/src/` 내 실행 코드(ts/tsx/js/jsx) 변경 시 커밋 전 자동으로 다음이 수행됩니다:

1. **ESLint --fix** (lint-staged를 통해 staged 파일 대상)
2. **빌드** (`tsc -b && vite build`)
3. **테스트** (`jest`)

비프론트엔드 파일만 변경할 경우 hook은 스킵됩니다.

## 주요 기능

- TODO 등록 (제목, 설명, 우선순위, 마감일)
- TODO 목록 조회 및 완료/미완료 토글
- TODO 삭제
- 제목 검색
- 우선순위별 필터링
- 생성일 / 마감일 / 우선순위 / 이름순 정렬
- Cognito 기반 로그인/회원가입

## 개발 단계

| Phase | 설명 | 포인트 |
|-------|------|--------|
| Phase 0 | 모노레포 초기화 | 8pt |
| Phase 1 | 프론트엔드 단독 동작 (로컬 스토리지) | 40pt |
| Phase 2 | 백엔드 구현 (Lambda + DynamoDB) | 30pt |
| Phase 3 | 프론트-백엔드 연동 | 21pt |
| Phase 4 | 배포 및 CI/CD | 10pt |

## 문서

- [요건 정의서](docs/requirements.md)
- [기술 설계 문서](docs/design.md)
- [작업 체크리스트](docs/tasks.md)
