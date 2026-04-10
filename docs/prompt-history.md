# 프롬프트 히스토리

> 바이브 코딩 학습용 프로젝트의 프롬프트 기록
> 형식: 프롬프트 원문 → 의도 → 결과 요약

---

## Phase 0: 모노레포 초기화

### #1
- **프롬프트**: `체크리스트에 맞춰서 작업을 시작하자.`
- **의도**: docs/checklist.md의 Phase 0부터 순서대로 프로젝트 구조를 생성
- **결과**: 루트 package.json(npm workspaces), tsconfig.base.json, .gitignore, 4개 패키지(shared/frontend/backend/infra) 디렉토리 및 설정 파일, Todo/Priority 공유 타입 + 테스트 5개 작성. Phase 0 (8pt) 완료

### #2
- **프롬프트**: `프로젝트 설명을 위한 README를 root 폴더에 만들어줘`
- **의도**: 프로젝트 소개 문서 생성
- **결과**: README.md 생성 (기술 스택, 구조, 시작 방법, 주요 기능, 개발 단계, 문서 링크)

### #3
- **프롬프트**: `변경사항을 커밋해줘`
- **의도**: Phase 0 작업물 버전 관리
- **결과**: `feat: Phase 0 모노레포 초기화 및 공유 타입 패키지 구성` 커밋 (21파일)

---

## 규칙 파일 설정

### #4
- **프롬프트**: `@https://github.com/PatrickJS/awesome-cursorrules/... 를 참고해서 이 프로젝트의 아키텍처와 요구사항을 반영한 규칙 파일을 docs에 cursorrules.md에 만들어줘`
- **의도**: 참조 프로젝트의 AI 코딩 규칙 구조를 본뜨되, 이 프로젝트의 기술 스택과 요건에 맞게 커스터마이징
- **결과**: docs/cursorrules.md 생성 (분석 프로세스, 프로젝트 구조, 코드 스타일, 프론트엔드/백엔드 규칙, TDD 원칙, 기능 요건 요약)

### #5
- **프롬프트**: `기존 규칙도 새규칙에 반영해줘`
- **의도**: .cursorrules의 기존 규칙(Clean Architecture, SOLID 등)이 누락되지 않도록 보장
- **결과**: docs/cursorrules.md에 "Clean Architecture와 SOLID 원칙" 항목 추가

---

## Phase 1: 프론트엔드

### #6
- **프롬프트**: `이어서 docs/checklist.md의 프론트엔드 프로젝트 설정을 진행하자`
- **의도**: Phase 1.1 프로젝트 초기화 시작
- **결과**: Vite+React+TS+Mantine 프로젝트 구성, ESLint/Prettier/Jest 설정, 디렉토리 구조 생성, tsc/vite build/jest 모두 통과. Phase 1.1 (7pt) 완료

### #7
- **프롬프트**: `git hook을 이용해서 커밋시에 lint fix, build, test가 자동으로 수행되도록 하고 싶어. 실행 코드에 변경시에만 작동되어야 해.`
- **의도**: 프론트엔드 코드 품질 자동화 (CI 게이트 역할)
- **결과**: Husky + lint-staged 설정. pre-commit hook이 packages/frontend/src/ 내 ts/tsx 변경 감지 시 lint→build→test 실행. Windows 호환성 이슈 해결 (grep 기반 감지, || true). Phase 1.7 (2pt) 완료

### #8
- **프롬프트**: `나는 프론트 개발을 독립적으로 완료하고 그 다음 백엔드에 연결하는 방식으로 개발하고 싶어.`
- **의도**: 개발 순서 확립 (프론트 단독 완성 → 백엔드 → 연동)
- **결과**: 개발 방식 피드백 저장. Phase 1→2→3 순서 확정

### #9
- **프롬프트**: `응` (Phase 1.2~1.4 진행 승인)
- **의도**: 비즈니스 로직 TDD 구현 시작
- **결과**: StorageService+LocalStorageService (TDD, 6 tests), todoReducer+TodoContext (TDD, 9 tests), 검색/필터/정렬 순수 함수 (TDD, 14 tests). 29/29 전체 통과

### #10
- **프롬프트**: `체크리스트에 따라서 다음 작업을 진행해줘`
- **의도**: Phase 1.5~1.6 UI 컴포넌트 구현 및 통합
- **결과**: Header, Footer, TodoForm, TodoSearch, TodoFilter, TodoList, TodoItem 구현. App.tsx에서 전체 통합 + ARIA 접근성 적용. 빌드/테스트 통과

### #11
- **프롬프트**: `이제부터 Mantine v7으로 구현해줘. 최신버전의 사용법은 @https://mantine.dev/ 를 참고해서 구현해줘. 모바일과 데스크톱 모두 대응되는 반응형 디자인으로 작성해줘.`
- **의도**: Mantine v7 공식 문서 기반으로 반응형 UI로 리팩토링
- **결과**: 모든 UI 컴포넌트 반응형 재작성. Header(visibleFrom/hiddenFrom), TodoForm(Collapse 접기/펼치기), TodoItem(컬러바+컴팩트 뱃지), AppShell(반응형 header height). 빌드/테스트 통과

### #12
- **프롬프트**: `웹 화면에 대한 테스트를 자동화 하고 싶은데, 어떤 방법이 좋을까?` → `React Testing Library로 컴포넌트 통합 테스트를 작성해줘`
- **의도**: 수동 검증을 자동화하여 regression 방지
- **결과**: App 컴포넌트 통합 테스트 12개 작성 (렌더링 5, 토글 2, 삭제 2, 검색 3). jsdom polyfill 설정 (crypto, matchMedia, ResizeObserver). 41/41 전체 통과

---

## CI/CD & 인프라

### #13
- **프롬프트**: `깃허브에 배포할 수 있게 gh cli로 원격 레포지토리를 생성하고 로컬 리포지토리를 연결해줘`
- **의도**: GitHub 원격 저장소 생성 및 연결
- **결과**: jenosis1078/edu-vibecoding-demo 레포 생성, origin remote 연결, master 브랜치 push

### #14
- **프롬프트**: `github actions 실행 결과를 gh cli로 확인해봐` → CI 워크플로 설정
- **의도**: push 시 자동으로 lint/build/test가 실행되는 CI 파이프라인 구축
- **결과**: .github/workflows/ci.yml 생성 (lint→build→test). 45초 만에 전체 통과 확인

### #15
- **프롬프트**: `docs/requirements.md에 백엔드 요건정의를 추가해줘. 백엔드는 AWS 서버리스 아키텍처를 사용. 인증은 필요 없지만 Cognito를 사용해서 로그인 하지 않은 사용자의 권한 제어를 구현해줘.`
- **의도**: 백엔드 아키텍처 요건 확정 (서버리스, Cognito Identity Pool 비인증 접근)
- **결과**: requirements.md에 3.3 백엔드 요건 섹션 추가, design.md 인증 흐름을 Cognito Identity Pool 기반으로 전면 변경

---

## 프로젝트 관리

### #16
- **프롬프트**: `docs/checklist.md 파일명을 tasks.md로 바꾸고, 이 파일을 참조하는 다른 마크다운 문서들도 수정해줘`
- **의도**: 파일명 개선 (checklist → tasks)
- **결과**: git mv로 파일명 변경, .cursorrules/docs/cursorrules.md/README.md의 참조 경로 수정

### #17
- **프롬프트**: `.cursorrules를 설정해줘. 필요한 규칙이 있다면 추가해줘.`
- **의도**: 현재 프로젝트 상태를 반영한 최신 규칙 파일로 업데이트
- **결과**: .cursorrules에 반응형 디자인, CI/CD, 코드 스타일, 통합 테스트 규칙 추가

### #18
- **프롬프트**: `이 프로젝트는 바이브 코딩 학습용 프로젝트야. docs/prompt-history.md 파일에 프롬프트와 결과 요약, 의도를 정리해서 기록하도록 규칙을 생성하고 항상 적용되도록 설정해줘.`
- **의도**: 프롬프트 히스토리를 학습 자료로 활용하기 위한 문서화 체계 구축
- **결과**: docs/prompt-history.md 생성 (기존 대화 전체 기록), .cursorrules에 프롬프트 히스토리 규칙 추가

### #19
- **프롬프트**: `docs/design.md 문서를 방금 업데이트한 docs/requirements.md에 맞춰서 업데이트 해줘.`
- **의도**: 백엔드 요건 변경(Cognito Identity Pool 비인증, 로그인 제거)을 설계 문서에 일관성 있게 반영
- **결과**: design.md 전면 수정 — 인증→권한 제어(Identity Pool), Auth 컴포넌트 제거, 상태 관리(Zustand→Context+useReducer), 디렉토리 구조 실제 구현 반영, 컴포넌트 트리 재작성, Phase 2/3 마일스톤 업데이트

### #20
- **프롬프트**: `requirements.md에 디렉토리 구조가 backend와 infra를 분리하고 있어. aws lambda를 CDK로 개발하는 경우, 하나의 폴더에 관리 할 수 있지 않을까?`
- **의도**: CDK의 NodejsFunction을 활용하여 backend+infra를 통합, 패키지 수 축소
- **결과**: 4패키지→3패키지 구조로 변경. infra 패키지 제거, backend에 CDK 스택+Lambda 핸들러 통합. requirements.md, design.md, README.md, .cursorrules, package.json 모두 반영

### #21
- **프롬프트**: `docs/tasks.md도 docs/design.md 업데이트에 맞춰서 업데이트 해줘.`
- **의도**: 체크리스트(tasks.md)를 변경된 아키텍처(3패키지, Cognito Identity Pool, 로그인 제거)에 맞게 동기화
- **결과**: Phase 2 전면 재작성(infra→backend 통합, Cognito Identity Pool, NodejsFunction), Phase 3 간소화(로그인 UI 제거, SigV4 서명 기반), Phase 4 CI 항목 체크, 총 포인트 109→97pt 조정

### #22
- **프롬프트**: `docs/design.md도 크기가 너무 커졌어. 작업 목적에 따라 참고하기 쉽게 docs/design 폴더를 만들고 파일을 분리해서 저장해줘.`
- **의도**: 500줄짜리 단일 설계 문서를 목적별로 분리하여 필요한 부분만 빠르게 참조
- **결과**: docs/design/ 폴더에 6개 파일로 분리 (README, project-structure, data-model, api, frontend, infrastructure). 기존 design.md는 인덱스(링크 테이블)로 교체

### #23
- **프롬프트**: `Cursor Rules에서도 작업 목적에 맞게 분리된 설계문서들을 참조하도록 기존의 규칙을 업데이트 해줘.`
- **의도**: AI 어시스턴트가 작업 영역에 따라 적절한 설계 문서를 자동으로 참조하도록 규칙 명시
- **결과**: .cursorrules와 docs/cursorrules.md의 "문서 관리" 섹션을 작업 목적별 설계 문서 매핑으로 업데이트

### #24
- **프롬프트**: `백엔드와 프론트엔드도 각각의 설계문서를 참조하도록 규칙을 업데이트 해줘`
- **의도**: 프론트엔드/백엔드 섹션에서 직접 관련 설계 문서를 참조하여, 작업 시 별도로 찾지 않아도 되도록
- **결과**: .cursorrules의 프론트엔드 섹션에 `docs/design/frontend.md`, 백엔드 섹션 신규 추가하여 `docs/design/api.md`, `infrastructure.md`, `data-model.md` 참조 명시

### #25
- **프롬프트**: `docs/tasks.md의 다음 작업을 진행해줘`
- **의도**: Phase 2 백엔드 구현 시작
- **결과**: Phase 2 전체 구현 완료 (24 tests). 3개 커밋으로 작업 단위별 분리:
  1. CDK 프로젝트 초기화 (cdk.json, bin/app.ts, 의존성)
  2. Lambda 핸들러 4개 + DynamoDB 유틸리티 (TDD, 15 tests)
  3. CDK 풀스택 — API Gateway(IAM인증) + Cognito Identity Pool(비인증) + 스택 테스트 (9 tests)

### #26
- **프롬프트**: `docs/tasks.md의 이후 진행될 작업들에 대해서 커밋해야 할 내용들, 즉, 인수조건(AC)를 명시해줘.`
- **의도**: 각 작업 항목에 명확한 완료 기준을 추가하여, 커밋 전 검증 포인트를 구체화
- **결과**: Phase 2.6, Phase 3 전항목, Phase 4 전항목에 AC(Acceptance Criteria) 추가. 테스트 통과 조건, 빌드 성공 조건, 수동 검증 항목 등 구체적 기준 명시

### #27
- **프롬프트**: `백엔드의 경우, CDK를 사용해서 비즈니스로직과 인프라 관리를 함께 진행해야 해. 그에 맞춰서 문서를 추가 또는 수정해서 다시 작성해줘.`
- **의도**: CDK 스택과 Lambda 비즈니스 로직이 하나의 패키지에 있으므로, 이를 통합적으로 설명하는 설계 문서 필요
- **결과**: `docs/design/backend.md` 신규 생성 (패키지 구조, CDK 리소스 구성, Lambda 핸들러 패턴, DynamoDB 유틸, 테스트 전략, 배포). `infrastructure.md`를 배포/운영 전용으로 축소. 인덱스(design.md, README.md) 및 .cursorrules 참조 업데이트

### #28
- **프롬프트**: `README.md에 docs 폴더안의 문서들에 대한 설명과 링크도 추가해줘.`
- **의도**: README에서 프로젝트 문서 전체를 한눈에 파악하고 바로 접근할 수 있도록
- **결과**: README.md에 프로젝트 관리 4문서 + 설계 7문서 테이블 추가, 개발 단계 포인트 최신화, Cognito 설명 수정

### #29
- **프롬프트**: `백엔드도 git hook을 사용해서 lint autofix, prettier, build, test가 수행되도록 설정해줘.`
- **의도**: 프론트엔드와 동일한 코드 품질 자동화를 백엔드에도 적용
- **결과**: 백엔드 ESLint + Prettier 설정, lint-staged에 백엔드 패턴 추가, pre-commit hook에 BE 감지 블록 추가 (lint+format → tsc → jest). hook 동작 검증 완료

### #30
- **프롬프트**: `package.json의 백엔드 빌드/검증 관련 스크립트들이 잘 작동하는지 확인하고 다음으로 넘어가자.`
- **의도**: build:backend, test:backend, lint, format, synth 5개 스크립트 동작 검증
- **결과**: 5개 모두 통과. synth에서 ts-node ESM 이슈 발견 → tsx로 변경하여 해결. CDK synth로 CloudFormation 템플릿 생성 성공

### #31
- **프롬프트**: `린트에서 eslint.config.js의 require() 관련된 에러가 발생하지 않도록 설정해줘.`
- **의도**: ESLint가 자기 설정 파일(.js)을 lint하면서 require() 에러 발생 방지
- **결과**: eslint.config.js의 ignores에 `**/*.js` 추가

### #32
- **프롬프트**: (터미널에서 `npm run lint:backend` 실행 시 Missing script 에러)
- **의도**: 루트에서 `lint:backend`, `format:backend` 명령어로 바로 실행 가능하도록
- **결과**: 루트 package.json에 `lint:backend`, `format:backend` 스크립트 추가

### #33
- **프롬프트**: `Phase 3 코드 구현을 먼저해줘`
- **의도**: AWS 계정 설정과 무관하게 Phase 3 프론트-백엔드 연동 코드를 먼저 구현
- **결과**: Cognito Identity Pool 자격증명 서비스 + SigV4 서명 API 클라이언트 + TodoContext API 전환 (8 tests 추가). Vite/Jest 호환 위해 `process.env.VITE_*` + Vite `define`으로 환경변수 주입 방식 변경. 3개 커밋으로 분리 (#bb0e262, #811ff95, #2242e0b)

### #34
- **프롬프트**: `CLAUDE.md에 명명 규칙 섹션을 추가해줘. 명명 규칙에는 브랜칭 전략에 대한 내용도 추가해줘`
- **의도**: Claude Code가 일관된 브랜치/커밋/네이밍을 유지하도록 규칙 명시
- **결과**: CLAUDE.md에 명명 규칙(브랜치: `<type>/<issue-number>-<설명>`, 커밋: Conventional Commits 한국어, 파일/코드) + GitHub Flow 브랜칭 전략 추가. 모든 작업 브랜치는 gh issue와 연동

### #35
- **프롬프트**: `이 프로젝트는 교육용 프로젝트야. 비용은 최대한 프리티어 한도내에서 진행하고 빠르게 구현할 수 있는 MVP 접근방식을 사용해줘.`
- **의도**: DevOps 운영 원칙 수립 (교육 우선, 프리 티어, MVP)
- **결과**: `docs/DevOps/prd.md` 신규 생성 — 교육 프로젝트 특성, AWS 프리 티어 한도 표, Do/Don't, 의사결정 4가지 질문 정리

### #36
- **프롬프트**: `DevOps 프로젝트 수행을 위한 테스크들을 문서로 정리해줘. 기간에 대한 산정은 하지 말고 작업들을 최대한 세분화해줘.`
- **의도**: DevOps 작업을 Phase별로 세분화하여 작업 추적 가능하게
- **결과**: `docs/DevOps/tasks.md` 신규 생성 — 11개 Phase (로컬 환경, Git Hooks, CI, 배포, AWS, 비용, 보안, 모니터링, 문서, 브랜치 전략, 후속 개선). 항목별 AC 포함, 기간 산정 제외

### #37
- **프롬프트**: `Phase 1의 작업들을 계획 단계부터 포함해서 GitHub 이슈로 등록해줘.`
- **의도**: 이슈 트래킹 워크플로를 실제로 사용해보고 학습 기록으로 남김
- **결과**: gh cli로 8개 이슈 등록 — 계획 4개 (#1~#4: 모노레포, 프론트엔드, 백엔드, 환경변수 전략) + 구현 4개 (#5~#8: 1.1~1.4). 구현 이슈는 `Closes #N`으로 계획 이슈 참조

### #38
- **프롬프트**: `프론트앤드 빌드 자동화 뿐만 아니라 배포 자동화도 포함시켜줘. 프론트 배포는 AWS Amplify를 사용하는 것으로 해줘`
- **의도**: 기존 CI(lint/build/test)에 더해 AWS Amplify 자동 배포 추가
- **결과**: 3개 커밋으로 분리
  1. CDK 스택에 Amplify App + Branch 추가 (SPA 폴백, 3개 Output, 스냅샷 테스트 3개)
  2. `.github/workflows/deploy-frontend.yml` — CI 성공 시 `workflow_run` 트리거, `aws amplify create-deployment` → 업로드 → `start-deployment` → 상태 폴링
  3. docs 업데이트 (infrastructure.md 파이프라인 다이어그램, DevOps/tasks.md Phase 4 재작성, DevOps/prd.md 비용 표에 Amplify 추가)

### #39
- **프롬프트**: `/document_update` 커맨드로 문서 최신화
- **의도**: 최근 작업(Amplify, 백엔드 hook 등) 반영하여 README 및 design 인덱스 동기화
- **결과**: README.md 기술 스택 업데이트(Amplify 추가), 시작하기 섹션 확장, Git Hooks 섹션에 백엔드 추가, DevOps 문서 테이블 추가. docs/design/README.md 시스템 아키텍처와 기술 스택 요약을 Amplify/IAM 인증 기반으로 최신화
