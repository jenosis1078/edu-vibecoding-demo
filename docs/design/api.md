# API 설계

## 엔드포인트

| 메서드 | 경로 | 설명 | 요청 Body |
|--------|------|------|-----------|
| `POST` | `/todos` | TODO 생성 | `{ title, description?, priority, dueDate }` |
| `GET` | `/todos` | TODO 목록 조회 | - |
| `DELETE` | `/todos/{id}` | TODO 삭제 | - |
| `PATCH` | `/todos/{id}/toggle` | 완료/미완료 토글 | - |

> 수정 기능은 불필요로 결정되어 PUT 엔드포인트는 제외

## 응답 형식

```json
// 성공 응답
{
  "success": true,
  "data": { ... }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "TODO_NOT_FOUND",
    "message": "해당 TODO를 찾을 수 없습니다."
  }
}
```

## 권한 제어 흐름 (Cognito Identity Pool)

1. 사용자가 앱에 최초 접속
2. 프론트엔드가 Cognito Identity Pool에서 비인증(unauthenticated) `identityId` 발급 요청
3. Cognito가 고유한 `identityId` + 임시 AWS 자격증명(accessKeyId, secretAccessKey, sessionToken) 발급
4. 프론트엔드가 임시 자격증명으로 API Gateway에 SigV4 서명된 요청 전송
5. API Gateway의 IAM 인증이 자격증명 검증
6. Lambda에서 `event.requestContext.identity.cognitoIdentityId`로 userId 추출

> 로그인/회원가입 UI가 불필요하며, 브라우저별로 고유한 identityId가 자동 부여됨

## 시퀀스 다이어그램

![Sequence Diagram](/05차시_프로젝트%20기획%20및%20설계-20251002T130745Z-1-001/docs/images/sequence.svg)

각 요청의 처리 흐름:

1. **초기 접속**: Client → Cognito Identity Pool → 임시 자격증명 발급 → Client 저장
2. **TODO 생성 (POST)**: Client → API Gateway (IAM 인증) → Lambda (UUID 생성) → DynamoDB (PutItem)
3. **TODO 조회 (GET)**: Client → API Gateway → Lambda → DynamoDB (Query by userId) → 클라이언트 사이드 검색/필터/정렬
4. **TODO 삭제 (DELETE)**: Client → API Gateway → Lambda → DynamoDB (DeleteItem)
5. **TODO 토글 (PATCH)**: Client → API Gateway → Lambda → DynamoDB (UpdateItem: completed 반전)
