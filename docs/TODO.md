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
  - [ ] 로그인/회원가입 페이지 스타일링 - Clerk 기본 스타일 사용 중
- [x] Supabase 프로젝트 생성 및 연동
  - [x] Supabase 프로젝트 생성 (완료)
  - [x] Supabase 클라이언트 설정 (완료)
  - [x] Storage 버킷 생성 (`uploads`) (완료)
- [x] 데이터베이스 스키마 생성
  - [x] `users` 테이블 생성
  - [x] `posts` 테이블 생성
  - [x] `likes` 테이블 생성 (응원하기)
  - [x] `comments` 테이블 생성 (피드백 요청)
  - [x] `comments` 테이블에 `parent_comment_id` 컬럼 추가 (대댓글 지원)
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
    - [x] 삭제 메뉴 (본인 게시물만 표시)
  - [x] 이미지 영역
    - [x] 1:1 정사각형 비율
    - [x] 더블탭 응원하기 기능 (모바일)
  - [x] 액션 버튼 (48px)
    - [x] ❤️ 응원하기 버튼
    - [x] 💬 피드백 요청 버튼
    - [ ] ✈️ 공유 버튼 (UI만, 기능 제외) - 1차 MVP 제외
    - [ ] 🔖 북마크 버튼 (UI만, 기능 제외) - 1차 MVP 제외
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
  - [x] 무한 스크롤 구현 (Intersection Observer)
  - [x] Server Action: `actions/post.ts`
  - [x] `getPosts` 함수 (페이지네이션)
  - [x] 시간 역순 정렬
  - [x] 10개씩 로드
  - [x] `deletePost` 함수 (게시물 삭제)

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
  - [x] 이미지 URL만 받아서 게시물 생성 (클라이언트에서 업로드 완료 후 URL 전달)
  - [x] `posts` 테이블에 데이터 저장
  - [x] Server Action body size limit 문제 해결 (클라이언트 직접 업로드로 변경)
- [x] 이미지 업로드 로직
  - [x] 클라이언트에서 Storage 직접 업로드 (`useClerkSupabaseClient` 사용)
  - [x] 업로드 진행 상태 표시 (진행률 바)
  - [x] 에러 핸들링
  - [x] 파일 검증 (크기, 형식) - 클라이언트에서 처리

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
  - [x] 삭제 확인 다이얼로그
- [x] PostFeed 무한 스크롤
  - [x] Intersection Observer 사용
  - [x] 하단 도달 시 10개씩 추가 로드
  - [x] 로딩 상태 표시
  - [x] 에러 처리 및 재시도 기능

### 4-5. 피드백 기능 - 대댓글 (답글) 구현

- [x] 데이터베이스 마이그레이션
  - [x] `comments` 테이블에 `parent_comment_id` 컬럼 추가
  - [x] 인덱스 생성 (대댓글 조회 성능 향상)
- [x] 타입 정의 업데이트
  - [x] `CommentWithUser`에 `parent_comment_id` 필드 추가
  - [x] `CommentWithUser`에 `replies` 및 `replies_count` 필드 추가
- [x] Server Action 업데이트 (`actions/feedback.ts`)
  - [x] `createFeedback` 함수에 `parentId` 파라미터 추가
  - [x] `getFeedbacks` 함수에 계층 구조 조회 로직 추가 (대댓글 포함)
  - [x] 대댓글 수 집계 로직 구현
- [x] FeedbackList 컴포넌트 개선
  - [x] Instagram 스타일 UI 구현 (이름 + 내용 한 줄)
  - [x] 답글 버튼 추가 (각 피드백 옆)
  - [x] 대댓글 표시 (들여쓰기, 작은 아바타)
  - [x] "답글 N개 보기/숨기기" 토글 기능
  - [x] 대댓글 작성 폼 통합
- [x] FeedbackForm 컴포넌트 개선
  - [x] 대댓글 작성 지원 (`parentId` prop 추가)
  - [x] 부모 댓글 작성자 이름 표시
  - [x] 취소 버튼 추가 (대댓글 작성 시)
  - [x] Instagram 스타일 입력 폼 스타일링
- [x] PostCard 및 PostModal 통합
  - [x] 대댓글 기능 통합 확인
  - [x] 피드백 수 집계 로직 수정 (최상위 댓글만 카운트)

## 5. 프로필 페이지 & 팔로우 기능

### 5-1. 프로필 페이지 - 기본 정보

- [x] 동적 라우트 (`app/profile/[userId]/page.tsx`)
  - [x] `/profile/[userId]` - 통합 프로필 페이지 (내 프로필 및 다른 사용자 프로필)
  - [x] 프로필 페이지 레이아웃 (`app/profile/layout.tsx`) - Sidebar 포함
- [x] ProfileHeader 컴포넌트 (`components/profile/ProfileHeader.tsx`)
  - [x] 프로필 이미지 (150px Desktop / 90px Mobile)
  - [x] 사용자명 (Bold)
  - [x] 통계: 게시물 수, 팔로워 수, 팔로잉 수
  - [x] "팔로우" / "팔로잉" 버튼 (다른 사용자 프로필)
  - [x] "프로필 편집" 버튼 (내 프로필, 1차 제외 - 기능 미구현)
  - [x] Fullname, Bio 표시
  - [x] 게시물 탭 UI ([게시물] [릴스] [태그됨] - 현재는 게시물만 활성화)
  - [x] 로깅 최적화 (개발 모드에서만 로그 출력) ✅ 완료
- [x] AvatarUpload 컴포넌트 (`components/profile/AvatarUpload.tsx`)
  - [x] 프로필 이미지 업로드 버튼
  - [x] Supabase Storage 업로드 (`uploads/{clerk_user_id}/avatar.jpg`)
  - [x] 이미지 미리보기
  - [x] 업로드 진행 상태 표시
- [x] Server Action: `actions/profile.ts`
  - [x] `getProfile` 함수
  - [x] 사용자 정보 조회
  - [x] 통계 데이터 조회 (`user_stats` 뷰)
- [x] 데이터베이스 마이그레이션
  - [x] `users` 테이블에 `fullname`, `bio` 컬럼 추가
  - [x] 타입 정의 업데이트 (`types/sns.ts`)

### 5-2. 프로필 페이지 - 게시물 그리드

- [x] PostGrid 컴포넌트 (`components/profile/PostGrid.tsx`)
  - [x] 3열 그리드 레이아웃 (반응형)
  - [x] 1:1 정사각형 썸네일
  - [x] Hover 시 응원/피드백 수 표시 UI (실제 데이터 연동 완료)
  - [x] 클릭 시 게시물 상세 모달/페이지 이동
  - [ ] Hover 효과 모바일 대응 개선 → 5-5-3에서 개선 예정
  - [ ] 이미지 최적화 개선 → 5-5-3에서 개선 예정
- [x] ProfileTabs 컴포넌트 (`components/profile/ProfileTabs.tsx`)
  - [x] [게시물] [릴스] [태그됨] 탭 UI 구현
  - [x] 현재는 게시물 탭만 활성화 (릴스, 태그됨은 향후 기능)
- [x] ProfilePageWrapper 컴포넌트 (`components/profile/ProfilePageWrapper.tsx`)
  - [x] 탭 상태 관리 래퍼 컴포넌트
  - [x] 클라이언트 사이드 상태 관리
  - [ ] 데이터 전달 구조 단순화 → 5-5-2에서 개선 예정
- [x] Server Action: `actions/post.ts`
  - [x] `getPostsByUserId` 함수 (기본 구현 완료)
  - [x] 사용자별 게시물 조회
  - [x] 시간 역순 정렬
  - [ ] N+1 쿼리 문제 해결 → 5-5-1에서 개선 예정 (최우선)

### 5-3. 팔로우 기능

- [x] Server Action: `actions/follow.ts`
  - [x] `toggleFollow` 함수 (팔로우/언팔로우 토글)
  - [x] `checkFollowStatus` 함수 (팔로우 상태 확인)
  - [x] `follows` 테이블 사용
  - [x] 자기 자신 팔로우 방지
  - [x] 로깅 최적화 (개발 모드에서만 로그 출력)
- [x] FollowButton 컴포넌트 (`components/profile/FollowButton.tsx`)
  - [x] 미팔로우: "팔로우" 버튼 (파란색 #0095f6)
  - [x] 팔로우 중: "팔로잉" 버튼 (회색 테두리)
  - [x] Hover: "언팔로우" (빨간 테두리)
  - [x] 클릭 시 즉시 API 호출 → UI 업데이트
  - [x] 초기 상태 동기화 (useEffect로 prop 변경 시 상태 업데이트)
  - [x] 에러 처리 개선 (롤백 로직 개선)
  - [x] 로깅 추가 (개발 모드에서만)
  - [x] `onFollowChange` 콜백 추가 (팔로워 수 업데이트용)
- [x] ProfileHeader에 FollowButton 통합
  - [x] 팔로워 수 실시간 업데이트 (Optimistic update)
  - [x] 팔로우/언팔로우 후 팔로워 수 즉시 반영
- [x] API Routes: `app/api/follow/`
  - [x] `POST /api/follow/[userId]`: 팔로우/언팔로우 토글 API
  - [x] `GET /api/follow/status/[userId]`: 팔로우 상태 확인 API (모바일 앱용)

### 5-5. 프로필 페이지 성능 최적화 (개선 예정) ⚠️ 우선순위: 높음

#### 5-5-1. N+1 쿼리 문제 해결 (최우선)

- [ ] `actions/post.ts` - `getPostsByUserId` 함수 개선
  - [ ] 반환 타입을 `PaginatedResponse<PostWithUser>`로 변경
  - [ ] `post_stats` 뷰와 `users` 테이블 JOIN 구현
  - [ ] `getPosts` 함수와 동일한 패턴 적용
  - [ ] 현재 사용자의 응원하기 상태 포함 (`is_liked` 필드)
- [ ] `app/profile/[userId]/page.tsx` 데이터 조회 로직 개선
  - [ ] `Promise.all` 로직 제거 (64-103줄)
  - [ ] `getPostsByUserId`에서 직접 `PostWithUser[]` 받아서 사용
  - [ ] 추가 쿼리 없이 데이터 사용
- [ ] 예상 효과
  - 게시물 10개 기준: 20개 쿼리 → 1개 쿼리로 감소
  - 응답 시간 대폭 개선

#### 5-5-2. 데이터 전달 구조 단순화

- [ ] `components/profile/PostGrid.tsx` Props 단순화
  - [ ] `posts` prop 제거
  - [ ] `postsWithUser`만 받도록 변경
  - [ ] 매핑 로직 제거
- [ ] `components/profile/ProfilePageWrapper.tsx` 개선
  - [ ] `posts` prop 제거
  - [ ] `postsWithUser`만 전달
  - [ ] 불필요한 데이터 중복 제거

#### 5-5-3. 성능 및 UX 개선

- [ ] `components/profile/PostGrid.tsx` Hover 효과 개선
  - [ ] `@media (hover: hover)` 사용하여 데스크톱에서만 hover 효과
  - [ ] 모바일 대응 검토 (터치 이벤트 또는 항상 표시)
- [ ] 이미지 최적화
  - [ ] `unoptimized` 조건 재검토
  - [ ] Supabase Storage URL 최적화 활용
- [x] `components/profile/ProfileHeader.tsx` 로깅 최적화
  - [x] `useEffect`에서 개발 모드에서만 로그 출력
  - [x] `process.env.NODE_ENV === 'development'` 조건 추가

#### 5-5-4. 에러 처리 개선

- [ ] `app/profile/[userId]/page.tsx` 에러 처리
  - [ ] 게시물 로드 실패 시 사용자 친화적 메시지 표시
  - [ ] 재시도 기능 검토 (선택사항)
- [ ] 로딩 상태 개선
  - [ ] `ProfilePageSkeleton` 정확도 향상
  - [ ] 실제 레이아웃과 일치하도록 개선

### 5-4. 게시물 상세 모달/페이지

- [x] PostModal 컴포넌트 (`components/post/PostModal.tsx`)
  - [x] Desktop: 모달 (이미지 50% + 피드백 50%)
  - [x] Mobile: 전체 페이지로 전환 (기본 구조 준비 완료)
  - [x] ✕ 닫기 버튼 (Dialog 내장)
  - [ ] 이전/다음 게시물 네비게이션 (‹ ›) - 1차 MVP 제외
  - [x] PostCard와 동일한 기능 (응원하기, 피드백 작성)
  - [x] 삭제 기능 (본인 게시물만)
- [x] PostDetailLayout 컴포넌트 (`components/post/PostDetailLayout.tsx`)
  - [x] 공통 레이아웃 컴포넌트 생성 (PostModal과 PostDetailPage에서 재사용)
  - [x] 이미지 영역 (50%) + 피드백 영역 (50%)
  - [x] 삭제 메뉴 (본인 게시물만 표시)
- [x] PostModal 리팩토링
  - [x] PostDetailLayout 컴포넌트 사용하도록 변경
- [x] 게시물 상세 페이지 (`app/feed/post/[postId]/page.tsx`)
  - [x] Server Action: `getPostById` 함수 추가 (`actions/post.ts`)
  - [x] Desktop 레이아웃 구현 (모달과 동일한 레이아웃)
  - [x] 에러 처리 (게시물 없음 → not-found)
  - [x] 로그 추가 (핵심 기능)
  - [x] 삭제 기능 (본인 게시물만, 삭제 후 `/feed`로 리다이렉트)
- [x] 게시물 삭제 기능
  - [x] DeletePostDialog 컴포넌트 (`components/post/DeletePostDialog.tsx`)
  - [x] 삭제 확인 다이얼로그 (Instagram 스타일)
  - [x] PostCard에 삭제 메뉴 추가
  - [x] PostDetailLayout에 삭제 메뉴 추가
  - [x] PostFeed에서 삭제 후 게시물 제거 (optimistic update)
  - [x] PostModal에서 삭제 후 모달 닫기
  - [x] 게시물 상세 페이지에서 삭제 후 리다이렉트

## 6. 최종 마무리 & 배포

- [x] 반응형 테스트
  - [x] Desktop (1024px+) 테스트
  - [x] Tablet (768px ~ 1023px) 테스트
  - [x] Mobile (< 768px) 테스트
- [x] 에러 핸들링
  - [x] 네트워크 에러 처리
  - [x] 파일 업로드 에러 처리
  - [x] 인증 에러 처리
  - [x] 사용자 친화적 에러 메시지
- [x] Skeleton UI 및 로딩 상태
  - [x] 모든 비동기 작업에 로딩 상태 추가
  - [x] Skeleton UI 일관성 확인 (PostFeedSkeleton 구현 완료)
- [x] 성능 최적화
  - [x] 이미지 최적화 (Next.js Image 컴포넌트)
  - [x] 무한 스크롤 최적화 (Intersection Observer)
  - [x] 불필요한 리렌더링 방지 (React.memo)
  - [x] Optimistic UI 업데이트 (응원하기, 피드백)
- [x] 배포
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
  - [x] `not-found.tsx` 파일
  - [x] `robots.ts` 파일
  - [x] `sitemap.ts` 파일
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
