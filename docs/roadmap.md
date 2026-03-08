# Roadmap (4주 계획)

## 전제 조건

- Notion에 Posts DB, Notes DB가 생성되어 있거나 생성할 준비가 됨
- Notion Integration 토큰 발급 완료
- Node.js, pnpm 설치 완료

---

## Week 1 — 기반 구축 + Notion 연동

**목표**: 프로젝트 셋업을 완료하고 Notion에서 데이터를 실제로 가져와 화면에 표시한다.

### 작업 항목

- [ ] Next.js 14 + TypeScript + Tailwind 프로젝트 초기화
- [ ] ESLint, Prettier, 경로 alias 설정
- [ ] 환경변수 구조 정의 (`.env.local.example`)
- [ ] Notion API 클라이언트 모듈 작성 (`lib/notion.ts`)
- [ ] Posts DB 페이지 목록 fetch 및 타입 정의
- [ ] Notes DB 페이지 목록 fetch 및 타입 정의
- [ ] `/posts` 포스트 목록 페이지 (정적 렌더링)
- [ ] `/posts/[slug]` 포스트 상세 페이지 (Notion 블록 기본 렌더링)
- [ ] 발행 상태 필터 (published만 노출) 적용

**완료 기준**: `/posts`에서 Notion의 published 포스트 목록이 실제로 표시됨

---

## Week 2 — 블록 렌더링 + 학습 기록

**목표**: 콘텐츠 렌더링 품질을 높이고 Notes 화면을 완성한다.

### 작업 항목

- [ ] Notion 블록 렌더러 구현 또는 라이브러리 적용
  - paragraph, heading 1/2/3
  - bulleted/numbered list
  - code (shiki 연동)
  - image, quote, divider
  - callout, toggle (기본 수준)
- [ ] `/notes` 학습 기록 목록 페이지
- [ ] `/notes/[slug]` 학습 기록 상세 페이지
- [ ] 홈(`/`) 페이지: 최근 포스트 + 최근 노트 요약
- [ ] 태그 필터 UI (클라이언트 사이드)
- [ ] 공통 레이아웃 컴포넌트 (Header, Footer)

**완료 기준**: 코드 블록 포함 포스트가 올바르게 렌더링되고, Notes 목록/상세가 동작함

---

## Week 3 — 캐싱 + 관리자 + UX 마무리

**목표**: 동기화 흐름을 정리하고 사용성을 높인다.

### 작업 항목

- [ ] 로컬 캐시 레이어 구현 (JSON 파일 or SQLite)
  - Notion fetch 결과를 캐시에 저장
  - 캐시 유효시간 설정 (예: 1시간)
- [ ] `/admin/sync` 동기화 페이지 (비밀번호 또는 secret 토큰으로 보호)
  - 수동 동기화 버튼
  - 마지막 동기화 시각 표시
  - 포스트/노트 수 요약
- [ ] 다크/라이트 모드 토글
- [ ] 반응형 레이아웃 점검 (모바일)
- [ ] 코드 복사 버튼
- [ ] 포스트 내 목차(TOC) 사이드바 (heading 기반)

**완료 기준**: 동기화 버튼 클릭 시 Notion 최신 데이터 반영, 모바일에서 정상 표시

---

## Week 4 — 마무리 + 배포

**목표**: 배포 가능한 상태로 완성하고 실제 운영 환경에 올린다.

### 작업 항목

- [ ] 메타태그 및 OG 이미지 설정 (포스트별 동적 생성)
- [ ] `sitemap.xml`, `robots.txt` 기본 설정
- [ ] 에러 페이지 (`not-found`, `error`) 처리
- [ ] Vercel 배포 설정
- [ ] 환경변수 Vercel에 등록
- [ ] 커스텀 도메인 연결 (선택)
- [ ] 전체 흐름 점검 (Notion 수정 → 동기화 → 화면 반영)
- [ ] `README.md` 작성 (로컬 실행 방법 포함)

**완료 기준**: 실 배포 URL에서 전체 기능이 정상 동작

---

## 리스크 및 대응 전략

| 리스크 | 가능성 | 대응 |
|--------|--------|------|
| Notion API rate limit (초당 3회) | 중 | 캐시 레이어로 API 호출 최소화, 빌드 타임 fetch 활용 |
| Notion 블록 타입 렌더링 누락 | 높 | 지원 블록 타입 명시, 미지원 타입은 fallback 처리 |
| `notion-to-md` 한계 | 중 | 직접 블록 렌더러 작성으로 전환 가능하도록 추상화 |
| Vercel 빌드 시간 증가 (많은 페이지) | 낮 | ISR(incremental static regeneration) 적용 |
| slug 중복/누락 | 중 | slug 없을 경우 page ID를 fallback으로 사용 |

---

## MVP 이후 검토 항목 (백로그)

- RSS 피드 (`/rss.xml`)
- 전체 텍스트 검색 (Fuse.js 또는 외부 서비스)
- 포스트 시리즈 / 연재 그룹핑
- 읽기 진행률 표시바
- 방문 통계 (self-hosted, e.g. Umami)
