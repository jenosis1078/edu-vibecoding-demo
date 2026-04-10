# DevOps 작업 태스크

> [prd.md](prd.md)의 원칙에 따라 DevOps 작업을 세분화한 목록. 기간 산정 없음, 항목별 완료 기준(AC) 포함.

---

## Phase 1: 로컬 개발 환경

### 1.1 모노레포 기반 설정
- [x] 루트 `package.json`에 npm workspaces 설정 (`packages/*`)
- [x] 루트 `tsconfig.base.json` 생성 (공통 TypeScript 설정)
- [x] `.gitignore` 설정 (node_modules, dist, cdk.out, .env, tsbuildinfo)
- [x] 공유 타입 패키지 `@todo-app/shared` 생성 및 의존성 참조 확인

### 1.2 프론트엔드 로컬 환경
- [x] Vite + React 19 + TypeScript 프로젝트 초기화
- [x] ESLint flat config 설정
- [x] Prettier 설정 (`.prettierrc`)
- [x] Jest + ts-jest + jsdom 설정
- [x] React Testing Library 설정
- [x] 루트 스크립트: `dev:frontend`, `build:frontend`, `test:frontend`, `lint`, `format`

### 1.3 백엔드 로컬 환경
- [x] CDK 프로젝트 초기화 (`cdk.json`, `bin/app.ts`, `lib/`)
- [x] `cdk.json`에서 `tsx` 사용 (ts-node ESM 이슈 회피)
- [x] TypeScript + Jest + ts-jest 설정
- [x] ESLint flat config + Prettier 설정
- [x] 루트 스크립트: `build:backend`, `test:backend`, `lint:backend`, `format:backend`, `synth`, `deploy`, `destroy`

### 1.4 환경변수 관리
- [x] 프론트엔드 환경변수를 `process.env.VITE_*`로 통일 (Jest 호환)
- [x] `vite.config.ts`의 `define`으로 빌드 시 주입
- [ ] `.env.example` 파일 생성 (`VITE_API_URL`, `VITE_IDENTITY_POOL_ID`, `VITE_REGION`)
  - **AC**: 신규 개발자가 `.env.example`을 복사해서 `.env.local` 생성 후 바로 동작 가능

---

## Phase 2: Git Hooks 및 코드 품질 자동화

### 2.1 Husky 설치 및 기본 설정
- [x] Husky v9 설치
- [x] `.husky/pre-commit` 스크립트 생성
- [x] `lint-staged` 설치 및 루트 `package.json`에 패턴 등록

### 2.2 프론트엔드 pre-commit 검증
- [x] 프론트엔드 코드 변경 감지 (grep 기반, Windows 호환)
- [x] lint-staged로 ESLint `--fix` 실행
- [x] `npm run build -w @todo-app/frontend` 자동 실행
- [x] `npm test -w @todo-app/frontend` 자동 실행
- [x] 단계별 성공/실패 로그 출력 (디버깅 용이)

### 2.3 백엔드 pre-commit 검증
- [x] 백엔드 코드 변경 감지
- [x] lint-staged로 ESLint `--fix` + Prettier 실행
- [x] `npm run build -w @todo-app/backend` (tsc) 자동 실행
- [x] `npm test -w @todo-app/backend` (jest) 자동 실행

### 2.4 pre-commit 최적화
- [x] 변경 영역별 조건 분기 (프론트/백 파일 없으면 해당 블록 스킵)
- [x] 프론트엔드만 변경 시 백엔드 검증 스킵, 반대도 동일
- [x] 설정 파일/문서만 변경 시 양쪽 모두 스킵

---

## Phase 3: CI (GitHub Actions)

### 3.1 기본 CI 워크플로
- [x] `.github/workflows/ci.yml` 생성
- [x] `master` push + PR 트리거 설정
- [x] Node.js 20 setup + npm cache 활성화
- [x] `npm ci`로 의존성 설치

### 3.2 프론트엔드 CI 검증
- [x] `npm run lint` 실행 (ESLint)
- [x] `npm run build:frontend` 실행 (tsc + vite build)
- [x] `npm test -w @todo-app/frontend` 실행

### 3.3 백엔드 CI 검증
- [ ] `npm run lint:backend` 추가
- [ ] `npm run build:backend` 추가 (tsc)
- [ ] `npm run synth -w @todo-app/backend` 추가 (CDK synth 검증)
- [ ] `npm run test:backend` 추가
  - **AC**: CI에서 백엔드 단독 실패도 PR 머지 차단

### 3.4 공유 타입 CI 검증
- [x] `npm test -w @todo-app/shared` 실행

### 3.5 CI 성능 최적화
- [ ] 변경된 워크스페이스만 빌드/테스트 (path filter 기반)
  - **AC**: 프론트엔드만 변경된 PR에서는 백엔드 job 스킵
- [ ] 매트릭스 빌드 또는 병렬 job 분리 검토
  - **AC**: CI 전체 소요 시간 단축

### 3.6 CI 품질 게이트
- [ ] PR에 대한 필수 status check 활성화 (GitHub 저장소 설정)
  - **AC**: CI 실패 시 master 병합 차단
- [ ] Dependabot 설정 (npm 의존성 자동 업데이트)
  - **AC**: `.github/dependabot.yml` 생성, 주간 PR 자동 생성

---

## Phase 4: 프론트엔드 배포 (AWS Amplify)

### 4.1 CDK 스택에 Amplify App 정의
- [x] `lib/todo-stack.ts`에 `amplify.CfnApp` 추가 (name: `todo-app-frontend`)
- [x] `amplify.CfnBranch`로 `master` 브랜치 정의 (`enableAutoBuild: false`)
- [x] SPA 라우팅 폴백 (`customRules`: 404 → `/index.html`)
- [x] CDK Output: `AmplifyAppId`, `AmplifyBranchName`, `AmplifyDefaultDomain`
- [x] CDK 스냅샷 테스트에 Amplify 리소스 검증 추가 (3 tests)

### 4.2 GitHub Actions 배포 워크플로
- [x] `.github/workflows/deploy-frontend.yml` 생성
- [x] 트리거: `workflow_run`으로 CI 완료 후 실행 + `workflow_dispatch` 수동 실행
- [x] concurrency 그룹으로 동시 실행 방지
- [x] `actions/checkout@v4` + `actions/setup-node@v4` (node 20, npm cache)
- [x] 프론트엔드 빌드 (`VITE_*` 환경변수 주입)
- [x] `aws-actions/configure-aws-credentials@v4`로 AWS 인증
- [x] `dist/` 폴더를 zip으로 패키징
- [x] `aws amplify create-deployment` → 업로드 → `start-deployment`
- [x] `aws amplify get-job`으로 배포 상태 폴링 (최대 5분)
  - **AC**: master push 후 CI 성공 시 deploy 워크플로 자동 실행

### 4.3 GitHub Secrets 등록
- [ ] `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — Amplify 배포 권한 IAM 사용자
- [ ] `AWS_REGION` — Amplify 앱이 배포된 리전
- [ ] `AMPLIFY_APP_ID` — CDK Output `AmplifyAppId` 값
- [ ] `AMPLIFY_BRANCH_NAME` — `master`
- [ ] `VITE_API_URL`, `VITE_IDENTITY_POOL_ID`, `VITE_REGION` — 빌드 시 주입
  - **AC**: GitHub Actions 워크플로가 시크릿을 정상 참조

### 4.4 Amplify 배포 권한 IAM 정책
- [ ] IAM 사용자 생성 (프로그래밍 방식 액세스)
- [ ] 최소 권한 정책 부여:
  - `amplify:CreateDeployment`
  - `amplify:StartDeployment`
  - `amplify:GetJob`
  - 특정 `AmplifyAppId` 리소스로 제한
  - **AC**: IAM Access Analyzer에서 과도한 권한 경고 없음

### 4.5 배포 검증
- [ ] 수동 smoke test: Amplify URL 접속 후 TODO 추가/삭제/토글
- [ ] SPA 라우팅 폴백 확인 (없는 경로 → index.html 반환)
- [ ] 빌드 아티팩트 크기 확인 (현재 602KB — 500KB 경고 해결 여부 검토)
- [ ] Amplify Console에서 배포 로그 및 소요 시간 확인

---

## Phase 5: AWS 인프라 (CDK, 선택적)

### 5.1 CDK 스택 검증
- [x] `TodoStack`에 DynamoDB, Lambda×4, API Gateway, Cognito Identity Pool 정의
- [x] CDK 스냅샷 테스트 (9 tests)
- [x] `npm run synth` 로컬 실행 성공 확인

### 5.2 AWS 계정 및 CLI 설정 (학습자 개별)
- [ ] AWS 계정 생성 (프리 티어)
- [ ] AWS CLI 설치 및 `aws configure` (region: `ap-northeast-2`)
- [ ] IAM 사용자 생성 및 CDK 배포용 권한 부여
- [ ] CDK Bootstrap 실행 (`cdk bootstrap`)
  - **AC**: `aws sts get-caller-identity`로 인증 확인

### 5.3 수동 배포
- [ ] `npm run deploy -w @todo-app/backend` 실행
  - **AC**: CloudFormation 스택 `TodoStack` CREATE_COMPLETE
- [ ] Outputs 확인 (`ApiUrl`, `IdentityPoolId`, `Region`)
- [ ] DynamoDB 테이블, Lambda 함수, API Gateway, Cognito Identity Pool 콘솔 확인

### 5.4 API 수동 검증
- [ ] curl 또는 Postman으로 API Gateway 호출 (SigV4 서명 필요)
- [ ] 또는 프론트엔드 로컬에서 `.env.local`에 Outputs 값 설정 후 CRUD 동작 확인
  - **AC**: TODO 생성 → DynamoDB 테이블에 데이터 저장 확인

### 5.5 리소스 정리
- [ ] 학습 완료 후 `npm run destroy -w @todo-app/backend` 실행
- [ ] CloudFormation 스택 삭제 확인
- [ ] 수동 확인: DynamoDB 테이블, Lambda, API Gateway, Identity Pool 모두 삭제됨

---

## Phase 6: 비용 관리 및 안전장치

### 6.1 비용 최소화 구성
- [x] DynamoDB PAY_PER_REQUEST 모드 설정
- [x] Lambda 기본 메모리 사용 (128MB) — CDK 기본값
- [ ] Lambda 타임아웃 기본값(3초) 확인
- [ ] CloudWatch Logs 보존 기간 7일로 설정 (`logRetention` 옵션)
  - **AC**: 로그 그룹이 7일 후 자동 삭제

### 6.2 비용 알림
- [ ] AWS Budgets에서 월 $1 초과 시 이메일 알림 설정
- [ ] 서비스별 사용량 확인 방법 문서화 (Billing Dashboard)

### 6.3 프리 티어 모니터링
- [ ] 프리 티어 사용량 확인 방법 안내 (AWS Console → Billing)
- [ ] 주요 서비스별 한도 문서 내 명시 (prd.md에 완료)

---

## Phase 7: 보안

### 7.1 시크릿 관리
- [x] `.env`, `.env.local`을 `.gitignore`에 포함
- [ ] GitHub Secrets에만 민감 정보 저장 (`VITE_*`)
- [ ] AWS 자격증명은 로컬 `~/.aws/credentials`만 사용 (CI에 저장 X)
- [ ] `.env.example`에는 가짜 값만 포함

### 7.2 IAM 최소 권한
- [x] Cognito 비인증 Role에 `execute-api:Invoke`만 부여
- [x] Lambda 실행 역할에 DynamoDB 읽기/쓰기만 부여 (해당 테이블 한정)
- [ ] IAM Access Analyzer 결과 확인 (AWS 콘솔)

### 7.3 CORS 설정
- [x] API Gateway CORS 설정 (개발: `*`)
- [ ] 프로덕션 배포 시 GitHub Pages 도메인으로 제한
  - **AC**: `Access-Control-Allow-Origin`이 특정 도메인만 허용

### 7.4 의존성 취약점 스캔
- [ ] `npm audit` 정기 실행 (CI에 포함 검토)
- [ ] GitHub Dependabot 알림 활성화 (저장소 Settings → Security)

---

## Phase 8: 모니터링 및 로깅

### 8.1 CloudWatch Logs
- [x] Lambda 로그가 CloudWatch Logs에 자동 기록됨 (CDK 기본 동작)
- [ ] 주요 이벤트 로깅 추가 (errors, cold starts, userId 기록)
- [ ] 로그 그룹 보존 기간 설정 (7일)

### 8.2 에러 추적
- [ ] Lambda 핸들러에서 try/catch 및 에러 로깅 패턴 통일
- [ ] 프론트엔드 에러 콘솔 출력 확인 (추가 도구 X)

### 8.3 성능 관찰 (선택)
- [x] CloudWatch Metrics 기본 지표 확인 방법 문서화 (`docs/design/infrastructure.md` 모니터링 섹션)
- [x] CloudWatch Dashboard CDK로 정의 (API GW / Lambda × 4 / DynamoDB 위젯, `TodoApp-Dashboard`)
- [ ] CloudWatch Alarm + SNS 알림 (후속 이슈)
- [ ] X-Ray는 사용하지 않음 (비용/복잡도 이유)

---

## Phase 9: 문서 및 온보딩

### 9.1 README 및 시작 가이드
- [x] `README.md`에 프로젝트 구조, 기술 스택, 시작 명령어 포함
- [x] 문서 링크 테이블 (프로젝트 관리 + 설계 문서)
- [ ] "5분 안에 로컬에서 실행하기" 섹션 추가
  - **AC**: `git clone` → `npm install` → `npm run dev:frontend`까지 명시

### 9.2 설계 문서
- [x] `docs/design/` 분리 (README, project-structure, data-model, api, frontend, backend, infrastructure)
- [x] 작업 영역별 참조 규칙 (CLAUDE.md, .cursorrules)

### 9.3 DevOps 문서
- [x] `docs/DevOps/prd.md` — 원칙 및 비용 안전장치
- [x] `docs/DevOps/tasks.md` — 본 문서

### 9.4 학습 자료
- [x] `docs/prompt-history.md` — 프롬프트 기록
- [x] `docs/tasks.md` — 기능 개발 체크리스트
- [ ] 자주 발생하는 오류 및 해결법 문서 (FAQ/Troubleshooting)

---

## Phase 10: 브랜치 전략 및 협업 프로세스

### 10.1 브랜칭 규칙 수립
- [x] `CLAUDE.md`에 브랜치 네이밍 규칙 명시 (`<type>/<issue-number>-<설명>`)
- [x] GitHub Flow 채택 (master 항상 배포 가능)
- [ ] 브랜치 보호 규칙 설정 (GitHub 저장소 Settings)
  - **AC**: master에 직접 push 금지, PR 필수

### 10.2 이슈 및 PR 템플릿
- [ ] `.github/ISSUE_TEMPLATE/` 디렉토리 생성
- [ ] Bug report 템플릿
- [ ] Feature request 템플릿
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` 작성
  - **AC**: 이슈/PR 생성 시 템플릿 자동 적용

### 10.3 커밋 메시지 컨벤션
- [x] Conventional Commits 한국어 규칙 (`<type>: <설명>`)
- [x] 작업 단위별 분리 커밋 원칙
- [ ] commitlint 도입 검토 (선택 — MVP에서는 보류)

### 10.4 PR 자동화
- [x] `.claude/commands/make-pr.md` 슬래시 커맨드 정의
- [ ] Auto-labeler (path 기반 라벨 자동 부착) 검토
- [ ] PR 자동 머지 (approval + CI 통과 시) — 보류

---

## Phase 11: 후속 개선 (Nice-to-Have)

### 11.1 개발 편의성
- [ ] VS Code workspace 설정 파일 (`.vscode/settings.json`)
- [ ] 권장 확장 프로그램 목록 (`.vscode/extensions.json`)
- [ ] ESLint/Prettier VS Code 통합 가이드

### 11.2 테스트 커버리지
- [ ] Jest coverage 리포트 설정
- [ ] Codecov 또는 GitHub Actions 주석으로 커버리지 표시

### 11.3 번들 크기 최적화
- [ ] Vite 코드 스플리팅 설정 (현재 602KB 경고)
- [ ] 동적 import 검토 (AWS SDK 등 무거운 의존성)

### 11.4 로컬 개발 편의
- [ ] LocalStack 통합 검토 (AWS 리소스 로컬 에뮬레이션)
- [ ] Docker Compose로 개발 환경 통합 (선택)

---

## 완료 범례

- `[x]` — 완료
- `[ ]` — 미완료
- **AC** — 완료 판정 기준 (Acceptance Criteria)
