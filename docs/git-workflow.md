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
git checkout -b feature/notion-oauth

# 2. 작업 수행

# 3. 변경 파일 스테이징
git add app/notion/connect/page.tsx
git add lib/notion/oauth.ts

# 4. 커밋 생성
git commit -m "feat(auth): add notion oauth connect flow"

# 5. main에 머지 (개인 프로젝트, PR 생략 가능)
git checkout main
git merge feature/notion-oauth

# 6. 브랜치 정리
git branch -d feature/notion-oauth
```

---

## 작업 완료 규칙

모든 작업이 끝나면 반드시 다음 순서를 따른다:

1. **변경 파일 목록 정리**
2. **기능 설명** (무엇을 했는지)
3. **테스트 방법 설명** (어떻게 확인하는지)
4. **Git commit 생성** (Conventional Commits, 영어)

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

## 참고

- [Conventional Commits 공식 문서](https://www.conventionalcommits.org/)
- 커밋 메시지는 `git log --oneline`으로 봤을 때 의미가 명확해야 한다.
- 스쿼시 머지는 사용하지 않는다. 커밋 단위를 작업 단위로 유지한다.
