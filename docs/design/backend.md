# 백엔드 설계 (CDK + Lambda 통합)

> `packages/backend` — AWS CDK 인프라 정의와 Lambda 비즈니스 로직을 하나의 패키지에서 관리한다.

## 패키지 구조

```
packages/backend/
├── bin/
│   └── app.ts               # CDK 앱 엔트리포인트
├── lib/
│   └── todo-stack.ts         # CDK 스택 정의 (모든 AWS 리소스)
├── src/
│   ├── handlers/             # Lambda 핸들러 (비즈니스 로직)
│   │   ├── createTodo.ts
│   │   ├── getTodos.ts
│   │   ├── deleteTodo.ts
│   │   └── toggleTodo.ts
│   └── utils/
│       ├── dynamodb.ts       # DynamoDB 클라이언트 래퍼
│       └── response.ts       # API 응답 헬퍼 (success/error + CORS)
├── test/
│   └── todo-stack.test.ts    # CDK 스냅샷 테스트
├── cdk.json
├── tsconfig.json
└── package.json
```

**핵심 원칙**: CDK `NodejsFunction`이 `src/handlers/*.ts`를 esbuild로 자동 번들링하므로, Lambda 코드를 별도로 빌드할 필요가 없다.

---

## CDK 스택 (lib/todo-stack.ts)

하나의 스택에서 모든 AWS 리소스를 정의한다.

### 리소스 구성

| # | 리소스 | CDK Construct | 설명 |
|---|--------|---------------|------|
| 1 | DynamoDB 테이블 | `dynamodb.Table` | PK: userId, SK: id, PAY_PER_REQUEST |
| 2 | Lambda 함수 ×4 | `lambda.NodejsFunction` | createTodo, getTodos, deleteTodo, toggleTodo |
| 3 | Cognito Identity Pool | `cognito.CfnIdentityPool` | 비인증 접근 활성화 |
| 4 | IAM Role (비인증) | `iam.Role` | API Gateway invoke 권한 |
| 5 | API Gateway (REST) | `apigateway.RestApi` | IAM 인증, CORS |

### 리소스 간 연결

```
Cognito Identity Pool
  └── 비인증 IAM Role → execute-api:Invoke 권한

API Gateway (IAM 인증)
  ├── POST   /todos          → createTodo Lambda
  ├── GET    /todos          → getTodos Lambda
  ├── DELETE /todos/{id}     → deleteTodo Lambda
  └── PATCH  /todos/{id}/toggle → toggleTodo Lambda

각 Lambda
  └── TABLE_NAME 환경변수 → DynamoDB 읽기/쓰기 권한
```

### CfnOutput (배포 후 프론트엔드에 전달)

| Output | 용도 |
|--------|------|
| `ApiUrl` | API Gateway 엔드포인트 URL |
| `IdentityPoolId` | Cognito Identity Pool ID |
| `Region` | AWS 리전 |

---

## Lambda 핸들러 패턴 (src/handlers/)

모든 핸들러는 동일한 패턴을 따른다:

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { success, error } from '../utils/response';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // 1. userId 추출
  const userId = event.requestContext.identity?.cognitoIdentityId;
  if (!userId) return error('UNAUTHORIZED', '사용자를 식별할 수 없습니다.', 401);

  // 2. 입력 파싱 (POST: body, DELETE/PATCH: pathParameters)
  // 3. 유효성 검증
  // 4. DynamoDB 유틸 호출
  // 5. success/error 응답 반환
}
```

### 핸들러별 동작

| 핸들러 | 입력 | DynamoDB 연산 | 응답 |
|--------|------|--------------|------|
| createTodo | `body: { title, description?, priority, dueDate }` | `putItem(todo)` | 201 + 생성된 todo |
| getTodos | - | `queryItems(userId)` | 200 + todo 배열 |
| deleteTodo | `pathParameters: { id }` | `deleteItem(userId, id)` | 200 + { id } |
| toggleTodo | `pathParameters: { id }` | `queryItems` → `updateItem(SET completed)` | 200 + 업데이트된 todo |

### userId 추출 방식

Cognito Identity Pool 비인증 접근 시 API Gateway가 `event.requestContext.identity.cognitoIdentityId`에 고유한 identity ID를 설정한다. 이 값을 DynamoDB의 PK(`userId`)로 사용한다.

---

## DynamoDB 유틸리티 (src/utils/dynamodb.ts)

`@aws-sdk/lib-dynamodb`의 `DynamoDBDocumentClient`를 래핑하여 단순화한다.

| 함수 | SDK 명령 | 용도 |
|------|---------|------|
| `putItem(item)` | `PutCommand` | TODO 생성 |
| `queryItems(userId)` | `QueryCommand` | 사용자별 TODO 조회 |
| `deleteItem(userId, id)` | `DeleteCommand` | TODO 삭제 |
| `updateItem(userId, id, expr, values)` | `UpdateCommand` | 필드 업데이트 (토글) |

- 테이블 이름은 `process.env.TABLE_NAME`에서 읽는다 (CDK에서 Lambda 환경변수로 주입)
- `ReturnValues: 'ALL_NEW'`로 업데이트 후 전체 항목 반환

---

## 응답 헬퍼 (src/utils/response.ts)

모든 Lambda 응답에 CORS 헤더를 포함한다.

```typescript
success(data, statusCode?)  → { statusCode, headers, body: { success: true, data } }
error(code, message, statusCode?) → { statusCode, headers, body: { success: false, error: { code, message } } }
```

CORS 헤더: `Access-Control-Allow-Origin: *`, `Content-Type: application/json`

---

## 테스트 전략

| 테스트 대상 | 위치 | 방식 |
|------------|------|------|
| CDK 스택 | `test/todo-stack.test.ts` | `Template.fromStack()` assertions — 리소스 존재/속성 검증 |
| DynamoDB 유틸 | `src/utils/__tests__/dynamodb.test.ts` | `jest.mock` — SDK send 함수 mock |
| Lambda 핸들러 | `src/handlers/__tests__/handlers.test.ts` | `jest.mock` — dynamodb 유틸 mock, 이벤트 객체 조립 |

### CDK 테스트 검증 항목

- DynamoDB: 테이블 1개, PK/SK 키 스키마, PAY_PER_REQUEST
- Lambda: 함수 4개, TABLE_NAME 환경변수, Node.js 20.x
- Cognito: Identity Pool 1개, 비인증 활성화
- API Gateway: REST API 1개

---

## 배포

```bash
# CloudFormation 템플릿 생성 (로컬 검증)
npm run synth -w @todo-app/backend

# AWS에 배포
npm run deploy -w @todo-app/backend

# 리소스 삭제
npm run destroy -w @todo-app/backend
```

배포 후 콘솔에 출력되는 `ApiUrl`, `IdentityPoolId`, `Region`을 프론트엔드 환경변수로 설정한다.
