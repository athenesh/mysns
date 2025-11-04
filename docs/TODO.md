# 📋 성장 공유 SNS 프로젝트 TODO

## 1. 기본 세팅

- [x] Next.js + TypeScript 프로젝트 생성
  - [x] Next.js 15 프로젝트 생성 (완료)
  - [x] TypeScript 설정 (완료)
- [x] Tailwind CSS 설정
  - [x] 인스타 컬러 스키마 적용 (`globals.css`)
  - [x] 반응형 브레이크포인트 설정
- [x] Clerk 인증 연동
  - [x] Clerk 설정 및 연동 (완료)
  - [x] 한국어 설정 (완료)
  - [ ] 로그인/회원가입 페이지 스타일링
- [x] Supabase 프로젝트 생성 및 연동
  - [x] Supabase 프로젝트 생성 (완료)
  - [x] Supabase 클라이언트 설정 (완료)
  - [x] Storage 버킷 생성 (`uploads`) (완료)
- [x] 데이터베이스 스키마 생성
  - [x] `users` 테이블 생성
  - [x] `posts` 테이블 생성
  - [x] `likes` 테이블 생성 (응원하기)
  - [x] `comments` 테이블 생성 (피드백 요청)
  - [x] `follows` 테이블 생성
  - [x] `post_stats` 뷰 생성
  - [x] `user_stats` 뷰 생성
  - [x] `handle_updated_at()` 트리거 생성
  - [x] RLS 비활성화 (개발 환경)

## 2. 레이아웃 구조

- [x] Sidebar 컴포넌트 (`components/layout/Sidebar.tsx`)
  - [x] Desktop (244px 너비, 아이콘 + 텍스트)
  - [x] Tablet (72px 너비, 아이콘만)
  - [x] Mobile (숨김)
  - [x] Hover 효과 및 Active 상태 스타일
  - [x] 메뉴 항목: 홈, 검색, 만들기, 프로필
- [x] MobileHeader 컴포넌트 (`components/layout/Header.tsx`)
  - [x] 높이 60px
  - [x] 로고 + 알림/DM/프로필 아이콘
  - [x] Mobile 전용 표시
- [x] BottomNav 컴포넌트 (`components/layout/BottomNav.tsx`)
  - [x] 높이 50px
  - [x] 5개 아이콘 (홈, 검색, 만들기, 응원, 프로필)
  - [x] Mobile 전용 표시
- [x] (main) Route Group 레이아웃 (`app/feed/layout.tsx`)
  - [x] Sidebar + Main Feed 레이아웃 통합
  - [x] 반응형 레이아웃 (Desktop/Tablet/Mobile)
  - [x] 배경색 설정 (#FAFAFA)

## 3. 홈 피드 페이지

### 3-1. 게시물 목록

- [x] PostCard 컴포넌트 (`components/post/PostCard.tsx`)
  - [x] 헤더 (60px)
    - [x] 프로필 이미지 (32px 원형)
    - [x] 사용자명 (Bold)
    - [x] 시간 표시 (작고 회색)
    - [x] ⋯ 메뉴 버튼 (우측)
  - [x] 이미지 영역
    - [x] 1:1 정사각형 비율
    - [x] 더블탭 응원하기 기능 (모바일)
  - [x] 액션 버튼 (48px)
    - [x] ❤️ 응원하기 버튼
    - [x] 💬 피드백 요청 버튼
    - [ ] ✈️ 공유 버튼 (UI만, 기능 제외)
    - [ ] 🔖 북마크 버튼 (UI만, 기능 제외)
  - [x] 컨텐츠 영역
    - [x] 응원 수 표시 ("응원 N개")
    - [x] 캡션 표시 (사용자명 Bold + 내용)
    - [x] 2줄 초과 시 "... 더 보기" 토글
    - [x] 피드백 미리보기 (최신 2개)
- [x] PostCardSkeleton 컴포넌트 (`components/post/PostFeedSkeleton.tsx`)
  - [x] Skeleton UI 구현
  - [x] Shimmer 애니메이션 효과
- [x] PostFeed 컴포넌트 (`components/post/PostFeed.tsx`)
  - [x] 게시물 목록 렌더링
  - [x] 최대 너비 630px (중앙 정렬)
  - [x] 카드 배경 #FFFFFF
- [x] Server Action: `actions/post.ts`
  - [x] `getPosts` 함수 (페이지네이션)
  - [x] 시간 역순 정렬
  - [x] 10개씩 로드

### 3-2. 응원하기 기능

- [x] Server Action: `actions/cheer.ts`
  - [x] `toggleCheer` 함수 (응원하기/취소 토글)
  - [x] `likes` 테이블 사용
  - [x] UNIQUE 제약조건 처리
- [x] CheerButton 컴포넌트 (`components/post/CheerButton.tsx`)
  - [x] 빈 하트 ↔ 빨간 하트 상태 관리
  - [x] 클릭 애니메이션 (scale(1.3) → scale(1))
  - [x] 더블탭 응원하기 (모바일)
    - [x] 큰 하트 등장 (fade in)
    - [x] 1초 후 사라짐 (fade out)
- [x] PostCard에 CheerButton 통합

## 4. 게시물 작성 & 피드백 기능

### 4-1. 게시물 작성 모달

- [x] CreatePostModal 컴포넌트 (`components/post/CreatePostModal.tsx`)
  - [x] Dialog 컴포넌트 사용 (shadcn/ui)
  - [x] 이미지 업로드 UI
  - [x] 이미지 미리보기
  - [x] 캡션 입력 필드 (최대 2,200자)
  - [x] 파일 크기 검증 (최대 5MB)
  - [x] 게시 버튼

### 4-2. 게시물 작성 - 이미지 업로드

- [x] Server Action: `actions/post.ts`
  - [x] `createPost` 함수
  - [x] Supabase Storage 업로드 (`uploads/{clerk_user_id}/{filename}`)
  - [x] 파일 검증 (크기, 형식)
  - [x] `posts` 테이블에 데이터 저장
- [x] 이미지 업로드 로직
  - [x] 클라이언트에서 Storage 직접 업로드
  - [x] 업로드 진행 상태 표시
  - [x] 에러 핸들링

### 4-3. 피드백 기능 - UI & 작성

- [x] FeedbackList 컴포넌트 (`components/feedback/FeedbackList.tsx`)
  - [x] 피드백 목록 표시
  - [x] PostCard: 최신 2개 미리보기
  - [x] 상세 모달: 전체 피드백 + 스크롤
  - [x] 삭제 버튼 (본인만 표시)
- [x] FeedbackForm 컴포넌트 (`components/feedback/FeedbackForm.tsx`)
  - [x] "피드백 요청..." 입력창
  - [x] Enter 또는 "게시" 버튼
  - [x] 입력 검증
- [x] Server Action: `actions/feedback.ts`
  - [x] `createFeedback` 함수
  - [x] `comments` 테이블 사용
  - [x] 에러 핸들링

### 4-4. 피드백 기능 - 삭제 & 무한스크롤

- [x] Server Action: `actions/feedback.ts`
  - [x] `deleteFeedback` 함수
  - [x] 본인만 삭제 가능 검증
- [x] 피드백 삭제 버튼
  - [x] 삭제 버튼 (본인 피드백만)
  - [ ] 삭제 확인 다이얼로그
- [x] PostFeed 무한 스크롤
  - [x] Intersection Observer 사용
  - [x] 하단 도달 시 10개씩 추가 로드
  - [x] 로딩 상태 표시

## 5. 프로필 페이지 & 팔로우 기능

### 5-1. 프로필 페이지 - 기본 정보

- [x] 동적 라우트 (`app/feed/profile/[userId]/page.tsx`)
  - [x] `/feed/profile/[userId]` - 다른 사용자 프로필
  - [ ] `/profile` - 내 프로필 (향후 추가)
- [x] ProfileHeader 컴포넌트 (`components/profile/ProfileHeader.tsx`)
  - [x] 프로필 이미지 (150px Desktop / 90px Mobile)
  - [x] 사용자명 (Bold)
  - [x] 통계: 게시물 수, 팔로워 수, 팔로잉 수
  - [x] "팔로우" / "팔로잉" 버튼 (다른 사용자 프로필)
  - [x] "프로필 편집" 버튼 (내 프로필, 1차 제외)
  - [ ] Fullname, Bio 표시
- [x] AvatarUpload 컴포넌트 (`components/profile/AvatarUpload.tsx`)
  - [x] 프로필 이미지 업로드 버튼
  - [x] Supabase Storage 업로드 (`uploads/{clerk_user_id}/avatar.jpg`)
  - [x] 이미지 미리보기
  - [x] 업로드 진행 상태 표시
- [x] Server Action: `actions/profile.ts`
  - [x] `getProfile` 함수
  - [x] 사용자 정보 조회
  - [x] 통계 데이터 조회 (`user_stats` 뷰)

### 5-2. 프로필 페이지 - 게시물 그리드

- [x] PostGrid 컴포넌트 (`components/profile/PostGrid.tsx`)
  - [x] 3열 그리드 레이아웃 (반응형)
  - [x] 1:1 정사각형 썸네일
  - [ ] Hover 시 응원/피드백 수 표시
  - [x] 클릭 시 게시물 상세 모달/페이지 이동
- [x] Server Action: `actions/post.ts`
  - [x] `getPostsByUserId` 함수
  - [x] 사용자별 게시물 조회
  - [x] 시간 역순 정렬

### 5-3. 팔로우 기능

- [x] Server Action: `actions/follow.ts`
  - [x] `toggleFollow` 함수 (팔로우/언팔로우 토글)
  - [x] `follows` 테이블 사용
  - [x] 자기 자신 팔로우 방지
- [x] FollowButton 컴포넌트 (`components/profile/FollowButton.tsx`)
  - [x] 미팔로우: "팔로우" 버튼 (파란색)
  - [x] 팔로우 중: "팔로잉" 버튼 (회색)
  - [x] Hover: "언팔로우" (빨간 테두리)
  - [x] 클릭 시 즉시 API 호출 → UI 업데이트
- [x] ProfileHeader에 FollowButton 통합

### 5-4. 게시물 상세 모달 (Desktop)

- [ ] PostModal 컴포넌트 (`components/post/PostModal.tsx`)
  - [ ] Desktop: 모달 (이미지 50% + 피드백 50%)
  - [ ] Mobile: 전체 페이지로 전환
  - [ ] ✕ 닫기 버튼
  - [ ] 이전/다음 게시물 네비게이션 (‹ ›)
  - [ ] PostCard와 동일한 기능 (응원하기, 피드백 작성)

## 6. 최종 마무리 & 배포

- [ ] 반응형 테스트
  - [ ] Desktop (1024px+) 테스트
  - [ ] Tablet (768px ~ 1023px) 테스트
  - [ ] Mobile (< 768px) 테스트
- [ ] 에러 핸들링
  - [ ] 네트워크 에러 처리
  - [ ] 파일 업로드 에러 처리
  - [ ] 인증 에러 처리
  - [ ] 사용자 친화적 에러 메시지
- [ ] Skeleton UI 및 로딩 상태
  - [ ] 모든 비동기 작업에 로딩 상태 추가
  - [ ] Skeleton UI 일관성 확인
- [ ] 성능 최적화
  - [ ] 이미지 최적화 (Next.js Image 컴포넌트)
  - [ ] 무한 스크롤 최적화
  - [ ] 불필요한 리렌더링 방지
- [ ] 배포
  - [x] Vercel 배포 설정
  - [x] 환경 변수 설정
  - [x] 프로덕션 빌드 테스트

## 7. 프로젝트 기본 파일

- [ ] `.cursor/` 디렉토리
  - [ ] `rules/` 커서룰
  - [ ] `mcp.json` MCP 서버 설정
  - [ ] `dir.md` 프로젝트 디렉토리 구조
- [ ] `.github/` 디렉토리
- [ ] `.husky/` 디렉토리
- [ ] `app/` 디렉토리
  - [ ] `favicon.ico` 파일
  - [ ] `not-found.tsx` 파일
  - [ ] `robots.ts` 파일
  - [ ] `sitemap.ts` 파일
  - [ ] `manifest.ts` 파일
- [ ] `supabase/` 디렉토리
  - [ ] 마이그레이션 파일 정리
- [ ] `public/` 디렉토리
  - [ ] `icons/` 디렉토리
  - [ ] `logo.png` 파일
  - [ ] `og-image.png` 파일
- [ ] 프로젝트 설정 파일
  - [ ] `tsconfig.json` 파일
  - [ ] `.cursorignore` 파일
  - [ ] `.gitignore` 파일
  - [ ] `.prettierignore` 파일
  - [ ] `.prettierrc` 파일
  - [ ] `eslint.config.mjs` 파일
  - [ ] `AGENTS.md` 파일

## 향후 작업 (기본 개발 완료 후)

### 다국어 지원

- [ ] next-intl 다국어 지원 설정
  - 참고: `docs/i18n-plan.md`
  - [ ] 패키지 설치 및 기본 설정
  - [ ] 미들웨어 설정 (next-intl + Clerk 통합)
  - [ ] App Router 구조 변경 (`app/[locale]`)
  - [ ] 번역 파일 작성 (`messages/ko.json`, `messages/en.json`)
  - [ ] 레이아웃 컴포넌트 마이그레이션 (Sidebar, BottomNav, Header)
  - [ ] 게시물 관련 컴포넌트 마이그레이션 (PostCard, CreatePostModal, CheerButton)
  - [ ] 프로필 관련 컴포넌트 마이그레이션 (ProfileHeader, FollowButton, AvatarUpload)
  - [ ] 피드백 관련 컴포넌트 마이그레이션 (FeedbackForm, FeedbackList)
  - [ ] 언어 전환 기능 추가 (LanguageSwitcher 컴포넌트)
  - [ ] Server Actions 및 페이지 마이그레이션
  - [ ] 테스트 및 최종 검증

### 2차 확장 기능 (1차 MVP 제외)

- [ ] 검색 기능 (사용자, 해시태그)
- [ ] 탐색 페이지
- [ ] 릴스
- [ ] 메시지 (DM)
- [ ] 알림
- [ ] 스토리
- [ ] 동영상 지원
- [ ] 이미지 여러 장 업로드
- [ ] 공유 버튼 기능
- [ ] 북마크 기능
- [ ] 프로필 편집 (Clerk 기본 외)
- [ ] 팔로워/팔로잉 목록 모달
- [ ] 멘토 지정 기능
