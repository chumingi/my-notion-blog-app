# Development Progress

## Project Overview

- **Name**: my-notion-blog-app
- **Goal**: Personal learning log and tech blog powered by Notion as CMS
- **Structure**: Notion → (manual import) → JSON cache → SSG public pages
- **Status**: Week 1 in progress — Notion OAuth done, Import layer next

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
- **Last completed feature**: `sync-import` (Notion import pipeline + JSON cache + admin page)
- **Current branch**: `feature/sync-import` (ready to merge)
- **Next branch**: `feature/blog-pages`

**What's implemented:**
- Full project documentation (requirements, architecture, roadmap, decisions, git-workflow, screens, setup)
- Next.js 16 + TypeScript + Tailwind + App Router base project
- Notion OAuth: connect page, start redirect, callback handler, token exchange
- Sync import: types, slug utility, Notion fetch (posts + notes), JSON cache writer/reader, POST /api/import, /admin/import page

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
| Post list + detail pages | `feature/blog-pages` | planned |
| Note list + detail pages | `feature/note-pages` | planned |
| Notion block renderer | `feature/block-renderer` | planned |
| Layout (Header, Footer, dark mode) | `feature/layout` | planned |
| Tag filter UI | `feature/tag-filter` | planned |
| SEO (meta, OG image) | `feature/seo` | planned |
| Vercel deploy | `feature/deploy` | planned |

*Initial docs were committed directly to main as root commit (no prior commits existed).

---

## Next Recommended Feature

**Feature**: `sync-import`
**Goal**: Implement the full Notion → cache → admin-page import pipeline

**Scope:**
- `types/post.ts`, `types/note.ts` — shared type definitions
- `lib/utils/slug.ts` — slug resolution utility
- `lib/notion/posts.ts` — fetch all posts from Notion Posts DB
- `lib/notion/notes.ts` — fetch all notes from Notion Notes DB
- `lib/cache/writer.ts` — atomic JSON file write
- `lib/cache/reader.ts` — typed JSON file read
- `app/api/import/route.ts` — POST /api/import (admin protected)
- `app/admin/import/page.tsx` — import status + trigger page

**Done criteria:**
- `POST /api/import?secret=...` fetches from Notion, writes `cache/posts.json` + `cache/notes.json`
- `/admin/import?secret=...` shows last import time, post/note counts, trigger button
- Build passes with no type errors

**Recommended branch**: `feature/sync-import`
**Commit example**: `feat(import): add notion data import pipeline with json cache`

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
- `cache/` directory is in `.gitignore` — will not exist on fresh clone

**Next target**: `feature/blog-pages`
