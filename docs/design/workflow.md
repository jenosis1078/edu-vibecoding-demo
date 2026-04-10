# 개발 워크플로

> 이슈 생성부터 CI/CD 배포까지의 전체 개발 흐름과 각 단계별 완료 기준을 정의한다.

## 전체 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│ 1. 이슈 생성  │ ──▶ │ 2. 브랜치     │ ──▶ │ 3. 조사/구현/    │
│ (gh issue)   │     │    생성       │     │    문서화 (TDD)  │
└──────────────┘     └──────────────┘     └────────┬─────────┘
                                                    │
                                                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│ 6. CI/CD     │ ◀── │ 5. 리뷰       │ ◀── │ 4. PR 생성       │
│    검증      │     │              │     │                  │
└──────┬───────┘     └──────────────┘     └──────────────────┘
       │
       ▼
┌──────────────┐
│ 7. 머지/배포  │
└──────────────┘
```

---

## 1. 이슈 생성

모든 작업은 **GitHub 이슈에서 시작**한다. 이슈 없이 브랜치를 만들지 않는다.

### 이슈 유형

- **[Plan]**: 구현 전 설계/의사결정이 필요한 작업
- **[Feat]**: 새 기능 구현
- **[Fix]**: 버그 수정
- **[Refactor]**: 리팩토링
- **[Docs]**: 문서 작업
- **[Chore]**: 빌드/설정/도구

### 이슈 내용 필수 항목

- **목적**: 왜 이 작업이 필요한가
- **작업 내용**: 체크리스트 형태로 구체적인 할 일
- **완료 기준 (AC)**: 무엇이 충족되면 이 이슈를 닫을 수 있는가
- **참조**: 관련 문서, 설계, 다른 이슈 링크

### 이슈 생성 방법

```bash
# 기존 이슈 확인
gh issue list

# 신규 이슈 생성
gh issue create --title "feat: TODO 폼 유효성 검증 추가" --body "..."
```

---

## 2. 작업 브랜치 생성

### 브랜치 네이밍 규칙

형식: `<type>/<issue-number>-<간략-설명>`

| type | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat/12-todo-form-validation` |
| `fix` | 버그 수정 | `fix/15-cognito-credential-expiry` |
| `refactor` | 리팩토링 | `refactor/18-todo-context-cleanup` |
| `docs` | 문서만 변경 | `docs/20-design-docs-update` |
| `chore` | 빌드/설정/도구 | `chore/22-pre-commit-hook-tuning` |
| `test` | 테스트 추가/수정 | `test/25-app-integration-tests` |

### 브랜치 생성 명령

```bash
git checkout master
git pull origin master
git checkout -b feat/12-todo-form-validation
```

**원칙**:
- 항상 `master`에서 분기
- `master`에 직접 push 금지 — 모든 변경은 PR 경유
- 하나의 브랜치는 하나의 이슈에 매핑

---

## 3. 조사 / 구현 / 문서화

### 3.1 조사

필요한 경우 관련 설계 문서를 먼저 확인한다:

| 작업 영역 | 참조 문서 |
|----------|----------|
| 프론트엔드 UI/상태 관리 | [frontend.md](frontend.md) |
| API 엔드포인트/권한 | [api.md](api.md) |
| 백엔드 Lambda/CDK | [backend.md](backend.md) |
| 데이터 모델/DynamoDB | [data-model.md](data-model.md) |
| 배포/운영 | [infrastructure.md](infrastructure.md) |
| 프로젝트 구조/패키지 | [project-structure.md](project-structure.md) |

### 3.2 구현

**TDD 적용 범위** (핵심 비즈니스 로직만):

- 스토리지 서비스, todoReducer, 검색/필터/정렬
- Lambda 핸들러, DynamoDB 유틸
- API 클라이언트
- CDK 스냅샷 테스트

**UI 우선 구현** (프론트엔드 컴포넌트):
- 실행 코드를 먼저 작성
- 통합 테스트는 후행 (React Testing Library)

**코드 스타일** (상세: [CLAUDE.md](../../CLAUDE.md)):
- `interface` 선호, `any` 금지
- 이벤트 핸들러 `handle<Event>` 접두사
- named export, early return 패턴
- 공유 타입은 `@todo-app/shared`에서만 import

### 3.3 문서화

코드 변경과 함께 관련 문서를 동기화한다.

| 변경 유형 | 업데이트 대상 |
|----------|--------------|
| 요건 변경 | `docs/requirements.md` |
| 프로젝트 구조 변경 | `docs/design/project-structure.md` |
| 데이터 모델 변경 | `docs/design/data-model.md` |
| API 계약 변경 | `docs/design/api.md` |
| UI/상태 관리 변경 | `docs/design/frontend.md` |
| 백엔드 구조 변경 | `docs/design/backend.md` |
| 배포/환경변수 변경 | `docs/design/infrastructure.md` |
| 작업 진행 상황 | `docs/tasks.md` |
| DevOps 작업 | `docs/DevOps/tasks.md` |
| 프롬프트 기록 | `docs/prompt-history.md` |

### 3.4 커밋

**작업 단위별 분리 커밋**:

```bash
git diff --stat              # 변경 파일 확인
git add <관련 파일들만>        # 작업 단위별 그룹핑
git commit                   # pre-commit hook 자동 검증
```

**커밋 메시지 형식 (Conventional Commits, 한국어)**:

```
<type>: <한국어 설명>

<상세 설명 (선택)>

<이슈 참조: Closes #12 또는 Refs #15>
```

**pre-commit hook 자동 검증**:

| 변경 영역 | 자동 수행 |
|----------|----------|
| `packages/frontend/src/**/*.{ts,tsx,js,jsx}` | ESLint --fix → Vite build → Jest |
| `packages/backend/{src,lib,bin,test}/**/*.ts` | ESLint+Prettier → tsc → Jest |
| 문서/설정 파일만 | 스킵 (빠른 커밋) |

**금지 사항**: `--no-verify`로 hook 건너뛰기 금지.

---

## 4. PR 생성

### 4.1 Push

```bash
git push -u origin feat/12-todo-form-validation
```

### 4.2 PR 생성

```bash
gh pr create \
  --title "feat: TODO 폼 유효성 검증 추가" \
  --body "$(cat <<'EOF'
## Summary
- 제목/마감일 필수 필드 유효성 검증 추가
- 제목 100자 제한, 마감일 미래 날짜만 허용

## Changes
- TodoForm에 @mantine/form 유효성 규칙 추가
- 유효성 검증 단위 테스트 추가 (3 tests)

## Test plan
- [x] npm run test -w @todo-app/frontend 통과
- [x] 로컬에서 잘못된 입력 시 에러 메시지 확인
- [x] 정상 입력 시 제출 동작 확인

Closes #12
EOF
)"
```

### 4.3 PR 본문 필수 항목

- **Summary**: 1~3 bullet로 변경 요약
- **Changes**: 주요 수정 사항
- **Test plan**: 검증 방법 체크리스트
- **이슈 참조**: `Closes #N` (자동 close) 또는 `Refs #N` (참조만)

### 4.4 슬래시 커맨드

프로젝트에는 `/make-pr` 커맨드가 정의되어 있다 ([.claude/commands/make-pr.md](../../.claude/commands/make-pr.md)):

1. `git status`/`git diff`로 변경사항 확인
2. `gh issue list`로 기존 이슈 확인, 없으면 신규 등록
3. 이슈 번호로 브랜치 생성
4. 작업 단위별 분리 커밋
5. pre-commit hook 통과 후 PR 생성

---

## 5. 리뷰

### 5.1 셀프 리뷰

PR 생성 직후 본인이 먼저 리뷰:

- [ ] Summary/Test plan이 충실한가
- [ ] 관련 문서가 업데이트되었는가
- [ ] 불필요한 파일/로그가 포함되지 않았는가
- [ ] 이슈의 AC를 모두 충족하는가

### 5.2 코드 리뷰

본 프로젝트는 교육용 1인 개발 환경이지만, 협업 상황을 가정하면 다음 기준으로 리뷰:

- **정확성**: 로직이 의도대로 동작하는가
- **테스트**: 핵심 로직에 테스트가 있는가
- **일관성**: 기존 코드 스타일과 일치하는가
- **설계 문서 부합**: 관련 설계 문서와 모순되지 않는가
- **비용**: AWS 리소스 추가 시 프리 티어 내 동작하는가 ([DevOps/prd.md](../DevOps/prd.md))

### 5.3 피드백 반영

- 리뷰 코멘트에 대응하여 추가 커밋
- 리뷰어 재확인 후 approve 받음

---

## 6. CI/CD 파이프라인 검증

### 6.1 CI 워크플로 (ci.yml)

**트리거**: `master` push, PR open/sync

**단계**:
1. `actions/checkout@v4`
2. `actions/setup-node@v4` (Node 20, npm cache)
3. `npm ci`
4. Lint (frontend + backend)
5. Build (frontend + backend)
6. Test (shared + frontend + backend)

**실패 시**: PR 머지 차단 (GitHub 저장소 Branch Protection 설정)

### 6.2 배포 워크플로 (deploy-frontend.yml)

**트리거**: `ci.yml`이 master에서 성공한 후 `workflow_run`으로 자동 실행, 또는 `workflow_dispatch` 수동 실행

**단계**:
1. 체크아웃 + Node 20 세팅
2. 프론트엔드 빌드 (`VITE_*` Secrets 주입)
3. `aws-actions/configure-aws-credentials@v4`로 AWS 인증
4. `dist/` → zip 패키징
5. `aws amplify create-deployment` → 업로드 → `start-deployment`
6. 배포 상태 폴링 (최대 5분, 10초 간격)

**필요한 GitHub Secrets**:

| 시크릿 | 용도 |
|--------|------|
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | Amplify 배포 IAM 사용자 |
| `AMPLIFY_APP_ID`, `AMPLIFY_BRANCH_NAME` | 배포 대상 Amplify 앱 |
| `VITE_API_URL`, `VITE_IDENTITY_POOL_ID`, `VITE_REGION` | 빌드 시 프론트엔드 주입 |

### 6.3 배포 후 검증

- [ ] Amplify URL 접속 → TODO CRUD 동작 확인
- [ ] 브라우저 개발자 도구 콘솔 에러 없음
- [ ] Amplify Console에서 배포 로그 확인
- [ ] CloudWatch Logs에서 Lambda 에러 없음 (백엔드 배포 시)

---

## 7. 머지 및 마무리

### 7.1 PR 머지

- CI 통과 + 리뷰 승인 완료 후 머지
- **Squash merge** 권장 (브랜치 내 여러 커밋을 하나로)
- 머지 후 feature 브랜치 자동 삭제 (GitHub 설정)

### 7.2 이슈 자동 close

PR 본문의 `Closes #N` 구문으로 머지 시 연관 이슈 자동 close.

### 7.3 로컬 정리

```bash
git checkout master
git pull origin master
git branch -d feat/12-todo-form-validation
```

### 7.4 문서 동기화 확인

- `docs/tasks.md`의 해당 항목이 체크되었는가
- `docs/prompt-history.md`에 기록되었는가 (학습 프로젝트)
- 설계 문서 변경이 있었다면 `docs/design/` 관련 파일이 반영되었는가

---

## 워크플로 요약 체크리스트

작업 시작부터 완료까지 이 체크리스트를 따른다:

- [ ] **이슈 생성**: 목적, 작업 내용, AC 명시
- [ ] **브랜치 생성**: `<type>/<issue-number>-<설명>`, master에서 분기
- [ ] **조사**: 관련 설계 문서 확인
- [ ] **구현**: TDD 대상은 테스트 먼저, UI는 실행 코드 먼저
- [ ] **문서화**: 변경 영역별 설계 문서 업데이트
- [ ] **커밋**: 작업 단위별 분리 커밋, pre-commit hook 통과
- [ ] **Push + PR**: `Closes #N` 포함한 PR 본문 작성
- [ ] **셀프 리뷰**: Summary/Test plan/문서 업데이트 확인
- [ ] **CI 통과**: lint/build/test 전체 통과
- [ ] **리뷰 승인**: 코멘트 대응 완료
- [ ] **머지**: Squash merge + 브랜치 삭제
- [ ] **배포 검증**: Amplify 배포 성공, 기능 동작 확인
- [ ] **이슈 close**: 자동 close 확인

---

## 관련 문서

- [CLAUDE.md](../../CLAUDE.md) — 전체 프로젝트 가이드, 명명 규칙, 브랜칭 전략
- [project-structure.md](project-structure.md) — 모노레포 구조
- [infrastructure.md](infrastructure.md) — 배포 파이프라인 상세
- [DevOps/prd.md](../DevOps/prd.md) — DevOps 운영 원칙
- [DevOps/tasks.md](../DevOps/tasks.md) — DevOps 작업 태스크
- [.claude/commands/make-pr.md](../../.claude/commands/make-pr.md) — PR 생성 슬래시 커맨드
