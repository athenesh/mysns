# 📋 성장 공유 SNS 프로젝트 PRD

## Instagram UI 기반 - 성장 공유 특화

---

## 1. 프로젝트 개요

### 프로젝트명

**성장 공유 SNS - Mini Instagram Clone**

### 목적

- 실제 Instagram 웹 UI/UX 재현
- Next.js + Supabase + Clerk 스택 학습
- 성장 공유에 특화된 인터랙션 (응원하기, 피드백 요청)
- 2-3일 안에 완성 가능한 MVP

### 비전

**사용자들의 삶에 가져오는 긍정적인 변화:**

- 빠른 시각적 정보 공유로, 멘토링을 통한 서로의 성장을 응원하는 소통의 공간
- 서로의 성장을 응원하는 변화

### 핵심 Pain Point 해결

**타겟 사용자**: 취미나 자기 계발에 몰두하는 학습자 (예: 외국어 학습자, 운동 초보자)

**문제점:**

- '성장 과정'을 공유할 마땅한 공간이 없어 동기 부여를 잃기 쉽다
- 멘토나 비슷한 목표를 가진 동료를 찾기 어렵고, 일회성 피드백만 받는다
- 기존 SNS는 너무 잡다한 정보가 많아, 성장 관련 정보만 선별적으로 보기 힘들다

### 차별화 요소

- **시각적 증명**: 텍스트 기반의 학습 인증 대신, 사진과 영상 중심의 직관적 인증과 기록을 통해 성취감을 극대화
- **'성장'에 특화된 인터랙션**: 단순 '좋아요' 대신 '응원하기', '피드백 요청' 등 성장을 돕는 버튼 추가
- **멘토/롤 모델 연결**: 글로벌적으로 특정 분야의 숙련된 사용자를 **'멘토'**로 지정하고, 그들의 성장을 체계적으로 팔로우하는 기능 (향후 확장)

### 기술 스택

- **프론트**: Next.js 15, TypeScript, Tailwind CSS v4
- **백엔드**: Supabase (DB + Storage), Clerk (인증)
- **보안**: RLS 비활성화 (개발 환경), Server Actions 사용
- **상태 관리**: React Hooks (최소화), Optimistic UI 패턴

---

## 2. 레이아웃 구조

### Desktop (1024px+)

```
┌────────────────────────────────────────────────────────┐
│ ┌──────────┬─────────────────────────┬───────────────┐ │
│ │          │                         │               │ │
│ │ Sidebar  │      Main Feed          │               │ │
│ │ (244px)  │      (최대 630px)        │               │ │
│ │          │                         │               │ │
│ │ 🏠 홈    │ ┌─────────────────────┐ │               │ │
│ │ 🔍 검색  │ │   PostCard          │ │               │ │
│ │ ➕ 만들기│ └─────────────────────┘ │               │ │
│ │ 👤 프로필│ ┌─────────────────────┐ │               │ │
│ │          │ │   PostCard          │ │               │ │
│ │          │ └─────────────────────┘ │               │ │
│ └──────────┴─────────────────────────┴───────────────┘ │
└────────────────────────────────────────────────────────┘
```

**Sidebar 특징:**

- 너비: 244px
- 배경: 흰색
- 메뉴: 아이콘 + 텍스트
- Hover 효과, Active 시 볼드

**Main Feed:**

- 최대 너비: 630px (중앙 정렬)
- 배경: #FAFAFA
- 카드 배경: #FFFFFF

---

### Tablet (768px ~ 1024px)

```
┌──────────────────────────────────┐
│ ┌──────┬────────────────────┐    │
│ │ 🏠   │   Main Feed        │    │
│ │ 🔍   │   (전체 너비)       │    │
│ │ ➕   │                    │    │
│ │ 👤   │                    │    │
│ └──────┴────────────────────┘    │
└──────────────────────────────────┘
```

**Icon-only Sidebar:**

- 너비: 72px
- 아이콘만 표시

---

### Mobile (< 768px)

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │ ← Header
│ │ Instagram  🤍 ✈️ 👤 │ │
│ └──────────────────────┘ │
│                          │
│ ┌────────────────────┐   │
│ │   PostCard         │   │
│ └────────────────────┘   │
│                          │
│ ┌──────────────────────┐ │ ← Bottom Nav
│ │ 🏠  🔍  ➕  ❤️  👤  │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

**Header:** 높이 60px, 로고 + 알림/DM/프로필

**Bottom Nav:** 높이 50px, 5개 아이콘

---

## 3. PostCard 디자인

```
┌─────────────────────────────────────┐
│ 👤 username          3시간 전    ⋯  │ ← 헤더 (60px)
├─────────────────────────────────────┤
│                                     │
│                                     │
│           [이미지 영역]               │ ← 정사각형 (1:1)
│                                     │
│                                     │
├─────────────────────────────────────┤
│ ❤️ 💬 ✈️                      🔖    │ ← 액션 버튼 (48px)
│                                     │
│ 응원 1,234개                         │
│                                     │
│ username 이곳은 캡션입니다...        │
│ ... 더 보기                          │
│                                     │
│ 피드백 15개 모두 보기                │
│ username2 멋진 사진이네요!           │
│ username3 응원합니다! 👍             │
└─────────────────────────────────────┘
```

### 구성 요소

**1. 헤더 (60px)**

- 프로필 이미지: 32px 원형 (Supabase Storage에서 가져오기)
- 사용자명: Bold
- 시간: 작고 회색
- ⋯ 메뉴: 우측

**2. 이미지**

- 비율: 1:1 정사각형
- 더블탭 시 응원하기 (모바일)

**3. 액션 버튼 (48px)**

- 좌: ❤️ 응원하기, 💬 피드백 요청, ✈️ 공유(제외)
- 우: 🔖 북마크(제외)

**4. 컨텐츠**

- 응원 수: Bold ("응원 N개")
- 캡션: 사용자명 Bold + 내용
- 2줄 초과 시 "... 더 보기"
- 피드백 미리보기: 최신 2개만

---

## 4. 프로필 페이지

### Desktop

```
┌────────────────────────────────────────────┐
│ ┌────────┐                                 │
│ │        │  username                       │
│ │ 150px  │  [팔로우] [메시지]              │
│ │ 원형   │                                 │
│ │        │  게시물 12 팔로워 345 팔로잉 67  │
│ └────────┘                                 │
│            fullname (선택사항)             │
│            bio bio bio... (선택사항)       │
│                                            │
├────────────────────────────────────────────┤
│ [게시물] [릴스] [태그됨]                    │
│  (활성화)  (향후)  (향후)                  │
├────────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐                      │
│ │    │ │    │ │    │                      │
│ └────┘ └────┘ └────┘                      │ ← 3열 그리드
│ ┌────┐ ┌────┐ ┌────┐                      │
│ │    │ │    │ │    │                      │
│ └────┘ └────┘ └────┘                      │
└────────────────────────────────────────────┘
```

**특징:**

- 프로필 이미지: 150px (Desktop) / 90px (Mobile) - Supabase Storage에서 가져오기
- 프로필 이미지 업로드 기능 포함
- 통계: 게시물/팔로워/팔로잉
- Fullname, Bio 표시 (선택사항, 사용자가 입력한 경우만 표시)
- 게시물 탭: [게시물] [릴스] [태그됨] - 현재는 게시물만 활성화
- 그리드: 3열 고정, 1:1 정사각형
- Hover 시 실제 응원/피드백 수 표시

---

## 5. 게시물 상세 모달/페이지

### Desktop

```
┌────────────────────────────────────────────────────────┐
│ ✕                                              ‹   ›   │
├──────────────────────────┬─────────────────────────────┤
│                          │ 👤 username          ⋯     │
│                          ├─────────────────────────────┤
│        [이미지]           │                             │
│        (50%)             │      [피드백 목록]           │
│                          │      (스크롤 가능)            │
│                          │                             │
│                          ├─────────────────────────────┤
│                          │ ❤️ 💬 ✈️            🔖      │
│                          │ 응원 123개                   │
│                          ├─────────────────────────────┤
│                          │ 😊 피드백 요청...     게시   │
└──────────────────────────┴─────────────────────────────┘
```

**Desktop:**

- 모달: PostCard 클릭 시 모달로 표시
- 페이지: `/feed/post/[postId]` URL 직접 접근 시 전체 페이지로 표시 (모달과 동일한 레이아웃)

**Mobile:** 전체 페이지로 전환 (향후 구현)

---

## 6. 컬러 & 타이포그래피

### 주요 컬러

```css
/* 브랜드 */
--instagram-blue: #0095f6; /* 버튼, 링크 */

/* 배경 */
--background: #fafafa; /* 전체 배경 */
--card-background: #ffffff; /* 카드 */
--border: #dbdbdb; /* 테두리 */

/* 텍스트 */
--text-primary: #262626; /* 본문 */
--text-secondary: #8e8e8e; /* 보조 */

/* 응원하기 */
--cheer: #ed4956; /* 빨간 하트 */
```

### 타이포그래피

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* 크기 */
--text-xs: 12px; /* 시간 */
--text-sm: 14px; /* 기본 */
--text-base: 16px; /* 입력창 */
--text-xl: 20px; /* 프로필 */

/* 굵기 */
--font-normal: 400;
--font-semibold: 600;
--font-bold: 700;
```

---

## 7. 핵심 기능

### 7.1 인증

- **회원가입/로그인**: Clerk 사용
- **정보**: 이메일, 비밀번호, 사용자명
- **리다이렉트**: 로그인 후 홈 (/)

### 7.2 게시물

- **작성**: Sidebar/BottomNav "만들기" → 모달
  - 이미지 업로드 (최대 5MB, Supabase Storage)
    - 클라이언트에서 직접 Supabase Storage에 업로드 (Server Action body size limit 문제 해결)
    - 업로드 진행률 표시
  - 캡션 입력 (최대 2,200자)
  - 이미지 미리보기 및 삭제 기능
- **피드**: 홈 (`/feed`)
  - 시간 역순 정렬
  - 무한 스크롤 (10개씩, Intersection Observer)
  - 에러 처리 및 재시도 기능
- **상세**:
  - 모달: PostCard 클릭 시 모달 표시 (Desktop: 이미지 50% + 피드백 50%)
  - 페이지: `/feed/post/[postId]` URL 직접 접근 시 전체 페이지로 표시 (Desktop: 모달과 동일한 레이아웃)
- **삭제**: ⋯ 메뉴 → 삭제 (본인만, 향후 구현)

### 7.3 응원하기 (기존 좋아요)

- **위치**: PostCard 하단 ❤️ 버튼
- **상태**: 빈 하트 ↔ 빨간 하트
- **애니메이션**: 클릭 시 scale(1.3) → scale(1)
- **더블탭**: 이미지 더블탭 시 큰 하트 등장 (모바일/데스크톱 모두 지원)
- **용어**: "응원하기", "응원 취소", "응원 N개"
- **기능**: Optimistic UI 업데이트, 실시간 카운트 동기화

### 7.4 피드백 요청 (기존 댓글)

- **작성**: "피드백 요청..." 입력창, Enter 또는 "게시"
- **표시**:
  - PostCard: 최신 2개 미리보기
  - 상세: 전체 피드백 + 스크롤
- **삭제**: ⋯ 메뉴 (본인만)
- **용어**: "피드백 요청", "피드백 작성", "피드백 N개"
- **대댓글 (답글) 기능**:
  - 각 피드백에 "답글" 버튼 표시
  - 대댓글 작성 시 부모 댓글 작성자에게 답글 표시
  - 대댓글은 들여쓰기로 계층 구조 표현
  - "답글 N개 보기/숨기기" 토글 기능
  - Instagram 스타일 UI (이름 + 내용 한 줄)

### 7.5 프로필

- **프로필 페이지**: `/profile/[userId]` (통합 경로)
  - 내 프로필: 프로필 이미지 업로드 (Supabase Storage)
  - 다른 사람 프로필: "팔로우" 또는 "팔로잉" 버튼
  - "프로필 편집" 버튼 (1차 제외, 기능 미구현)
  - Fullname, Bio 표시 (선택사항)
- **게시물 탭**: [게시물] [릴스] [태그됨] 탭 UI
  - 현재는 게시물 탭만 활성화 (릴스, 태그됨은 향후 기능)
- **게시물 그리드**: 3열, 클릭 시 상세 모달
- **Hover 효과**: 게시물 썸네일에 실제 응원/피드백 수 표시

### 7.6 팔로우

- **버튼 상태**:
  - 미팔로우: "팔로우" (파란색)
  - 팔로우 중: "팔로잉" (회색)
- **Hover**: "언팔로우" (빨간 테두리)
- **클릭**: 즉시 API 호출 → UI 업데이트
- **API 엔드포인트**:
  - `POST /api/follow/[userId]`: 팔로우/언팔로우 토글
  - `GET /api/follow/status/[userId]`: 팔로우 상태 확인 (모바일 앱용)

### 7.7 프로필 이미지

- **업로드**: 프로필 페이지에서 이미지 업로드 버튼
- **저장**: Supabase Storage (`uploads/{clerk_user_id}/avatar.jpg`)
- **표시**: PostCard, 프로필 페이지 등 모든 곳에서 사용
- **기본값**: Clerk 기본 아바타 (없을 경우)

---

## 8. 애니메이션 & 인터랙션

### 응원하기

```
1. 클릭 → 하트 scale(1.3)
2. 0.15초 후 → scale(1)
3. 빈 하트 → 빨간 하트 (채워짐)
```

### 더블탭 응원하기 (모바일)

```
1. 이미지 더블탭
2. 큰 하트 등장 (fade in)
3. 1초 후 사라짐 (fade out)
```

### 무한 스크롤

```
- Intersection Observer 사용
- 하단 도달 시 10개씩 로드
- 로딩 상태 및 에러 처리 포함
- 재시도 기능
```

### 로딩

```
- Skeleton UI (회색 박스 애니메이션)
- Shimmer 효과
```

---

## 9. 반응형 브레이크포인트

```css
/* Mobile */
@media (max-width: 767px) {
  - Bottom Navigation 표시
  - Sidebar 숨김
  - 전체 너비 PostCard
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  - Icon-only Sidebar (72px)
  - PostCard 최대 630px
}

/* Desktop */
@media (min-width: 1024px) {
  - Full Sidebar (244px)
  - PostCard 최대 630px
}
```

---

## 10. 컴포넌트 구조

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/         # 로그인
│   │   └── sign-up/         # 회원가입
│   ├── feed/
│   │   ├── layout.tsx       # Sidebar + 레이아웃
│   │   ├── page.tsx         # 홈 피드
│   │   └── post/[postId]/page.tsx
│   ├── profile/
│   │   ├── layout.tsx       # Sidebar + 레이아웃
│   │   └── [userId]/page.tsx
│   └── api/
│       ├── posts/           # 게시물 API
│       ├── cheers/          # 응원하기 API
│       ├── feedbacks/       # 피드백 API
│       └── follows/         # 팔로우 API
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx      # 사이드바
│   │   ├── Header.tsx       # 모바일 헤더
│   │   └── BottomNav.tsx   # 하단 네비
│   ├── post/
│   │   ├── PostCard.tsx     # 게시물 카드
│   │   ├── PostModal.tsx   # 상세 모달
│   │   └── CreatePostModal.tsx
│   ├── feedback/
│   │   ├── FeedbackList.tsx
│   │   └── FeedbackForm.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileTabs.tsx # 게시물 탭 UI
│   │   ├── ProfilePageWrapper.tsx # 탭 상태 관리 래퍼
│   │   ├── PostGrid.tsx
│   │   └── AvatarUpload.tsx # 프로필 이미지 업로드
│   └── ui/
│       ├── Button.tsx
│       ├── Avatar.tsx
│       └── Skeleton.tsx
└── lib/
    ├── supabase.ts          # Supabase 클라이언트
    └── types.ts             # TypeScript 타입
```

---

## 11. 데이터베이스 스키마

### 테이블 구조

- **users**: 사용자 정보 (id, clerk_id, name, fullname, bio, avatar_url, created_at)
- **posts**: 게시물 (id, user_id, image_url, caption, created_at, updated_at)
- **likes**: 응원하기 (id, post_id, user_id, created_at) - UNIQUE 제약조건
- **comments**: 피드백 요청 (id, post_id, user_id, content, parent_comment_id, created_at, updated_at)
  - parent_comment_id: 대댓글인 경우 부모 댓글 ID (NULL이면 최상위 댓글)
- **follows**: 팔로우 (id, follower_id, following_id, created_at) - 자기 자신 팔로우 방지

### 뷰 (Views)

- **post_stats**: 게시물별 응원 수, 피드백 수 통계
- **user_stats**: 사용자별 게시물 수, 팔로워 수, 팔로잉 수 통계

### 트리거

- **handle_updated_at()**: posts, comments 테이블의 updated_at 자동 업데이트

---

## 12. 개발 순서

### 1. 홈 피드 페이지

#### 1-1. 기본 세팅

- Next.js + TypeScript 프로젝트 생성 (이미 완료)
- Tailwind CSS 설정 (인스타 컬러 스키마)
- Clerk 인증 연동 (한국어 설정) (이미 완료)
- Supabase 프로젝트 생성 및 연동 (이미 완료)
- 데이터베이스 테이블 생성 (제공된 SQL 파일 적용)

#### 1-2. 레이아웃 구조

- Sidebar 컴포넌트 (Desktop/Tablet 반응형)
- MobileHeader 컴포넌트
- BottomNav 컴포넌트
- (main) Route Group 및 레이아웃 통합

#### 1-3. 홈 피드 - 게시물 목록

- PostCard 컴포넌트 (Header, Image, Actions, Content)
- PostCardSkeleton 로딩 UI
- PostFeed 컴포넌트
- Server Action: `actions/post.ts` - getPosts 함수 (페이지네이션)

#### 1-4. 홈 피드 - 응원하기 기능

- likes 테이블 사용 (기존)
- Server Action: `actions/cheer.ts` - toggleCheer 함수
- 응원하기 버튼 및 애니메이션 (하트 + 더블탭)

---

### 2. 게시물 작성 & 피드백 기능

#### 2-1. 게시물 작성 모달

- CreatePostModal 컴포넌트 (Dialog)
- 이미지 미리보기 UI
- 텍스트 입력 필드

#### 2-2. 게시물 작성 - 이미지 업로드

- Supabase Storage 버킷 사용 (이미 완료)
- 클라이언트에서 직접 Supabase Storage에 이미지 업로드 (Server Action body size limit 문제 해결)
- 업로드 진행률 표시 (UX 개선)
- Server Action: `actions/post.ts` - createPost 함수 (이미지 URL만 받아서 게시물 생성)
- 파일 검증 (크기, 형식) - 클라이언트에서 처리

#### 2-3. 피드백 기능 - UI & 작성

- comments 테이블 사용 (기존)
- FeedbackList, FeedbackForm 컴포넌트
- Server Action: `actions/feedback.ts` - createFeedback 함수

#### 2-4. 피드백 기능 - 삭제 & 무한스크롤

- Server Action: `actions/feedback.ts` - deleteFeedback 함수
- 피드백 삭제 버튼 (본인만)
- PostFeed 무한 스크롤 (Intersection Observer)

---

### 3. 프로필 페이지 & 팔로우 기능

#### 3-1. 프로필 페이지 - 기본 정보

- /profile/[userId] 동적 라우트
- 프로필 헤더 (아바타, 이름, 통계)
- 프로필 이미지 업로드 기능
- Server Action: `actions/profile.ts` - getProfile 함수

#### 3-2. 프로필 페이지 - 게시물 그리드

- 3열 그리드 레이아웃 (반응형)
- Server Action: `actions/post.ts` - getPostsByUserId 함수 (PostWithUser 반환, N+1 쿼리 최적화)
- 게시물 이미지 썸네일 표시
- Hover 효과: 게시물 썸네일에 실제 응원/피드백 수 표시 (데스크톱 전용)

#### 3-3. 팔로우 기능

- follows 테이블 사용 (기존)
- Server Action: `actions/follow.ts` - toggleFollow 함수
- 팔로우/언팔로우 버튼 및 상태 관리

#### 3-4. 최종 마무리 & 배포

- 모바일/태블릿 반응형 테스트
- 에러 핸들링 및 Skeleton UI
- Vercel 배포

---

## 13. 1차 MVP 제외 기능

다음 기능들은 2차 확장에서 구현:

- ❌ 검색 (사용자, 해시태그)
- ❌ 탐색 페이지
- ❌ 릴스
- ❌ 메시지 (DM)
- ❌ 알림
- ❌ 스토리
- ❌ 동영상
- ❌ 이미지 여러 장
- ❌ 공유 버튼 (UI만 있음)
- ❌ 북마크 (UI만 있음)
- ❌ 프로필 편집 (Clerk 기본)
- ❌ 팔로워/팔로잉 목록 모달
- ❌ 멘토 지정 기능 (향후 확장)

---

## 14. 용어 변경 사항

### 기존 용어 → 새로운 용어

- **좋아요** → **응원하기**

  - 테이블: `likes` (변경 없음, 내부적으로만 사용)
  - UI 텍스트: "응원하기", "응원 취소", "응원 N개"
  - 컴포넌트: `CheerButton.tsx`
  - Server Action: `actions/cheer.ts`

- **댓글** → **피드백 요청**
  - 테이블: `comments` (변경 없음, 내부적으로만 사용)
  - UI 텍스트: "피드백 요청", "피드백 작성", "피드백 N개"
  - 컴포넌트: `FeedbackList.tsx`, `FeedbackForm.tsx`
  - Server Action: `actions/feedback.ts`

---

## 15. 참고 자료

- **디자인**: Instagram Web (실제 사이트)
- **아이콘**: Lucide React (https://lucide.dev)
- **문서**:
  - Next.js: https://nextjs.org/docs
  - Clerk: https://clerk.com/docs
  - Supabase: https://supabase.com/docs
  - Tailwind: https://tailwindcss.com/docs

---

**문서 버전**: 4.6 (성장 공유 특화 버전)  
**작성일**: 2025-11-04  
**최종 업데이트**: 2025-11-05  
**작성자**: SH

**변경 이력**:

- v4.6 (2025-11-05): 팔로우 기능 및 UI 완전 구현 (스타일 개선, 팔로워 수 실시간 업데이트, 로깅 최적화)
- v4.5 (2025-11-05): 팔로우 API 엔드포인트 추가 (모바일 앱 지원)
- v4.4 (2025-11-05): 프로필 페이지 개선 예정 사항 추가
- v4.3 (2025-11-05): 게시물 상세 페이지 구현 완료

**구현 상태**: MVP 1차 개발 완료 (2025-11-05 기준)

- 대댓글(답글) 기능 추가 완료
- 게시물 상세 페이지 데스크톱 레이아웃 구현 완료
- 프로필 페이지 기본 기능 구현 완료
- 팔로우 기능 및 UI 완전 구현 완료

- ✅ 핵심 기능 구현 완료
- ✅ 반응형 레이아웃 완료
- ✅ 무한 스크롤 및 성능 최적화 완료
- ✅ 게시물 상세 페이지 (Desktop) 구현 완료
- ✅ 프로필 페이지 기본 구현 완료 (헤더, 게시물 그리드)
- ✅ 팔로우 기능 완전 구현 완료 (스타일, 실시간 업데이트, 에러 처리)
- ⏳ 일부 UI 요소 (공유, 북마크 등)는 1차 MVP 제외
- ⚠️ 프로필 페이지 성능 최적화 필요 (N+1 쿼리 문제)

**개선 예정 사항** (2025-11-05 이후):

### 프로필 페이지 성능 최적화 (우선순위: 높음)

1. **N+1 쿼리 문제 해결**

   - 현재: `getPostsByUserId`가 `Post[]`만 반환하여 프로필 페이지에서 각 게시물마다 user와 post_stats를 개별 조회
   - 문제: 게시물 10개 기준 20개의 추가 쿼리 발생
   - 개선: `getPostsByUserId`를 `PostWithUser[]` 반환하도록 변경, `post_stats` 뷰와 `users` 테이블 JOIN으로 한 번의 쿼리로 해결
   - 예상 효과: 응답 시간 대폭 개선 (20개 쿼리 → 1개 쿼리)

2. **데이터 전달 구조 단순화**

   - 현재: `posts`와 `postsWithUser`를 모두 전달하여 데이터 중복
   - 개선: `postsWithUser`만 전달하도록 단순화
   - 파일: `components/profile/PostGrid.tsx`, `components/profile/ProfilePageWrapper.tsx`

3. **UX 개선**

   - Hover 효과 모바일 대응: `@media (hover: hover)` 사용하여 데스크톱에서만 hover 효과
   - 이미지 최적화: Supabase Storage URL 최적화 조건 재검토
   - 로깅 최적화: 개발 모드에서만 로그 출력 (`process.env.NODE_ENV === 'development'`) ✅ 완료

4. **에러 처리 개선**
   - 프로필 페이지 에러 처리: 사용자 친화적 메시지 표시
   - 로딩 상태 개선: 스켈레톤 UI 정확도 향상
