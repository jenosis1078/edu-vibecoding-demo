# 배포 및 운영

> 백엔드 CDK 스택 설계는 [backend.md](backend.md) 참조

## 배포 파이프라인

```
┌─────────────────────┐
│   master push/PR    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐       ┌──────────────────────┐
│  ci.yml             │       │  deploy-frontend.yml │
│  - lint             │  OK   │  - build (with env)  │
│  - build            ├──────▶│  - zip dist/         │
│  - test             │       │  - Amplify deploy    │
└─────────────────────┘       └──────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  AWS Amplify Hosting │
                              │  master.<id>.amplify │
                              └──────────────────────┘

(수동) npm run deploy → CloudFormation → DynamoDB, Lambda, API Gateway, Cognito
```

## 배포 명령어

```bash
# 백엔드 (AWS CDK)
npm run synth -w @todo-app/backend    # CloudFormation 템플릿 생성 (로컬 검증)
npm run deploy -w @todo-app/backend   # AWS에 배포 (TodoStack: DynamoDB, Lambda, API Gateway, Cognito, Amplify App)
npm run destroy -w @todo-app/backend  # 리소스 삭제

# 프론트엔드 (GitHub Actions → AWS Amplify)
# 1) master 브랜치에 push
# 2) ci.yml이 lint/build/test 실행
# 3) ci.yml 성공 시 deploy-frontend.yml이 자동 트리거
# 4) Amplify에 빌드 결과물 업로드 및 배포
# (수동 실행도 가능: GitHub Actions → deploy-frontend → Run workflow)
```

## 환경변수

### 프론트엔드 (빌드 시 주입)

| 변수 | 용도 | 값 소스 |
|------|------|---------|
| `VITE_API_URL` | API Gateway 엔드포인트 URL | CDK Output `ApiUrl` |
| `VITE_IDENTITY_POOL_ID` | Cognito Identity Pool ID | CDK Output `IdentityPoolId` |
| `VITE_REGION` | AWS 리전 | CDK Output `Region` |

### GitHub Actions (배포)

Amplify 배포를 위한 GitHub Secrets:

| 변수 | 용도 |
|------|------|
| `AWS_ACCESS_KEY_ID` | Amplify 배포 권한 IAM 사용자 |
| `AWS_SECRET_ACCESS_KEY` | IAM 사용자 시크릿 |
| `AWS_REGION` | Amplify 앱이 배포된 리전 |
| `AMPLIFY_APP_ID` | CDK Output `AmplifyAppId` |
| `AMPLIFY_BRANCH_NAME` | `master` (CDK Output `AmplifyBranchName`) |
| `VITE_API_URL`, `VITE_IDENTITY_POOL_ID`, `VITE_REGION` | 빌드 시 프론트엔드에 주입 |

설정 위치: GitHub Repository Settings → Secrets and Variables → Actions

### 백엔드 (CDK가 Lambda에 자동 주입)

| 변수 | 용도 | 값 소스 |
|------|------|---------|
| `TABLE_NAME` | DynamoDB 테이블 이름 | CDK `this.table.tableName` |

## AWS 리소스 목록

배포 시 생성되는 CloudFormation 리소스:

| 리소스 | 서비스 | 비용 모델 |
|--------|--------|----------|
| TodoTable | DynamoDB | PAY_PER_REQUEST (사용량 기반) |
| CreateTodo, GetTodos, DeleteTodo, ToggleTodo | Lambda | 요청당 과금 (프리 티어: 월 100만 건) |
| TodoApi | API Gateway | 요청당 과금 (프리 티어: 월 100만 건) |
| TodoAppIdentityPool | Cognito | 무료 (Identity Pool 비인증) |
| UnauthRole | IAM | 무료 |
| FrontendApp | Amplify Hosting | 무료 티어: 월 15GB serve, 1000 빌드 분 (본 프로젝트는 외부 빌드) |
| FrontendBranch | Amplify Branch | 무료 |

> 데모 프로젝트 규모에서는 AWS 프리 티어 범위 내에서 무료로 운영 가능

## 배포 순서 (최초 셋업)

1. **AWS 계정 및 IAM 사용자 준비**
   - IAM 사용자 생성 (프로그래밍 방식 액세스)
   - `AdministratorAccess-Amplify` + `AWSCloudFormationFullAccess` + 기타 필요 권한 부여
2. **로컬에서 CDK 배포**
   ```bash
   aws configure
   cdk bootstrap  # 최초 1회
   npm run deploy -w @todo-app/backend
   ```
3. **CDK Outputs 복사**
   - `ApiUrl`, `IdentityPoolId`, `Region`, `AmplifyAppId`, `AmplifyBranchName`
4. **GitHub Secrets 등록**
   - 위의 값들 + `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
5. **master 브랜치 push**
   - ci.yml → deploy-frontend.yml 순차 실행
   - Amplify Console에서 배포 결과 확인
