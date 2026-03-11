# Git Workflow

이 프로젝트의 브랜치 전략, 커밋 컨벤션, 작업 흐름을 정의한다.

---

## 브랜치 전략

```
main
 └─ feature/*
 └─ fix/*
 └─ refactor/*
```

| 브랜치 | 용도 |
|--------|------|
| `main` | 배포 가능한 상태 유지. 직접 커밋 금지. |
| `feature/*` | 새 기능 개발 |
| `fix/*` | 버그 수정 |
| `refactor/*` | 기능 변경 없는 코드 개선 |

### 브랜치 네이밍 예시

```
feature/notion-oauth
feature/sync-import
feature/blog-pages
feature/note-pages
feature/admin-import
feature/block-renderer
feature/tag-filter
feature/dark-mode

fix/notion-pagination
fix/cache-bug
fix/slug-collision

refactor/cache-layer
refactor/block-renderer
```

---

## 커밋 컨벤션

모든 커밋은 **Conventional Commits** 형식을 따르며, **영어**로 작성한다.

### 형식

```
type(scope): message
```

- `type`: 변경 종류
- `scope`: 변경 범위 (선택, 소문자)
- `message`: 명령형 현재 시제, 소문자 시작, 마침표 없음

### 허용 Type

| type | 용도 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 리팩터링 |
| `docs` | 문서 변경 |
| `chore` | 빌드, 설정, 패키지 변경 |
| `style` | 포맷, 세미콜론 등 코드 변경 없음 |
| `test` | 테스트 추가/수정 |

### 커밋 메시지 예시

```
feat(auth): add notion oauth connect flow
feat(sync): add manual import from notion endpoint
feat(posts): render post list from cache
feat(blocks): implement notion block renderer
feat(admin): add import status page

fix(notion): handle api pagination correctly
fix(cache): prevent race condition on concurrent writes
fix(slug): use page id as fallback when slug is missing

refactor(cache): simplify json file read/write logic
refactor(blocks): extract rich text component

docs(architecture): update notion import flow diagram
docs(setup): add oauth app creation guide

chore: init nextjs 14 project with typescript and tailwind
chore: add env example file
chore(deps): add @notionhq/client and shiki
```

---

## Feature 작업 흐름

```bash
# 1. main 기준으로 feature 브랜치 생성
git checkout main
git pull origin main
git checkout -b feature/sync-import

# 2. 작업 수행

# 3. 변경 파일 스테이징 (구체적으로 지정)
git add lib/notion/posts.ts lib/cache/writer.ts app/api/import/route.ts

# 4. docs 업데이트 포함 커밋
git commit -m "feat(import): add notion data import pipeline with json cache"

# 5. remote에 push (필수 — 이력 보존)
git push origin feature/sync-import

# 6. main에 머지
git checkout main
git merge feature/sync-import

# 7. 로컬 브랜치만 정리 (remote는 삭제하지 않음)
git branch -d feature/sync-import
# ❌ git push origin --delete feature/sync-import  ← 하지 않는다
```

---

## 세션 시작 규칙

새 Claude 세션을 시작할 때 반드시 다음 순서로 읽는다:

1. `CLAUDE.md` — 프로젝트 작업 규칙
2. `docs/dev-progress.md` — 현재 구현 상태, 다음 feature
3. `docs/architecture.md` — 전체 구조 참조

이 세 파일을 읽기 전에 코드를 작성하지 않는다.

---

## 작업 완료 규칙

모든 작업이 끝나면 반드시 다음 순서를 따른다:

1. **변경 파일 목록 정리**
2. **기능 설명** (무엇을 했는지)
3. **테스트 방법 설명** (어떻게 확인하는지)
4. **`docs/dev-progress.md` 업데이트** — Current Status + Feature Index
5. **`docs/changelog.md` 업데이트** — 새 feature entry 추가
6. **Git commit 생성** (Conventional Commits, 영어)
7. **git push** — feature branch를 remote에 push
8. **main merge** — local feature branch는 삭제, remote는 유지

---

## .gitignore 필수 항목

```
# 환경변수
.env.local
.env*.local

# 캐시 파일 (런타임 생성)
cache/

# Next.js
.next/
out/

# 의존성
node_modules/

# OS
.DS_Store
Thumbs.db
```

---

## Remote Branch 정책

- feature 브랜치는 merge 후 **remote를 삭제하지 않는다.**
- 이유: 이력 보존, 이전 구현 참조 가능
- 로컬 브랜치만 `git branch -d`로 정리한다.

```bash
# 올바른 정리
git branch -d feature/sync-import       # 로컬만 삭제

# 하지 않는 것
git push origin --delete feature/sync-import  # ❌
```

---

## 참고

- [Conventional Commits 공식 문서](https://www.conventionalcommits.org/)
- 커밋 메시지는 `git log --oneline`으로 봤을 때 의미가 명확해야 한다.
- 스쿼시 머지는 사용하지 않는다. 커밋 단위를 작업 단위로 유지한다.
