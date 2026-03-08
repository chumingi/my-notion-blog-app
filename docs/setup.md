# Setup Guide

프로젝트를 로컬에서 실행하기 위한 사전 준비 사항.

---

## 1. 시스템 요구사항

### Node.js
- **권장 버전**: Node.js 20 LTS (20.x)
- 확인 방법: `node -v`
- 설치: [https://nodejs.org](https://nodejs.org) 또는 `nvm` 사용 권장

```bash
# nvm 사용 시
nvm install 20
nvm use 20
```

### pnpm
- **버전**: 9.x 이상
- 설치:

```bash
npm install -g pnpm
```

- 확인 방법: `pnpm -v`

---

## 2. Notion OAuth 앱 설정

이 서비스는 Notion OAuth (공개 통합)를 사용한다. Internal Integration Token이 아님.

### 2-1. Notion OAuth 앱 생성

1. [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 접속
2. "새 Integration 만들기" 클릭
3. 기본 정보 입력:
   - **이름**: `my-blog-app` (또는 원하는 이름)
   - **로고**: 선택 사항
   - **연결할 워크스페이스**: 본인 워크스페이스 선택
4. **Integration 유형**: `Public` 선택
   - Public으로 설정해야 OAuth redirect flow를 사용할 수 있음
5. **OAuth Domain & URIs** 섹션:
   - **Redirect URIs**: 아래 두 값 모두 등록
     - 로컬: `http://localhost:3000/api/notion/callback`
     - 배포: `https://your-domain.vercel.app/api/notion/callback`
6. **Capabilities (권한)** 설정:
   - `Read content` 체크 (필수)
   - `Read user information including email` 체크 (선택, 연결 상태 표시용)
   - 그 외 쓰기 권한은 모두 해제
7. 저장 후 확인:
   - **OAuth client ID** 복사 (공개 가능한 값)
   - **OAuth client secret** 복사 (절대 노출 금지)

### 2-2. Notion Database 생성

앱은 두 개의 Notion Database를 사용한다.

#### Posts Database
블로그 포스트용. 아래 속성을 반드시 추가:

| 속성 이름 | 속성 타입 | 값 |
|-----------|-----------|-----|
| Title | title (기본) | 포스트 제목 |
| Slug | text | URL 슬러그 (예: `my-first-post`) |
| Status | select | `draft` / `published` / `archived` |
| Tags | multi_select | 태그 목록 |
| Category | select | 카테고리 |
| PublishedAt | date | 발행 날짜 |
| Summary | text | 포스트 요약 (목록 화면용) |

#### Notes Database
학습 기록용. 아래 속성을 반드시 추가:

| 속성 이름 | 속성 타입 | 값 |
|-----------|-----------|-----|
| Title | title (기본) | 노트 제목 |
| Slug | text | URL 슬러그 |
| Tags | multi_select | 태그 목록 |
| Date | date | 작성/학습 날짜 |
| Status | select | `draft` / `published` |

### 2-3. Database를 Integration에 연결

각 Database 페이지에서:
1. 우측 상단 `...` 메뉴 → "커넥션" 또는 "Connections"
2. 생성한 Integration 선택하여 연결
3. OAuth 연결 승인 시 해당 Integration이 접근할 수 있는 페이지를 선택하게 됨

### 2-4. Database ID 확인

Notion에서 Database를 열었을 때 URL 구조:
```
https://www.notion.so/{workspace}/{DATABASE_ID}?v=...
```
또는 Database를 전체 페이지로 열면:
```
https://www.notion.so/{DATABASE_ID}?v=...
```

`DATABASE_ID`는 32자리 hex 문자열 (하이픈 포함 36자).

---

## 3. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성한다.
(`.env.local.example`을 복사해서 사용)

```bash
cp .env.local.example .env.local
```

### `.env.local.example` 항목 설명

```env
# ─── Notion OAuth 앱 정보 ────────────────────────────────────────────
# Notion Integrations 페이지 > OAuth client ID
# Public 값이지만 서버 사이드에서만 사용
NOTION_CLIENT_ID=your-client-id-here

# Notion Integrations 페이지 > OAuth client secret
# 절대 클라이언트에 노출하지 않을 것
NOTION_CLIENT_SECRET=your-client-secret-here

# OAuth callback URI (Notion 앱 설정의 Redirect URIs와 정확히 일치해야 함)
# 로컬: http://localhost:3000/api/notion/callback
# 배포: https://your-domain.vercel.app/api/notion/callback
NOTION_REDIRECT_URI=http://localhost:3000/api/notion/callback

# ─── Notion Access Token ─────────────────────────────────────────────
# OAuth 연결 완료 후 /api/notion/callback에서 발급받은 토큰
# 초기에는 비어 있음. /notion/connect 에서 OAuth 완료 후 채워짐.
NOTION_ACCESS_TOKEN=

# ─── Notion Database IDs ─────────────────────────────────────────────
# 블로그 포스트를 저장하는 Notion Database의 ID
NOTION_POSTS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 학습 기록을 저장하는 Notion Database의 ID
NOTION_NOTES_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── Admin 보호 ──────────────────────────────────────────────────────
# /admin/import, /notion/connect 접근 시 사용하는 시크릿
# 추측하기 어려운 임의 문자열로 설정 (예: openssl rand -hex 32 결과)
ADMIN_SECRET=your-secret-string-here
```

> **주의**: `.env.local`은 절대 git에 커밋하지 않는다. `.gitignore`에 포함되어 있는지 확인할 것.

### ADMIN_SECRET 생성 방법

```bash
# macOS / Linux
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. 로컬 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3000)
pnpm dev

# 빌드
pnpm build

# 빌드 결과 실행
pnpm start
```

---

## 5. 체크리스트

로컬 실행 전 확인:

- [ ] Node.js 20 LTS 설치 완료
- [ ] pnpm 설치 완료
- [ ] Notion OAuth 앱 생성 (Public 유형)
- [ ] Redirect URI 등록 (로컬 + 배포)
- [ ] Client ID, Client Secret 복사
- [ ] Posts DB 생성 및 필수 속성 추가
- [ ] Notes DB 생성 및 필수 속성 추가
- [ ] 각 DB에 Integration 연결 완료
- [ ] DB ID 확인 및 복사
- [ ] `.env.local` 파일 작성 완료 (NOTION_ACCESS_TOKEN은 OAuth 후 채움)
- [ ] 앱 실행 후 `/notion/connect`에서 OAuth 연결 완료
- [ ] `/admin/import`에서 첫 Import 실행 확인
