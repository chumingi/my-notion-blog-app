# Architecture

이 문서는 전체 시스템 구조와 주요 설계 결정을 정의한다.

---

## 전체 구조 요약

```
[Notion]
    │
    │  (OAuth 인증 후, 읽기 전용 API 호출)
    ▼
[Notion API]
    │
    │  (수동 Import 실행 시에만)
    ▼
[Next.js Server — Import Layer]
    │
    ▼
[JSON 캐시 파일]  ◄── Import 시에만 갱신
    │
    ▼
[공개 페이지 렌더링 (SSG)]
```

**핵심 원칙**:
- Notion → 서비스: 단방향 Import-only. 서비스 → Notion 쓰기 없음.
- 공개 페이지는 캐시만 읽음. 요청마다 Notion API 호출 없음.
- Import는 사용자가 `/admin/import`에서 수동으로 실행.

---

## 디렉토리 구조

```
my-notion-blog-app/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (Header, Footer, Theme)
│   ├── page.tsx                      # 홈 (/)
│   ├── not-found.tsx                 # 전역 404
│   ├── error.tsx                     # 전역 에러 바운더리
│   ├── posts/
│   │   ├── page.tsx                  # 포스트 목록 (/posts)
│   │   └── [slug]/
│   │       └── page.tsx              # 포스트 상세 (/posts/[slug])
│   ├── notes/
│   │   ├── page.tsx                  # 노트 목록 (/notes)
│   │   └── [slug]/
│   │       └── page.tsx              # 노트 상세 (/notes/[slug])
│   ├── notion/
│   │   └── connect/
│   │       └── page.tsx              # Notion OAuth 연결 (/notion/connect)
│   ├── admin/
│   │   └── import/
│   │       └── page.tsx              # 관리자 Import (/admin/import)
│   └── api/
│       ├── notion/
│       │   └── callback/
│       │       └── route.ts          # OAuth callback (GET /api/notion/callback)
│       └── import/
│           └── route.ts              # Import API (POST /api/import)
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── blocks/
│   │   ├── NotionBlock.tsx           # Notion 블록 렌더러 (재귀 컴포넌트)
│   │   └── RichText.tsx              # 인라인 텍스트 스타일 렌더러
│   ├── ui/
│   │   ├── TagFilter.tsx             # 태그 필터 버튼 그룹
│   │   ├── PostCard.tsx              # 포스트 카드
│   │   └── TableOfContents.tsx       # TOC 사이드바
│   └── admin/
│       └── ImportButton.tsx          # Import 버튼 + 상태 표시
├── lib/
│   ├── notion/
│   │   ├── client.ts                 # Notion SDK 인스턴스 (access_token 기반)
│   │   ├── oauth.ts                  # OAuth 토큰 교환 로직
│   │   ├── posts.ts                  # Posts DB fetch 함수
│   │   ├── notes.ts                  # Notes DB fetch 함수
│   │   └── blocks.ts                 # 블록 콘텐츠 fetch 함수
│   ├── cache/
│   │   ├── reader.ts                 # 캐시 읽기
│   │   └── writer.ts                 # 캐시 쓰기 (Import 시에만)
│   └── utils/
│       └── slug.ts                   # slug 처리 유틸
├── types/
│   ├── post.ts
│   └── note.ts
├── cache/                            # 런타임 JSON 캐시 (gitignore)
│   ├── posts.json
│   └── notes.json
├── public/
├── docs/
├── .env.local
├── .env.local.example
└── CLAUDE.md
```

---

## 공개 페이지와 관리자 페이지 분리

### 공개 페이지 (`/`, `/posts`, `/notes`)
- Next.js App Router 서버 컴포넌트, SSG 기반
- 캐시 파일에서만 데이터를 읽음 (Notion API 직접 호출 없음)
- 인증 불필요

### Notion 연결 페이지 (`/notion/connect`)
- OAuth 연결 시작점
- 현재 연결 상태 표시 (연결됨 / 미연결)
- 미인증 접근 시 `ADMIN_SECRET` 검증

### 관리자 Import 페이지 (`/admin/import`)
- Notion 데이터 수동 Import 실행
- Header 네비게이션에 노출하지 않음
- `ADMIN_SECRET` 검증 필수

---

## Notion OAuth 인증 흐름

```
1. 사용자가 /notion/connect 접근
       │
       ▼
2. "Notion 연결하기" 버튼 클릭
       │
       ▼
3. Notion OAuth 인증 페이지로 리다이렉트
   https://api.notion.com/v1/oauth/authorize
     ?client_id=NOTION_CLIENT_ID
     &redirect_uri=NOTION_REDIRECT_URI
     &response_type=code
     &owner=user
       │
       ▼
4. 사용자가 Notion에서 연결 승인
       │
       ▼
5. Notion이 /api/notion/callback?code=AUTH_CODE 로 리다이렉트
       │
       ▼
6. /api/notion/callback (route.ts)
   POST https://api.notion.com/v1/oauth/token
     Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)
     code: AUTH_CODE
     grant_type: authorization_code
     redirect_uri: NOTION_REDIRECT_URI
       │
       ▼
7. access_token 수신 → 환경변수 파일에 저장
   (개인 1인 서비스이므로 NOTION_ACCESS_TOKEN으로 저장)
       │
       ▼
8. /notion/connect 페이지로 리다이렉트 (연결 완료 상태 표시)
```

### OAuth 토큰 저장 방식 (1인 개인 서비스 기준)
- 최초 OAuth 완료 후 `access_token`을 `.env.local`에 `NOTION_ACCESS_TOKEN`으로 저장.
- 이후 Import 시 이 토큰을 사용.
- Notion OAuth access_token은 만료되지 않음 (사용자가 연결을 해제하기 전까지).
- 재연결이 필요한 경우 `/notion/connect`에서 다시 OAuth 실행.

---

## Notion API 연동 구조 (Import Layer)

```
lib/notion/client.ts
  └─ new Client({ auth: process.env.NOTION_ACCESS_TOKEN })

lib/notion/posts.ts
  ├─ importAllPosts()    → databases.query(POSTS_DB_ID) [읽기 전용]
  └─ fetchPostBlocks()   → blocks.children.list(pageId) [읽기 전용]

lib/notion/notes.ts
  ├─ importAllNotes()    → databases.query(NOTES_DB_ID) [읽기 전용]
  └─ fetchNoteBlocks()   → blocks.children.list(pageId) [읽기 전용]
```

- 모든 Notion API 호출은 **읽기 전용**. 쓰기 API는 일절 사용하지 않음.
- Notion SDK는 서버 사이드 전용. 클라이언트 번들에 포함되지 않음.
- Rate limit (초당 3회): Import 실행 시 항목 간 최소 delay 적용.

---

## Import → Cache → Render 흐름

### 1. Import 실행 (수동)

```
POST /api/import
  ├─ ADMIN_SECRET 검증
  ├─ lib/notion/posts.ts → Notion Posts DB 전체 query (읽기 전용)
  │    └─ 페이지네이션 처리 (has_more 플래그로 전체 수집)
  ├─ lib/notion/notes.ts → Notion Notes DB 전체 query (읽기 전용)
  ├─ 각 항목 속성 파싱 → Post / Note 타입으로 변환
  ├─ slug 결정 (Slug 속성 → fallback: notionPageId)
  ├─ lib/cache/writer.ts → cache/posts.json, cache/notes.json 원자적 쓰기
  └─ { success: true, postsCount, notesCount, importedAt } 반환
```

- Import는 **전체 덮어쓰기** (증분 없음). 단순함 우선.
- 원자적 쓰기: 임시 파일에 쓴 후 rename으로 기존 파일 대체.

### 2. 캐시 읽기 (공개 페이지)

```
page.tsx (서버 컴포넌트)
  └─ lib/cache/reader.ts
       └─ cache/posts.json 읽기
            └─ status = 'published' 필터링
                 └─ 컴포넌트에 props 전달
```

### 3. 블록 콘텐츠 렌더링 (SSG 빌드 타임)

```
/posts/[slug]/page.tsx
  ├─ generateStaticParams() → cache/posts.json에서 published slug 목록
  └─ page()
       ├─ lib/cache/reader.ts → post 메타데이터
       └─ lib/notion/blocks.ts → Notion API 블록 fetch (읽기 전용)
```

블록 콘텐츠는 빌드 타임에만 Notion API를 호출한다. 이후 Vercel 빌드 캐시가 유지.

---

## 캐시 구조: JSON 파일 선택

### MVP 이유 (JSON vs SQLite)

| 항목 | JSON 파일 | SQLite |
|------|-----------|--------|
| 설정 복잡도 | 없음 | 드라이버 + 스키마 필요 |
| 의존성 | 없음 | `better-sqlite3` |
| 수백 개 수준 성능 | 충분 | 과도함 |
| Vercel 호환 | 주의 필요 | 동일 |

**Vercel 환경**: serverless는 `/tmp`만 쓰기 가능.

```typescript
const CACHE_DIR = process.env.VERCEL ? '/tmp/cache' : 'cache'
```

### 캐시 파일 형태

```json
{
  "importedAt": "2026-03-08T00:00:00.000Z",
  "items": [
    {
      "notionPageId": "...",
      "slug": "my-first-post",
      "title": "...",
      "status": "published",
      "lastSyncedAt": "2026-03-08T00:00:00.000Z"
    }
  ]
}
```

---

## 블록 렌더링 구조

```
components/blocks/NotionBlock.tsx
  └─ switch (block.type)
       ├─ paragraph           → <p>
       ├─ heading_1/2/3       → <h1>/<h2>/<h3> (id 부여, TOC용)
       ├─ bulleted_list_item  → <li> (ul)
       ├─ numbered_list_item  → <li> (ol)
       ├─ code               → <CodeBlock> (shiki 적용)
       ├─ image              → <img> (next/image)
       ├─ quote              → <blockquote>
       ├─ callout            → <div class="callout">
       ├─ divider            → <hr>
       ├─ toggle             → <details><summary>
       └─ (미지원 타입)       → null (개발 시 console.warn)
```

- `notion-to-md` 미사용. 직접 구현 (이유: `docs/decisions.md` #6 참조).
- 중첩 블록은 재귀 호출.
- 인라인 스타일은 `RichText.tsx`에서 처리.

---

## Slug 처리 방식

1. Notion DB `Slug` 속성 값 우선 사용
2. 비어 있으면 `notionPageId` fallback (하이픈 제거)
3. 소문자, 숫자, 하이픈만 허용
4. 중복 시 `-2`, `-3` suffix

```typescript
// lib/utils/slug.ts
function resolveSlug(slugProp: string | null, pageId: string): string {
  if (slugProp?.trim()) return sanitizeSlug(slugProp.trim())
  return pageId.replace(/-/g, '')
}
```

---

## 보안 포인트

| 항목 | 처리 방식 |
|------|-----------|
| Notion Client ID | `NOTION_CLIENT_ID` — 서버 사이드 전용 |
| Notion Client Secret | `NOTION_CLIENT_SECRET` — 서버 사이드 전용, 절대 노출 금지 |
| Notion Access Token | `NOTION_ACCESS_TOKEN` — 서버 사이드 전용 |
| DB ID | `NOTION_POSTS_DB_ID`, `NOTION_NOTES_DB_ID` — 서버 사이드 전용 |
| Admin 인증 | `ADMIN_SECRET` — `/admin/import`, `/api/import`, `/notion/connect` 검증 |
| `NEXT_PUBLIC_` prefix | 공개해도 되는 값에만 사용. 위 항목 모두 해당 없음. |
| API Route 보호 | `POST /api/import`는 `ADMIN_SECRET` 없이 401 반환 |
| OAuth callback 보호 | `state` 파라미터로 CSRF 방지 (구현 시 추가) |
| XSS | Notion 블록을 `dangerouslySetInnerHTML` 없이 React로 렌더링 |
| 이미지 | Notion 이미지 URL을 `next.config.js` `images.remotePatterns`에 등록 |

---

## 왜 이 구조가 MVP에 적합한가

1. **외부 DB 없음**: JSON 파일 캐시로 Vercel 무료 배포 가능.
2. **Notion이 CMS**: 앱은 Import-only 읽기 레이어. 별도 편집 UI 불필요.
3. **SSG 기반**: 요청마다 Notion API 호출 없음. Rate limit 무관.
4. **직접 블록 렌더러**: 렌더링 품질 완전 제어.
5. **OAuth 구조**: 1인 서비스에서도 올바른 인증 흐름. 향후 확장 시 재사용 가능.
6. **단방향 Import**: 충돌, 버전 관리 없음. 캐시 삭제 후 재Import로 항상 초기화 가능.
7. **점진적 확장**: JSON → SQLite 전환은 `lib/cache/` 내부만 수정.
