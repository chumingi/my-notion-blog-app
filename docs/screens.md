# Screen Specifications

각 화면의 목적, UI 구성, 데이터 요구사항, 흐름을 정의한다.

---

## 1. 홈 (`/`)

**목적**: 서비스의 진입점. 최근 발행 포스트와 최근 학습 기록을 한눈에 보여준다.

### 주요 UI 요소
- 사이트 제목 / 한 줄 소개
- 최근 포스트 카드 목록 (최대 5개)
  - 제목, 날짜, 태그, 요약
- 최근 노트 목록 (최대 5개)
  - 제목, 날짜, 태그
- 각 섹션에 "전체 보기" 링크 (`/posts`, `/notes`)

### 사용자 행동
- 포스트 카드 클릭 → `/posts/[slug]`로 이동
- 노트 항목 클릭 → `/notes/[slug]`로 이동
- "전체 보기" 클릭 → 목록 페이지로 이동

### 필요한 데이터
- `posts`: `status = published` 기준 최근 5개 (title, slug, publishedAt, tags, summary)
- `notes`: `status = published` 기준 최근 5개 (title, slug, date, tags)

### 진입/이탈 흐름
- 진입: 직접 URL 접근, Header 로고 클릭
- 이탈: 포스트/노트 상세, 목록 페이지

---

## 2. 포스트 목록 (`/posts`)

**목적**: 발행된 블로그 포스트 전체를 탐색한다.

### 주요 UI 요소
- 페이지 제목 ("Posts" 또는 "블로그")
- 태그 필터 버튼 목록 (전체 + 개별 태그)
- 포스트 카드 목록
  - 제목, 날짜, 카테고리, 태그, 요약
- 결과 없을 경우 빈 상태 메시지

### 사용자 행동
- 태그 버튼 클릭 → 해당 태그 포스트만 표시 (클라이언트 사이드 필터)
- 포스트 카드 클릭 → `/posts/[slug]`로 이동
- "전체" 버튼 클릭 → 필터 초기화

### 필요한 데이터
- `posts`: `status = published` 전체 목록 (title, slug, publishedAt, category, tags, summary)
- 태그 목록: 포스트에서 추출

### 진입/이탈 흐름
- 진입: 홈 "전체 보기", Header 네비게이션
- 이탈: 포스트 상세, 홈

---

## 3. 포스트 상세 (`/posts/[slug]`)

**목적**: 단일 블로그 포스트의 전체 내용을 렌더링한다.

### 주요 UI 요소
- 제목 (h1)
- 메타 정보: 발행일, 카테고리, 태그
- 목차 (TOC) — heading 기반, 사이드바 또는 상단
- 본문: Notion 블록 렌더링
  - paragraph, heading 1/2/3
  - bulleted/numbered list
  - code block (언어 표시 + 복사 버튼)
  - image (Notion 호스팅 URL)
  - quote, callout, divider
  - toggle (기본 수준)
- 이전/다음 포스트 링크 (날짜 기준)

### 사용자 행동
- TOC 항목 클릭 → 해당 섹션으로 스크롤
- 코드 복사 버튼 클릭 → 클립보드에 복사
- 태그 클릭 → `/posts?tag=[tag]` (선택적, MVP 이후)
- 이전/다음 포스트 클릭 → 해당 포스트로 이동

### 필요한 데이터
- 해당 slug의 Post 메타데이터 (title, publishedAt, category, tags)
- Notion 블록 콘텐츠 (page ID 기반 fetch)

### 진입/이탈 흐름
- 진입: 포스트 목록, 홈 카드, 직접 URL
- 이탈: 뒤로가기, 이전/다음 포스트, Header 네비게이션
- 404: slug에 해당하는 published 포스트가 없으면 not-found 페이지

---

## 4. 노트 목록 (`/notes`)

**목적**: 발행된 학습 기록 전체를 탐색한다.

### 주요 UI 요소
- 페이지 제목 ("Notes" 또는 "학습 기록")
- 태그 필터 버튼 목록
- 노트 목록 (카드 또는 리스트 형태)
  - 제목, 날짜, 태그
- 결과 없을 경우 빈 상태 메시지

### 사용자 행동
- 태그 버튼 클릭 → 해당 태그 노트만 표시
- 노트 항목 클릭 → `/notes/[slug]`로 이동

### 필요한 데이터
- `notes`: `status = published` 전체 목록 (title, slug, date, tags)
- 태그 목록: 노트에서 추출

### 진입/이탈 흐름
- 진입: 홈 "전체 보기", Header 네비게이션
- 이탈: 노트 상세, 홈

---

## 5. 노트 상세 (`/notes/[slug]`)

**목적**: 단일 학습 기록의 전체 내용을 렌더링한다.

### 주요 UI 요소
- 제목 (h1)
- 메타 정보: 작성일, 태그
- 목차 (TOC) — heading 기반
- 본문: Notion 블록 렌더링 (포스트 상세와 동일한 렌더러)
- 이전/다음 노트 링크 (날짜 기준)

### 사용자 행동
- TOC 항목 클릭 → 해당 섹션으로 스크롤
- 코드 복사 버튼 클릭 → 클립보드에 복사
- 이전/다음 노트 클릭 → 해당 노트로 이동

### 필요한 데이터
- 해당 slug의 Note 메타데이터 (title, date, tags)
- Notion 블록 콘텐츠

### 진입/이탈 흐름
- 진입: 노트 목록, 홈, 직접 URL
- 이탈: 뒤로가기, 이전/다음 노트, Header 네비게이션
- 404: slug에 해당하는 published 노트가 없으면 not-found 페이지

---

## 6. Notion OAuth 연결 (`/notion/connect`)

**목적**: Notion OAuth 인증을 시작하고 연결 상태를 확인한다.

### 주요 UI 요소
- 현재 연결 상태 표시
  - 연결됨: 연결된 워크스페이스 이름 + "연결 해제" 버튼
  - 미연결: "Notion 연결하기" 버튼
- OAuth 진행 중 안내 메시지
- 연결 완료 후 성공/실패 메시지
- `/admin/import` 페이지로 이동 링크

### 사용자 행동
- `ADMIN_SECRET` 쿼리 파라미터로 페이지 접근
  - 예: `/notion/connect?secret=your-secret`
  - 미인증 시 403 반환
- "Notion 연결하기" 클릭 → Notion OAuth 페이지로 리다이렉트
- Notion 승인 → `/api/notion/callback` → 이 페이지로 복귀 (연결 완료 상태)

### 필요한 데이터
- 현재 OAuth 연결 상태 (`NOTION_ACCESS_TOKEN` 존재 여부)
- `NOTION_CLIENT_ID`, `NOTION_REDIRECT_URI` (OAuth URL 구성용)

### 진입/이탈 흐름
- 진입: 직접 URL (비공개 경로)
- 이탈: `/admin/import`로 이동

---

## 7. 관리자 Import (`/admin/import`)

**목적**: Notion 데이터를 서비스로 수동 Import하고 현재 상태를 확인한다.

### 주요 UI 요소
- 인증 상태 표시 (미인증 시 접근 차단)
- Notion 연결 상태 표시 (`/notion/connect` 링크 포함)
- 현재 캐시 상태 요약
  - 마지막 Import 시각
  - 포스트 수 (전체 / published / draft)
  - 노트 수 (전체 / published / draft)
- "Import from Notion" 버튼
- Import 진행 중 상태 표시 (로딩 인디케이터)
- Import 결과 메시지 (성공/실패, 가져온 항목 수)

### 사용자 행동
- `ADMIN_SECRET` 쿼리 파라미터로 페이지 접근
  - 예: `/admin/import?secret=your-secret`
  - 미인증 시 403 반환
- Notion 미연결 시 → `/notion/connect` 링크 안내
- "Import from Notion" 클릭 → `POST /api/import` 호출 → 캐시 갱신
- 결과 확인 후 공개 페이지로 이동

### 필요한 데이터
- 현재 캐시 상태 (`cache/posts.json`, `cache/notes.json` 메타데이터)
- Import API: `POST /api/import`

### 진입/이탈 흐름
- 진입: 직접 URL (비공개 경로, 네비게이션에 노출하지 않음)
- 이탈: 홈 또는 원하는 페이지로 수동 이동

---

## 8. 에러 / 빈 상태

### 8-1. 404 Not Found (`not-found.tsx`)

**발생 조건**:
- 존재하지 않는 slug 접근
- 존재하지만 `draft` / `archived` 상태의 포스트/노트 직접 URL 접근

**UI 요소**:
- "페이지를 찾을 수 없습니다" 메시지
- 홈으로 돌아가기 링크

### 8-2. 서버 에러 (`error.tsx`)

**발생 조건**:
- Notion API 호출 실패
- 예상치 못한 서버 오류

**UI 요소**:
- "오류가 발생했습니다" 메시지
- 새로고침 버튼 또는 홈으로 링크

### 8-3. 빈 목록 상태

**발생 조건**:
- 동기화가 아직 안 된 경우 (캐시 없음)
- published 항목이 0개인 경우
- 태그 필터 결과가 0개인 경우

**UI 요소**:
- 조건에 맞는 안내 메시지
  - 예: "아직 발행된 포스트가 없습니다."
  - 예: "해당 태그의 포스트가 없습니다."

---

## 공통 레이아웃 요소

### Header
- 사이트 로고/이름 (홈 링크)
- 네비게이션: Posts / Notes
- 다크/라이트 모드 토글

### Footer
- 저작권 표시
- GitHub 링크 (선택)

### 반응형 기준
- 모바일: 단일 컬럼, 햄버거 메뉴 (또는 간소화된 Header)
- 데스크탑: 사이드바 TOC 포함 레이아웃
