# TODO 웹 앱 - 요건 정의서

## 1. 프로젝트 개요

- **프로젝트명**: TODO 웹 앱
- **목적**: 할 일을 등록, 관리, 추적할 수 있는 웹 애플리케이션
- **대상 사용자**: 개인 사용자 (데모용)

---

## 2. 요건 정의를 위한 질문 목록

### 2.1 기능 요건 (Functional Requirements)

| # | 질문 | 선택지/예시 | 결정 사항 |
|---|------|------------|----------|
| Q1 | TODO 항목에 포함할 정보는? | 제목+설명+마감일+우선순위 | |
| Q2 | 우선순위 기능이 필요한가? | 상-중-하  | |
| Q3 | 마감일(Due Date) 설정이 필요한가? | 필요 | |
| Q4 | 카테고리/태그 분류 기능이 필요한가? | 없음 | |
| Q5 | TODO 상태는 어떻게 관리할 것인가? | 완료/미완료 | |
| Q6 | 검색 기능이 필요한가? | 제목만만 | |
| Q7 | 정렬 기능이 필요한가? | 생성일 / 마감일 / 우선순위 / 이름순 | |
| Q8 | 필터링 기능이 필요한가? | 우선순위별 | |
| Q9 | TODO 수정(편집) 기능이 필요한가? | 불필요 | |
| Q10 | TODO 삭제 시 확인 절차는? | 바로 삭제 | |

### 2.2 사용자/인증 (User & Authentication)

| # | 질문 | 선택지/예시 | 결정 사항 |
|---|------|------------|----------|
| Q11 | 로그인/회원가입 기능이 필요한가? | 불필요. Cognito Identity Pool로 비인증 사용자 식별 | |
| Q12 | 소셜 로그인을 지원할 것인가? | 없음 | |
| Q13 | 여러 사용자 간 TODO 공유 기능이 필요한가? | 불필요 | |

### 2.3 데이터 저장 (Data Storage)

| # | 질문 | 선택지/예시 | 결정 사항 |
|---|------|------------|----------|
| Q14 | 데이터를 어디에 저장할 것인가? | DynamoDB | |
| Q15 | 오프라인에서도 사용 가능해야 하는가? | 불필요 | |

### 2.4 기술 스택 (Tech Stack)

| # | 질문 | 선택지/예시 | 결정 사항 |
|---|------|------------|----------|
| Q16 | 프론트엔드 프레임워크는? | React | |
| Q17 | UI 라이브러리? | Mantine (React UI 컴포넌트 라이브러리) | |
| Q18 | 상태관리? | React Context + useReducer (StorageService 추상화) | |
| Q19 | 테스트? | Jest, React Testing Library | |
| Q20 | 빌드 도구 | Vite | |
| Q21 | 백엔드 | Node.js (TypeScript) | |
| Q22 | 인프라 | AWS CDK로 서버리스 (API Gateway, Lambda, DynamoDB) 아키텍처 사용 | |
| Q23 | 프로젝트 구조 | 모노레포 (npm workspaces) — shared, frontend, backend(CDK+Lambda 통합) 3패키지 | |

### 2.5 UI/UX

| # | 질문 | 선택지/예시 | 결정 사항 |
|---|------|------------|----------|
| Q20 | 반응형 디자인(모바일 대응)이 필요한가? | 필요 (Mantine v7 반응형) | |
| Q21 | 다크 모드를 지원할 것인가? |  불필요 | |
| Q22 | 드래그 앤 드롭으로 순서 변경이 필요한가? |  불필요 | |
| Q23 | 애니메이션/트랜지션 효과는? | 없음 | |

### 2.6 비기능 요건 (Non-Functional Requirements)

| # | 질문 | 선택지/예시 | 결정 사항 |
|---|------|------------|----------|
| Q24 | 예상 동시 사용자 수는? | 소규모 | |
| Q25 | 배포 환경은? | 로컬만 / GitHub Pages / Vercel / AWS | |
| Q26 | 접근성(a11y) 기준을 충족해야 하는가? | 필요 | |
| Q27 | 다국어 지원이 필요한가? | 한국어만 | |

### 2.7 배포 및 유지보수 관련

| # | 질문 | 선택지/예시 | 결정 사항 |
|---|------|------------|----------|
| Q28 | 배포 대상 플랫폼? | AWS에 배포, 프론트엔드와 CI/CD는 Github Pasges와 Github Action 사용 | |

---

## 3. 핵심 기능 요건 (결정 후 작성)

> 위 질문에 대한 답변이 확정되면 아래 항목을 채워 넣습니다.

### 3.1 필수 기능 (Must Have)

- [ ] TODO 등록 (Create)
- [ ] TODO 목록 조회 (Read)
- [ ] TODO 수정 (Update)
- [ ] TODO 삭제 (Delete)
- [ ] TODO 완료/미완료 상태 토글

### 3.2 선택 기능 (Nice to Have)

- [ ] 우선순위 설정
- [ ] 마감일 설정
- [ ] 카테고리/태그
- [ ] 검색 및 필터링
- [ ] 드래그 앤 드롭 정렬
- [ ] 다크 모드

---

## 3.3 백엔드 요건

### 아키텍처

- **AWS 서버리스 아키텍처** 사용
- API Gateway (REST) → Lambda → DynamoDB
- 인프라 코드(IaC): AWS CDK (TypeScript) — `NodejsFunction`으로 Lambda 자동 번들링
- CI/CD: GitHub Actions
- backend 패키지에 CDK 스택 + Lambda 핸들러를 통합 관리 (infra 패키지 없음)

### 권한 제어 (Cognito Identity Pool)

- 로그인/회원가입 UI는 **불필요**
- **Cognito Identity Pool**의 비인증(unauthenticated) 접근을 활성화하여 익명 사용자를 식별
- 각 브라우저 세션에 고유한 `identityId`가 부여되어 사용자별 TODO 데이터를 격리
- API Gateway에 IAM 인증 적용 → Cognito Identity Pool이 발급한 임시 자격증명으로 API 호출

### API 설계

| 메서드 | 경로 | 설명 | 요청 Body |
|--------|------|------|-----------|
| `POST` | `/todos` | TODO 생성 | `{ title, description?, priority, dueDate }` |
| `GET` | `/todos` | 사용자별 TODO 목록 조회 | - |
| `DELETE` | `/todos/{id}` | TODO 삭제 | - |
| `PATCH` | `/todos/{id}/toggle` | 완료/미완료 토글 | - |

- userId는 Cognito Identity Pool의 `identityId`에서 추출
- 수정(PUT) 엔드포인트는 없음 (Q9: 불필요)

### DynamoDB 테이블

| 속성 | 타입 | 키 | 설명 |
|------|------|-----|------|
| `userId` | String | Partition Key (PK) | Cognito Identity ID |
| `id` | String | Sort Key (SK) | TODO UUID |
| `title` | String | - | 제목 (필수, 최대 100자) |
| `description` | String | - | 설명 (선택, 최대 500자) |
| `priority` | String | - | HIGH / MEDIUM / LOW |
| `dueDate` | String | - | 마감일 (ISO 8601) |
| `completed` | Boolean | - | 완료 여부 |
| `createdAt` | String | - | 생성일시 (ISO 8601) |

### 배포

- 백엔드 인프라: `cdk deploy`로 AWS에 배포
- 프론트엔드: GitHub Actions → GitHub Pages 자동 배포
- 환경변수: API Gateway URL, Cognito Identity Pool ID

---

## 4. 제약 조건

- 데모용 프로젝트이므로 빠른 개발이 가능한 기술 스택 우선
- 복잡한 서버 인프라 없이 구동 가능해야 함
- 프론트엔드·백엔드·인프라를 모노레포로 관리하여 공유 타입의 일관성을 유지

---

## 5. 마일스톤 및 우선순위

- 기본 TODO CRUD 기능 구현
    - 처음에는 프론트만으로 동작하도록 구현하고 백엔드 구현이 되면 백엔드에 연결
- UI/UX 개선
- 필터링 및 정렬 기능 구현
- 데이터 관리 기능 구현
- 추가 기능 구현 (사용자 피드백 기반)

---

## 5. 다음 단계

1. 위 질문 목록에 대한 의사결정
2. 확정된 요건을 바탕으로 기술 설계 문서 작성
3. 화면 설계 (와이어프레임)
4. 구현
