# CLAUDE.md — 프로젝트 작업 규칙

이 파일은 Claude Code가 이 프로젝트에서 작업할 때 항상 따라야 할 규칙이다.

---

## 핵심 원칙

### 1. MVP 우선
- 현재 구현 단계에 맞는 기능만 작성한다.
- 요청하지 않은 기능을 임의로 추가하지 않는다.
- "나중에 쓸 수도 있으니까"라는 이유로 코드를 추가하지 않는다.

### 2. 문서 먼저, 코드 나중
- 새 기능 구현 전에 `docs/requirements.md`와 `docs/roadmap.md`를 확인한다.
- 요구사항에 없는 기능이라면 먼저 사용자에게 확인을 구한다.
- 설계가 불분명하면 코드 작성 전에 질문한다.

### 3. 과도한 추상화 금지
- 한 곳에서만 쓰이는 로직을 위해 헬퍼/유틸리티를 만들지 않는다.
- 비슷한 코드 3개 이하라면 추상화하지 않는다.
- 제네릭, 팩토리 패턴 등은 명확하게 필요할 때만 도입한다.

### 4. 보안
- 환경변수는 반드시 서버 사이드에서만 사용한다 (`NEXT_PUBLIC_` prefix 금지, 단 공개 값 제외).
- 관리자 기능은 반드시 인증 처리한다.
- SQL/NoSQL injection, XSS에 주의한다.

### 5. 불명확한 설계의 합리적 처리
- 설계가 약간 불분명하더라도 위험하지 않으면 합리적으로 가정하고 진행한다.
- 어떤 가정을 했는지 작업 요약의 "가정 사항" 항목에 반드시 명시한다.
- 가정이 잘못되었을 경우 쉽게 되돌릴 수 있도록 변경 범위를 최소화한다.

### 6. 단순한 구조 유지
- 파일을 새로 만들기 전에 기존 파일 수정이 가능한지 먼저 검토한다.
- 컴포넌트는 실제로 재사용될 때만 분리한다.
- 타입은 사용하는 파일 가까이에 정의한다 (과도한 전역 타입 파일 금지).

---

## Git 워크플로 규칙

모든 작업은 아래 Git 규칙을 따른다.

- **브랜치**: 모든 작업은 feature branch에서 수행. `main`에 직접 커밋 금지.
  ```
  main
   └─ feature/*
   └─ fix/*
   └─ refactor/*
   └─ docs/*
  ```
- **커밋 언어**: 모든 커밋 메시지는 영어로 작성한다.
- **커밋 형식**: Conventional Commits 준수.
  ```
  type(scope): message
  ```
  허용 type: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`
- **작업 완료 시 순서**:
  1. `docs/dev-progress.md` Current Status + Feature Index 업데이트
  2. `docs/changelog.md`에 feature entry 추가
  3. git commit (Conventional Commits, 영어)
  4. **git push** (feature branch를 remote에 push)
  5. main에 merge
  6. **remote branch 삭제 금지** (이력 보존)
- **세션 시작 시 반드시 읽을 파일**:
  1. `CLAUDE.md`
  2. `docs/dev-progress.md`
  3. `docs/architecture.md`

---

## 기능 추가 체크리스트

새 기능을 추가하기 전에 반드시 확인:

- [ ] `docs/requirements.md`의 MVP 기능 목록에 포함되어 있는가?
- [ ] `docs/roadmap.md`의 현재 주차 목표에 해당하는가?
- [ ] 제외 기능 목록에 없는가?
- [ ] 기존 코드 수정으로 해결할 수 없는가?

---

## 작업 후 필수 요약

모든 작업을 마친 후 반드시 다음 항목을 출력한다:

```
## 작업 완료 요약

### 변경된 파일
- `경로/파일명` — 변경 내용 한 줄 요약

### 실행 방법
(해당하는 경우)
$ 명령어

### 남은 문제 / 다음 작업
- 문제 또는 다음 단계 항목
```

---

## 코드 스타일

- TypeScript strict mode 사용
- 함수형 컴포넌트만 사용 (class component 금지)
- `any` 타입 사용 금지 (불가피한 경우 주석으로 이유 명시)
- 파일명: 컴포넌트는 PascalCase, 나머지는 kebab-case
- 불필요한 주석 금지 (자명한 코드에 설명 주석 달지 않기)
- 콘솔 로그는 개발 중에만, 배포 전 제거

---

## 기술 스택 (변경 시 이 파일도 업데이트)

- Framework: Next.js 16 (App Router)
- Language: TypeScript 5 (strict)
- Styling: Tailwind CSS v4
- Notion SDK: `@notionhq/client`
- Package Manager: pnpm
- Deploy: Vercel

---

## 디렉토리 구조 (현재 기준, 변경 시 업데이트)

```
my-notion-blog-app/
├── app/
│   ├── api/notion/start/     # GET  /api/notion/start   (OAuth 시작)
│   ├── api/notion/callback/  # GET  /api/notion/callback (OAuth 콜백)
│   ├── api/import/           # POST /api/import          (데이터 import)
│   ├── notion/connect/       # /notion/connect           (OAuth 연결 페이지)
│   ├── admin/import/         # /admin/import             (import 관리 페이지)
│   ├── posts/[slug]/         # /posts/[slug]             (포스트 상세)
│   ├── notes/[slug]/         # /notes/[slug]             (노트 상세)
│   └── ...
├── components/               # 재사용 컴포넌트
├── lib/
│   ├── notion/               # Notion API 연동
│   │   ├── client.ts         # SDK 인스턴스
│   │   ├── oauth.ts          # OAuth 유틸
│   │   ├── posts.ts          # Posts DB fetch (예정)
│   │   └── notes.ts          # Notes DB fetch (예정)
│   ├── cache/                # JSON 캐시 읽기/쓰기 (예정)
│   └── utils/slug.ts         # slug 처리 (예정)
├── types/                    # 공유 타입 (예정)
├── cache/                    # 런타임 JSON 캐시 (gitignore)
├── docs/
│   ├── dev-progress.md       # 현재 개발 상태 (세션 시작 시 필독)
│   ├── changelog.md          # 전체 개발 이력
│   └── ...
└── CLAUDE.md
```
