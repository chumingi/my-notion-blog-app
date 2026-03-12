# Changelog

Full development history. Newest entries at the top.

---

## Feature — seo

**Branch**: `feature/seo`

**Commits**:
- `feat(seo): add dynamic metadata and OG tags to post and note pages`

**Summary**:

Added SEO metadata (title template, Open Graph) to public pages.

- `app/layout.tsx`: expanded root `metadata` — `title.template` (`%s | MinGi's Blog`), OG defaults (`type: website`, `locale: ko_KR`)
- `app/posts/[slug]/page.tsx`: added `generateMetadata` — returns post `title`, `description` (from `summary`), OG `article` type with `publishedTime` and `tags`
- `app/notes/[slug]/page.tsx`: added `generateMetadata` — returns note `title`, OG `article` type

---

## Feature — tag-filter

**Branch**: `feature/tag-filter`

**Commits**:
- `feat(tag-filter): add tag filter UI to post and note list pages`

**Summary**:

Implemented client-side tag filter on post and note list pages.

- `components/ui/TagFilter.tsx`: stateless button group — "All" button + one button per tag; active state highlighted; dark mode aware
- `components/posts/PostsListClient.tsx`: `'use client'` wrapper for posts list — manages `selectedTag` state, deduplicates and sorts tags from all posts, filters displayed list
- `components/notes/NotesListClient.tsx`: same pattern for notes list
- `app/posts/page.tsx`: server component stays; delegates list rendering to `PostsListClient`
- `app/notes/page.tsx`: same — delegates to `NotesListClient`

---

## Feature — layout

**Branch**: `feature/layout`

**Commits**:
- `feat(layout): add header, footer, and root layout`

**Summary**:

Implemented global layout with Header, Footer, and updated root layout.

- `components/layout/Header.tsx`: sticky site header with nav links (/, /posts, /notes); dark mode via `prefers-color-scheme`
- `components/layout/Footer.tsx`: minimal footer with copyright
- `app/layout.tsx`: wired Header + Footer; updated metadata title/description; constrained main content to `max-w-3xl`

---

## Feature — block-renderer

**Branch**: `feature/block-renderer`

**Commits**:
- `feat(renderer): add notion block and rich text renderer components`

**Summary**:

Implemented Notion block renderer to display actual page content in post/note detail pages.

- `lib/notion/blocks.ts`: extended `NotionBlock` type with `children?: NotionBlock[]`; `fetchBlocks` now recursively fetches children when `has_children` is true
- `components/blocks/RichText.tsx`: inline text style renderer — bold, italic, strikethrough, underline, inline code, links
- `components/blocks/NotionBlock.tsx`: recursive block renderer (`NotionBlocks` array renderer + `NotionBlock` per-block); handles paragraph, heading_1/2/3, bulleted/numbered list (with grouping), code (shiki token-based, no dangerouslySetInnerHTML), image (next/image), quote, callout, divider, toggle; unsupported types return null with console.warn in dev
- `app/posts/[slug]/page.tsx`: replaced placeholder with `<NotionBlocks>`
- `app/notes/[slug]/page.tsx`: replaced placeholder with `<NotionBlocks>`

**Dependencies added**: `shiki@4.0.2`

---

## Feature — blog-pages

**Branch**: `feature/blog-pages`

**Commits**:
- `feat(pages): add post and note list and detail pages`

**Summary**:

Implemented public-facing list and detail pages for posts and notes, reading from JSON cache.

- `lib/notion/blocks.ts`: `fetchBlocks(pageId)` — `blocks.children.list` + pagination, returns `BlockObjectResponse[]`
- `app/posts/page.tsx`: `/posts` — reads `cache/posts.json`, filters `status === 'published'`, lists title/summary/date/tags
- `app/posts/[slug]/page.tsx`: `/posts/[slug]` — `generateStaticParams` from cache, renders post metadata; block content placeholder (feature/block-renderer 예정)
- `app/notes/page.tsx`: `/notes` — reads `cache/notes.json`, filters `status === 'published'`, lists title/date/tags
- `app/notes/[slug]/page.tsx`: `/notes/[slug]` — same pattern for notes

---

## Feature — sync-import

**Branch**: `feature/sync-import`

**Commits**:
- `feat(import): add notion data import pipeline with json cache`

**Summary**:

Implemented the full Notion → cache → admin-page import pipeline.

- `types/post.ts`: `Post` interface and `PostStatus` type (`draft | published | archived`)
- `types/note.ts`: `Note` interface and `NoteStatus` type (`draft | published`)
- `lib/utils/slug.ts`: `resolveSlug(slugProp, pageId, seen)` — Slug 속성 우선, fallback notionPageId, sanitize, 중복 시 `-2` suffix
- `lib/notion/posts.ts`: `importAllPosts()` — `dataSources.query()` + pagination, property parsing, typed output
- `lib/notion/notes.ts`: `importAllNotes()` — same pattern for Notes DB
- `lib/cache/writer.ts`: `writeCacheFile<T>()` — atomic write (tmp → rename), Vercel `/tmp/cache` 지원
- `lib/cache/reader.ts`: `readCacheFile<T>()` — typed JSON read, returns null if absent
- `app/api/import/route.ts` — `POST /api/import?secret=...`
  - `ADMIN_SECRET` 검증 (없으면 401)
  - posts + notes 병렬 fetch, 캐시 파일 쓰기
  - `{ success, postsCount, notesCount, importedAt }` 반환
- `app/admin/import/page.tsx` — `/admin/import?secret=...`
  - 서버 컴포넌트, `ADMIN_SECRET` 검증 (실패 시 404)
  - 마지막 import 시각, posts/notes 개수 표시
- `components/admin/ImportButton.tsx` — 클라이언트 컴포넌트
  - Import 버튼, loading/success/error 상태 표시

**Design note**: `@notionhq/client` v5.x에서 `databases.query` → `dataSources.query`로 API 변경됨. `data_source_id` 파라미터 사용.

---

## Feature — notion-oauth

**Branch**: `feature/notion-oauth`

**Commits**:
- `1ed38b4` feat(auth): implement notion oauth connect flow

**Summary**:

Implemented the complete Notion OAuth connection flow for a single-user personal app.

- `lib/notion/oauth.ts`: `generateState()`, `buildOAuthUrl()`, `exchangeCodeForToken()`
  - `generateState()` produces a 16-byte hex CSRF token
  - `buildOAuthUrl()` constructs the Notion authorization URL using `NOTION_CLIENT_ID`, `NOTION_REDIRECT_URI`
  - `exchangeCodeForToken()` sends a Basic-auth POST to `https://api.notion.com/v1/oauth/token`
- `lib/notion/client.ts`: `createNotionClient()`, `isNotionConnected()`
  - `createNotionClient()` throws a descriptive error if `NOTION_ACCESS_TOKEN` is missing
  - `isNotionConnected()` checks env var presence for UI status display
- `app/api/notion/start/route.ts` — `GET /api/notion/start?secret=...`
  - Validates `ADMIN_SECRET`
  - Generates CSRF state, sets `notion_oauth_state` httpOnly cookie (10 min TTL)
  - Redirects to Notion OAuth authorization URL
- `app/api/notion/callback/route.ts` — `GET /api/notion/callback?code=...&state=...`
  - Verifies state cookie against query param (CSRF protection)
  - Exchanges code for access token via Notion API
  - Renders inline HTML result page showing the `access_token` to copy into `.env.local`
  - Clears state cookie on success
- `app/notion/connect/page.tsx` — `/notion/connect?secret=...`
  - Admin-protected server component (redirects to 404 if secret invalid)
  - Shows "connected" state if `NOTION_ACCESS_TOKEN` is set, "not connected" otherwise
  - Links to `/api/notion/start` and `/admin/import`

**Design decision**: Access token is displayed to user and stored manually in `.env.local`. This is intentional for a personal app where the token never expires unless revoked.

---

## Feature — project-init

**Branch**: `feature/project-init`

**Commits**:
- `9285d3a` chore: init next.js 16 project with typescript, tailwind, and app router

**Summary**:

Bootstrapped the Next.js application and configured the project foundation.

- `create-next-app` used via temp directory (main project dir had CLAUDE.md which caused conflict)
- Next.js **16.1.6** (latest at time of init; docs say 14, but 16 used — functionally identical for App Router)
- React 19.2.3, TypeScript 5.9.3 (strict mode), Tailwind CSS v4, ESLint 9
- `@/*` import alias configured in `tsconfig.json`
- `next.config.ts`: added Notion image `remotePatterns`
  - `prod-files-secure.s3.us-west-2.amazonaws.com`
  - `www.notion.so`
- `.gitignore`: excludes `node_modules/`, `.next/`, `.env.local`, `cache/`
- `.env.local.example`: documents all required env vars (OAuth-based)
- `package.json` name corrected from `nextjs-init2` → `my-notion-blog-app`

---

## Feature — initial-docs

**Branch**: `main` (root commit — no prior commits existed)

**Commits**:
- `df76a29` docs: add project requirements, architecture, and workflow documentation

**Summary**:

Created the full project documentation foundation before any code.

- `docs/requirements.md`: project goals, Notion integration policy (OAuth + import-only), MVP features, excluded features, screen list, data models, tech stack, dev priorities
- `docs/roadmap.md`: 4-week implementation plan with weekly goals, risk table, backlog
- `docs/architecture.md`: full system architecture — unidirectional import diagram, directory structure, OAuth flow, cache design (JSON over SQLite), block renderer rationale, security points
- `docs/screens.md`: 8 screen specs (home, post list/detail, note list/detail, notion/connect, admin/import, error states) with UI elements, user actions, data requirements, entry/exit flows
- `docs/setup.md`: Node.js 20 LTS, pnpm, Notion OAuth app creation guide, DB property specs, `.env.local.example` explanation
- `docs/decisions.md`: 6 design decision records (OAuth choice, import-only, no realtime sync, personal app fit, JSON cache, direct block renderer)
- `docs/git-workflow.md`: branch strategy, commit convention, feature workflow, completion rules
- `CLAUDE.md`: core principles, git workflow rules, feature checklist, code style guide, stack reference

**Key policy decisions recorded**:
- Notion → service: one-way import only, no writes back to Notion
- No realtime sync (manual button only)
- JSON file cache (over SQLite) for MVP simplicity
- Direct block renderer (over `notion-to-md`) for full React-level control
