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
- **Last completed feature**: `blog-pages` (post + note list and detail pages from JSON cache)
- **Current branch**: `main` (ready for next feature)
- **Next branch**: `feature/block-renderer`

**What's implemented:**
- Full project documentation (requirements, architecture, roadmap, decisions, git-workflow, screens, setup)
- Next.js 16 + TypeScript + Tailwind + App Router base project
- Notion OAuth: connect page, start redirect, callback handler, token exchange
- Sync import: types, slug utility, Notion fetch (posts + notes), JSON cache writer/reader, POST /api/import, /admin/import page
- Blog pages: /posts list+detail, /notes list+detail, lib/notion/blocks.ts (block fetch), generateStaticParams from cache

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
| Notion block renderer | `feature/block-renderer` | planned |
| Layout (Header, Footer, dark mode) | `feature/layout` | planned |
| Tag filter UI | `feature/tag-filter` | planned |
| SEO (meta, OG image) | `feature/seo` | planned |
| Vercel deploy | `feature/deploy` | planned |

*Initial docs were committed directly to main as root commit (no prior commits existed).

---

## Next Recommended Feature

**Feature**: `block-renderer`
**Goal**: Implement Notion block renderer to display actual page content

**Scope:**
- `components/blocks/NotionBlock.tsx` — recursive block renderer (paragraph, heading_1/2/3, bulleted/numbered list, code, image, quote, callout, divider, toggle)
- `components/blocks/RichText.tsx` — inline text style renderer (bold, italic, code, link, strikethrough)
- Replace placeholder in `/posts/[slug]` and `/notes/[slug]` with `<NotionBlock>` components
- Code blocks: shiki syntax highlighting

**Done criteria:**
- Common Notion block types render correctly
- Unsupported types silently return null (console.warn in dev)
- No `dangerouslySetInnerHTML`
- Build passes with no type errors

**Recommended branch**: `feature/block-renderer`
**Commit example**: `feat(renderer): add notion block and rich text renderer components`

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

**Next target**: `feature/blog-pages`
