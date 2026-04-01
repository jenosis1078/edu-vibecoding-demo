# 배포 및 운영

> 백엔드 CDK 스택 설계는 [backend.md](backend.md) 참조

## 배포 파이프라인

```
[코드 Push] → [GitHub Actions] → 프론트엔드: lint → build → test → GitHub Pages 배포
                                → 백엔드: (수동) npm run deploy → AWS CloudFormation
```

## 배포 명령어

```bash
# 백엔드 (AWS)
npm run synth -w @todo-app/backend    # CloudFormation 템플릿 생성 (로컬 검증)
npm run deploy -w @todo-app/backend   # AWS에 배포
npm run destroy -w @todo-app/backend  # 리소스 삭제

# 프론트엔드 (GitHub Pages)
# → GitHub Actions가 master push 시 자동 배포
```

## 환경변수

### 프론트엔드 (빌드 시 주입)

| 변수 | 용도 | 값 소스 |
|------|------|---------|
| `VITE_API_URL` | API Gateway 엔드포인트 URL | CDK Output `ApiUrl` |
| `VITE_IDENTITY_POOL_ID` | Cognito Identity Pool ID | CDK Output `IdentityPoolId` |
| `VITE_REGION` | AWS 리전 | CDK Output `Region` |

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

> 데모 프로젝트 규모에서는 AWS 프리 티어 범위 내에서 무료로 운영 가능
