# Pre-PRD: DevOps 및 운영 원칙

> 이 프로젝트는 **바이브 코딩 교육용 데모 프로젝트**다. 실제 프로덕션이 아닌 학습 자료로 사용되며, 최소 비용과 빠른 반복 주기를 최우선한다.

## 핵심 원칙

### 1. 교육 우선, 프로덕션 아님

- 이 프로젝트의 1차 목적은 **AI 보조 개발 (바이브 코딩)을 학습하는 것**이다
- 모든 기술 선택은 "학습자가 빠르게 이해하고 따라할 수 있는가"를 기준으로 한다
- 과도한 추상화, 엔터프라이즈 패턴, 복잡한 CI/CD는 지양한다

### 2. 비용: AWS 프리 티어 한도 내 운영

모든 AWS 리소스는 프리 티어 범위 내에서 동작하도록 설계한다. 유료 전환 가능성이 있는 서비스는 사용하지 않는다.

| 서비스 | 프리 티어 한도 | 본 프로젝트 사용량 예상 |
|--------|---------------|----------------------|
| Lambda | 월 100만 요청, 40만 GB-초 | 데모 수준 — 무료 |
| API Gateway | 월 100만 호출 (12개월) | 데모 수준 — 무료 |
| DynamoDB | 25GB 스토리지, 25 RCU/WCU | PAY_PER_REQUEST + 소량 데이터 — 무료 |
| Cognito | 월 50,000 MAU (Identity Pool 비인증 무제한) | 무료 |
| Amplify Hosting | 월 15GB serve, 1000 빌드 분 (12개월) | 외부 빌드 사용 — 무료 |
| CloudWatch Logs | 5GB 수집 | 데모 수준 — 무료 |

**비용 안전장치:**

- DynamoDB는 **PAY_PER_REQUEST** 모드로 설정 (프로비저닝 X)
- Lambda 타임아웃은 기본값 (3초) 유지, 메모리는 최소 (128MB~256MB)
- CloudWatch Logs 보존 기간은 7일 이하로 설정 고려
- 불필요한 리소스는 `cdk destroy`로 즉시 삭제 가능하도록 단일 스택 유지
- **비용 알림 설정 권장**: AWS Budgets에서 월 $1 초과 시 이메일 알림

### 3. MVP 접근: 동작하는 가장 작은 단위부터

**Do (지향):**

- 핵심 기능 먼저 구현 (CRUD → 검색/필터 → 인증 → 배포)
- 서버리스 아키텍처로 관리 부담 최소화
- 로컬 스토리지 폴백 모드로 백엔드 없이도 완전 동작
- Husky pre-commit hook으로 품질 자동 검증 (CI 대체 수준)
- 단일 CDK 스택 (infra 분리 없이 backend 패키지 통합)

**Don't (지양):**

- 사용자 계정 시스템 (Cognito Identity Pool 비인증으로 대체)
- 멀티 환경 (dev/staging/prod) — 단일 환경만 운영
- 복잡한 CI/CD 파이프라인 — GitHub Actions의 기본 워크플로만 사용
- 모니터링/알림/메트릭 시스템 구축 — CloudWatch 기본 로그만 활용
- 마이크로서비스, GraphQL, 메시지 큐 등 과한 기술
- 국제화(i18n), 다크 모드, 반응형 외 추가 UX 기능

### 4. 빠른 반복 주기

- **단일 커밋 단위**: 10분~1시간 내 완료할 수 있는 크기
- **작업 단위별 분리 커밋**: 관련 파일끼리만 묶어서 순차 커밋
- **pre-commit hook 자동 검증**: lint → build → test를 커밋마다 자동 수행
- **문서와 코드 동기화**: `docs/tasks.md`, `docs/prompt-history.md`를 커밋 전 업데이트

---

## DevOps 단순화 전략

### 환경 구성

```
Local (개발)       → Vite dev server + 로컬 스토리지 모드
Amplify (데모/운영) → GitHub Actions 빌드 + Amplify Hosting 자동 배포
AWS 백엔드 (선택)   → 수동 cdk deploy (프리 티어, 학습자 선택적 배포)
```

### CI/CD

- **ci.yml**: push/PR 시 lint → build → test (품질 게이트)
- **deploy-frontend.yml**: CI 성공 시 Amplify에 프론트엔드 자동 배포
  - Vite 빌드 → zip 패키징 → `aws amplify create-deployment` → 배포 완료 대기
- **백엔드(CDK) 배포**: 수동 `npm run deploy` (학습자가 직접 실행)

### 보안 최소선

- Secrets는 GitHub Secrets에만 저장 (`.env`는 Git 추적 금지)
- 백엔드 CDK 자격증명은 로컬 `aws configure`로만 관리
- Amplify 배포용 IAM 사용자는 최소 권한만 부여 (`amplify:CreateDeployment`, `StartDeployment`, `GetJob`)
- Cognito Identity Pool 비인증 Role은 `execute-api:Invoke`만 허용

### 모니터링

- CloudWatch Logs만 사용 (추가 도구 X)
- 비용: AWS Budgets로 월 $1 초과 시 알림
- 성능: 별도 모니터링 없음 (데모 규모)

---

## 의사결정 원칙

무언가를 추가하려 할 때 다음 질문을 던진다:

1. **교육 가치**: 이 기술/도구가 학습자에게 의미 있는 배움을 주는가?
2. **비용**: 프리 티어를 벗어나거나 유료 전환 가능성이 있는가? → 있다면 지양
3. **복잡도**: MVP 범위를 넘어서는가? → 넘어선다면 나중 Phase로 미루기
4. **유지 부담**: 한 번 설정으로 끝나는가, 지속적인 관리가 필요한가?

질문 1만 "Yes"이고 나머지 3개가 "부담 없음"일 때만 도입한다.

---

## 참고 문서

- [requirements.md](../requirements.md) — 기능 요건
- [tasks.md](../tasks.md) — 작업 체크리스트
- [design/infrastructure.md](../design/infrastructure.md) — 배포 파이프라인, AWS 리소스 목록
- [design/backend.md](../design/backend.md) — CDK 스택 + Lambda 통합 구조
