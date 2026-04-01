# 데이터 모델

## TODO 항목

```typescript
interface Todo {
  id: string;            // UUID (SK)
  userId: string;        // Cognito Identity ID (PK)
  title: string;         // 제목 (필수, 최대 100자)
  description: string;   // 설명 (선택, 최대 500자)
  priority: Priority;    // 우선순위
  dueDate: string;       // 마감일 (ISO 8601, e.g. "2026-04-15")
  completed: boolean;    // 완료 여부
  createdAt: string;     // 생성일시 (ISO 8601)
}

enum Priority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}
```

## DynamoDB 테이블 설계

| 속성 | 타입 | 키 | 설명 |
|------|------|-----|------|
| `userId` | String | Partition Key (PK) | Cognito Identity ID |
| `id` | String | Sort Key (SK) | TODO UUID |
| `title` | String | - | 제목 |
| `description` | String | - | 설명 |
| `priority` | String | - | HIGH / MEDIUM / LOW |
| `dueDate` | String | - | 마감일 |
| `completed` | Boolean | - | 완료 여부 |
| `createdAt` | String | - | 생성일시 |

- **PK를 userId로 설정**: 사용자별 TODO 조회를 효율적으로 처리
- **SK를 id로 설정**: 개별 TODO 접근 가능
- 정렬/필터링은 클라이언트 사이드에서 처리 (소규모 데이터)
- 빌링 모드: PAY_PER_REQUEST
