# 프로젝트 디렉토리 구조 (모노레포)

npm workspaces를 사용하여 3개 패키지를 단일 저장소에서 관리한다.

```
todo-app/                        # 모노레포 루트
├── package.json                 # 루트 package.json (workspaces 설정)
├── tsconfig.base.json           # 공통 TypeScript 설정
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI
│
├── packages/
│   ├── shared/                  # 공유 타입·유틸리티 (@todo-app/shared)
│   │   ├── src/
│   │   │   └── types/
│   │   │       └── todo.ts      # Todo, Priority 타입 정의
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── frontend/                # React 프론트엔드 (@todo-app/frontend)
│   │   ├── src/
│   │   │   ├── components/      # UI 컴포넌트
│   │   │   │   ├── todo/        # TodoForm, TodoList, TodoItem, TodoSearch, TodoFilter
│   │   │   │   └── layout/      # Header, Footer
│   │   │   ├── contexts/        # TodoContext, todoReducer, todoTypes
│   │   │   ├── services/storage/ # StorageService, LocalStorageService
│   │   │   ├── utils/           # todoFilters (검색, 필터, 정렬)
│   │   │   ├── theme.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                 # CDK + Lambda 통합 (@todo-app/backend)
│       ├── lib/
│       │   └── todo-stack.ts    # CDK 스택 정의
│       ├── bin/
│       │   └── app.ts           # CDK 엔트리포인트
│       ├── src/
│       │   ├── handlers/        # Lambda 핸들러 (createTodo, getTodos, deleteTodo, toggleTodo)
│       │   └── utils/           # dynamodb.ts
│       ├── cdk.json
│       ├── tsconfig.json
│       └── package.json
```

## 모노레포 설정

### 루트 package.json

```json
{
  "name": "todo-app",
  "private": true,
  "workspaces": ["packages/*"]
}
```

### 공유 타입 패키지 (packages/shared)

프론트엔드와 백엔드에서 동일한 `Todo`, `Priority` 타입을 사용하기 위해 공유 패키지로 분리한다.

```typescript
import { Todo, Priority } from '@todo-app/shared/src/types/todo';
```

### tsconfig.base.json (루트 공통 설정)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```
