# TODO 웹 앱

할 일을 등록, 관리, 추적할 수 있는 풀스택 웹 애플리케이션입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프로젝트 구조 | 모노레포 (npm workspaces) |
| 프론트엔드 | React, TypeScript, Vite, Mantine v7 |
| 상태 관리 | React Context + useReducer |
| 테스트 | Jest, React Testing Library |
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
│   ├── backend/     # Lambda 핸들러 (@todo-app/backend)
│   └── infra/       # AWS CDK 인프라 (@todo-app/infra)
├── docs/            # 요건 정의서, 설계 문서, 체크리스트
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
```

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
- [작업 체크리스트](docs/checklist.md)
