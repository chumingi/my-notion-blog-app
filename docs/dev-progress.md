# Development Progress

## Project Overview

- **Name**: my-notion-blog-app
- **Goal**: Personal learning log and tech blog powered by Notion as CMS
- **Structure**: Notion → (manual import) → JSON cache → SSG public pages
- **Status**: Week 1 in progress — Import pipeline done, Blog pages next

---

## Session Rules

Every Claude session must follow this workflow:

**Session start — read in order:**
1. `CLAUDE.md`
2. `docs/dev-progress.md`
3. `docs/architecture.md`

**One feature = one branch = one session.**

**Every feature must end with:**
- `docs/dev-progress.md` updated (Current Status + Feature Index)
- `docs/changelog.md` appended (new feature entry)
- git commit (Conventional Commits, English)
- git push (push feature branch to remote)
- merge into main
- remote feature branch must NOT be deleted

---

## Current Status

- **Phase**: Week 1 — Foundation + Notion integration
- **Last completed feature**: `tag-filter` (tag filter UI on post/note list pages)
- **Current branch**: `feature/tag-filter`
- **Next branch**: `feature/seo`

**What's implemented:**
- Full project documentation (requirements, architecture, roadmap, decisions, git-workflow, screens, setup)
- Next.js 16 + TypeScript + Tailwind + App Router base project
- Notion OAuth: connect page, start redirect, callback handler, token exchange
- Sync import: types, slug utility, Notion fetch (posts + notes), JSON cache writer/reader, POST /api/import, /admin/import page
- Blog pages: /posts list+detail, /notes list+detail, lib/notion/blocks.ts (block fetch), generateStaticParams from cache
- Block renderer: RichText.tsx (inline styles), NotionBlock.tsx (paragraph/heading/list/code/image/quote/callout/divider/toggle), shiki syntax highlighting (token-based)
- Layout: Header (sticky, nav links), Footer, root layout wired (max-w-3xl, dark mode via prefers-color-scheme)
- Tag filter: TagFilter.tsx (button group UI), PostsListClient.tsx, NotesListClient.tsx (client wrappers with useState)

**Open decisions:**
- `NOTION_ACCESS_TOKEN` is stored manually in `.env.local` after OAuth (by design — personal app, token doesn't expire)
- Vercel cache path: uses `/tmp/cache` when `process.env.VERCEL` is set

---

## Feature Index

| Feature | Branch | Status |
|---------|--------|--------|
| Project documentation | `docs/add-progress-tracking`* | merged |
| Next.js project init | `feature/project-init` | merged |
| Notion OAuth connect | `feature/notion-oauth` | merged |
| Sync import (cache + API + admin page) | `feature/sync-import` | merged |
| Post list + detail pages | `feature/blog-pages` | merged |
| Note list + detail pages | `feature/blog-pages` | merged |
| Notion block renderer | `feature/block-renderer` | merged |
| Layout (Header, Footer, dark mode) | `feature/layout` | merged |
| Tag filter UI | `feature/tag-filter` | merged |
| SEO (meta, OG image) | `feature/seo` | planned |
| Vercel deploy | `feature/deploy` | planned |

*Initial docs were committed directly to main as root commit (no prior commits existed).

---

## Next Recommended Feature

**Feature**: `seo`
**Goal**: Add SEO metadata (meta tags, Open Graph) to public pages

**Scope:**
- `app/layout.tsx` — root metadata (title, description, OG defaults)
- `app/posts/[slug]/page.tsx`, `app/notes/[slug]/page.tsx` — dynamic generateMetadata

**Done criteria:**
- Each post/note detail page has unique title + description in `<head>`
- OG tags populated from post/note data
- Build passes with no type errors

**Recommended branch**: `feature/seo`
**Commit example**: `feat(seo): add dynamic metadata and OG tags to post and note pages`

---

## References

See full development history: `docs/changelog.md`

---

## Notes for Next Session

**Must read first:**
1. `CLAUDE.md`
2. `docs/dev-progress.md` ← this file
3. `docs/architecture.md`

**Warnings:**
- `NOTION_ACCESS_TOKEN` must be set in `.env.local` before import can run
- Notion DB IDs (`NOTION_POSTS_DB_ID`, `NOTION_NOTES_DB_ID`) must also be set
- `cache/` directory is in `.gitignore` — will not exist on fresh clone; run import first
- `@notionhq/client` v5: `databases.query` 없음 → `dataSources.query(data_source_id)` 사용

**Next target**: `feature/seo`
