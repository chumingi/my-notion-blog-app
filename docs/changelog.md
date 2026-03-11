# Changelog

Full development history. Newest entries at the top.

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
