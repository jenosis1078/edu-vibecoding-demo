# AWS CDK 인프라 설계

## 스택 구성

```typescript
// backend/lib/todo-stack.ts 개요
class TodoStack extends Stack {
  // 1. Cognito Identity Pool
  //    - 비인증(unauthenticated) 접근 활성화
  //    - 비인증 IAM Role (API Gateway invoke 권한)

  // 2. DynamoDB Table
  //    - PK: userId (Cognito identityId), SK: id
  //    - PAY_PER_REQUEST 빌링 모드

  // 3. Lambda Functions (NodejsFunction — src/handlers/ 자동 번들링)
  //    - createTodo, getTodos, deleteTodo, toggleTodo
  //    - Node.js 20.x 런타임
  //    - DynamoDB 읽기/쓰기 권한

  // 4. API Gateway (REST)
  //    - IAM 인증 (Cognito 임시 자격증명)
  //    - CORS 설정 (GitHub Pages 도메인 허용)
  //    - 리소스 및 메서드 매핑
}
```

## 배포 파이프라인

```
[코드 Push] → [GitHub Actions] → 프론트엔드 빌드 → GitHub Pages 배포
                                → (수동/별도) CDK deploy → AWS 리소스 배포
```

## 환경변수

| 변수 | 용도 | 설정 위치 |
|------|------|----------|
| `VITE_API_URL` | API Gateway 엔드포인트 URL | GitHub Secrets → 빌드 시 주입 |
| `VITE_IDENTITY_POOL_ID` | Cognito Identity Pool ID | GitHub Secrets → 빌드 시 주입 |
| `VITE_REGION` | AWS 리전 | GitHub Secrets → 빌드 시 주입 |
