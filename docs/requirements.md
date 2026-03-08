# Requirements

## 프로젝트 목표

Notion을 데이터 소스로 활용하면서, Notion 단독으로는 부족한 외부 레이어(커스텀 뷰, 검색, 발행 흐름)를 제공하는 개인용 학습 기록 및 기술 블로그 서비스.

- 학습 과정을 체계적으로 기록하고 정리
- 작성한 내용을 기술 블로그로 발행
- Notion OAuth 인증을 통해 내 Notion 계정의 데이터를 가져옴
- Notion의 편집 UX는 그대로 유지하되, 외부에서 읽기/발행/탐색을 보완

---

## Notion 연동 정책

이 서비스의 Notion 연동은 다음 원칙을 따른다.

1. **OAuth 인증**: 내 Notion 계정으로 OAuth 로그인하여 연동을 승인한다.
2. **단방향 Import-only**: Notion → 서비스 방향으로만 데이터를 가져온다.
3. **읽기 전용**: 이 서비스에서 Notion 데이터를 수정하거나 다시 쓰지 않는다.
4. **실시간 동기화 없음**: Webhook, polling 등 자동 동기화를 하지 않는다.
5. **수동 Import**: 사용자가 "Import from Notion" 버튼을 눌러 직접 실행한다.

```
Notion (편집) → [수동 Import 실행] → 서비스 캐시 → 공개 페이지 렌더링
```

---

## 핵심 사용자 시나리오

1. **학습 기록**: Notion에서 학습 노트를 작성 → 관리자 페이지에서 "Import from Notion" 실행 → 앱에서 정리된 형태로 열람
2. **블로그 발행**: Notion 페이지에 `Status: published` 속성을 지정 → Import 실행 → 블로그 포스트로 노출
3. **콘텐츠 탐색**: 태그, 카테고리, 날짜 기준으로 학습 기록 및 포스트를 필터링/검색
4. **발행 관리**: Notion에서 Status 속성을 변경 → Import 실행 → 앱 반영 (앱에서 직접 수정 불가)

---

## MVP 기능 (반드시 포함)

### Notion 연동
- Notion OAuth 인증 및 연결 (`/notion/connect`)
- Notion API를 통한 페이지 목록 조회 (읽기 전용)
- 페이지 콘텐츠(블록) 렌더링
- 데이터베이스 속성(태그, 상태, 날짜 등) 읽기
- 수동 Import 트리거 (`/admin/import` 버튼 클릭)

### 콘텐츠 표시
- 포스트 목록 페이지 (태그/카테고리 필터)
- 포스트 상세 페이지 (Notion 블록 렌더링)
- 학습 기록 목록 페이지

### 발행 관리
- 포스트 상태 관리 (초안 / 발행 / 비공개)
- 발행된 포스트만 공개 노출

### 기본 UI
- 반응형 레이아웃 (모바일/데스크탑)
- 코드 블록 문법 강조 (highlight.js 또는 Prism)
- 다크/라이트 모드

---

## 제외 기능

- 댓글, 좋아요, 공유 등 소셜 기능
- 실시간 동시편집
- 멀티 유저 / 권한 관리
- 이메일 구독, 뉴스레터
- RSS 피드 (MVP 이후 검토)
- 이미지 업로드 / 파일 관리 (Notion 내에서 처리)
- 복잡한 애널리틱스 대시보드
- 검색엔진 제출 / SEO 자동화 (기본 메타태그만)

---

## 핵심 화면 목록

| 화면 | 경로 | 설명 |
|------|------|------|
| 홈 | `/` | 최근 포스트 + 학습 기록 요약 |
| 포스트 목록 | `/posts` | 발행된 포스트 목록, 태그 필터 |
| 포스트 상세 | `/posts/[slug]` | Notion 블록 렌더링 |
| 학습 기록 목록 | `/notes` | 학습 노트 목록, 날짜/태그 필터 |
| 학습 기록 상세 | `/notes/[slug]` | 노트 상세 |
| Notion 연결 | `/notion/connect` | OAuth 연결 시작, 연결 상태 확인 |
| 관리자 Import | `/admin/import` | Notion 데이터 수동 Import 실행, 상태 확인 |

---

## 데이터 모델 초안

### Notion Database 구조 (앱에서 기대하는 속성)

**Posts DB**
```
- Title (title)
- Slug (text)
- Status (select): draft | published | archived
- Tags (multi_select)
- Category (select)
- PublishedAt (date)
- Summary (text)
```

**Notes DB**
```
- Title (title)
- Slug (text)
- Tags (multi_select)
- Date (date)
- Status (select): draft | published
```

### 로컬 캐시 모델 (DB 또는 파일 캐시)

```
Post {
  notionPageId: string  // Notion page ID (primary key)
  slug: string
  title: string
  summary: string
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  category: string
  publishedAt: string   // ISO date
  notionUpdatedAt: string
  lastSyncedAt: string  // 마지막 동기화 시각
}

Note {
  notionPageId: string  // Notion page ID (primary key)
  slug: string
  title: string
  tags: string[]
  date: string
  status: 'draft' | 'published'
  lastSyncedAt: string  // 마지막 동기화 시각
}
```

---

## 추천 기술 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| 프레임워크 | Next.js 14 (App Router) | SSG/SSR 혼합, 파일 기반 라우팅, 생태계 |
| 언어 | TypeScript | 타입 안전성, 유지보수 |
| 스타일 | Tailwind CSS | 빠른 UI 구현, 커스텀 용이 |
| Notion 연동 | `@notionhq/client` | 공식 SDK |
| 블록 렌더링 | `notion-to-md` 또는 직접 구현 | Notion 블록 → HTML/React |
| 코드 강조 | `shiki` | 고품질 문법 강조, SSR 지원 |
| 로컬 캐시 | JSON 파일 캐시 또는 SQLite (`better-sqlite3`) | 단순 구조, 외부 DB 불필요 |
| 패키지 관리 | pnpm | 속도, 디스크 효율 |
| 배포 | Vercel | Next.js 최적화, 무료 티어 |

---

## 개발 우선순위

1. Notion API 연동 및 데이터 fetch 검증
2. Posts DB 기반 포스트 목록/상세 렌더링
3. Notion 블록 렌더링 (텍스트, 코드, 이미지, 리스트)
4. 발행 상태 필터링 (published만 노출)
5. Notes DB 연동 및 학습 기록 화면
6. 태그 필터, 기본 검색
7. 관리자 동기화 페이지
8. 다크모드, 반응형 마무리
9. 메타태그 / OG 이미지
10. 배포 및 도메인 설정
