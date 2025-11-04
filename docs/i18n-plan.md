# next-intl 다국어 지원 설정 계획

## 목표
한국어와 영어를 지원하는 다국어(i18n) 시스템 구축. 기존 하드코딩된 한국어 텍스트를 번역 키로 변경하고, 사용자가 언어를 선택할 수 있도록 구현.

## 현재 구조 분석
- `app/layout.tsx`: Root layout (Clerk koKR 설정)
- `app/(main)/layout.tsx`: 메인 레이아웃 (Sidebar, Header, BottomNav)
- `app/(main)/page.tsx`: 홈 피드
- `app/(main)/profile/[userId]/page.tsx`: 프로필 페이지
- `middleware.ts`: Clerk 미들웨어만 설정됨

## 구현 단계

### 1. 패키지 설치 및 기본 설정
- `next-intl` 패키지 설치
- `messages/ko.json`, `messages/en.json` 번역 파일 생성
- `i18n/request.ts` 설정 파일 생성 (언어 감지 및 설정)

### 2. 미들웨어 설정
- `middleware.ts` 수정: next-intl과 Clerk 미들웨어 통합
- 언어 감지 로직 추가 (쿠키, Accept-Language 헤더)
- 기본 언어: 한국어 (ko)

### 3. App Router 구조 변경
- `app/layout.tsx` → `app/[locale]/layout.tsx`로 이동
- `app/(main)` → `app/[locale]/(main)`로 이동
- Clerk 로컬라이제이션을 locale에 따라 동적 설정 (koKR/enUS)
- HTML lang 속성을 locale에 맞게 설정

### 4. 번역 파일 작성
- `messages/ko.json`: 한국어 번역 (모든 하드코딩된 텍스트)
- `messages/en.json`: 영어 번역
- 주요 카테고리:
  - `common`: 공통 (홈, 검색, 만들기, 로그인 등)
  - `post`: 게시물 관련 (응원하기, 피드백, 캡션 등)
  - `profile`: 프로필 관련 (팔로우, 팔로잉, 통계 등)
  - `navigation`: 네비게이션 (사이드바, 하단 네비)
  - `errors`: 에러 메시지

### 5. 컴포넌트 마이그레이션
- `components/layout/Sidebar.tsx`: `useTranslations` 적용
- `components/layout/BottomNav.tsx`: `useTranslations` 적용
- `components/post/PostCard.tsx`: 게시물 관련 번역
- `components/post/CreatePostModal.tsx`: 모달 텍스트 번역
- `components/feedback/FeedbackForm.tsx`: 피드백 폼 번역
- `components/profile/ProfileHeader.tsx`: 프로필 헤더 번역
- `components/profile/FollowButton.tsx`: 팔로우 버튼 번역
- `components/post/CheerButton.tsx`: 응원하기 버튼 번역

### 6. 언어 전환 기능
- `components/LanguageSwitcher.tsx` 생성
- 사이드바 또는 헤더에 언어 선택 드롭다운 추가
- 언어 변경 시 쿠키 저장 및 페이지 새로고침

### 7. Server Actions 및 페이지 마이그레이션
- Server Actions의 에러 메시지 번역 (서버 컴포넌트용 `getTranslations` 사용)
- `app/[locale]/(main)/page.tsx`: 홈 피드 페이지
- `app/[locale]/(main)/profile/[userId]/page.tsx`: 프로필 페이지

### 8. 메타데이터 및 SEO
- `app/[locale]/layout.tsx`에서 locale에 따른 메타데이터 설정
- 언어별 title, description 설정

## 새로운 디렉토리 구조

```
app/
├── [locale]/
│   ├── layout.tsx              # Locale-aware root layout
│   ├── (main)/
│   │   ├── layout.tsx          # Main layout (기존과 동일)
│   │   ├── page.tsx            # 홈 피드
│   │   └── profile/
│   │       └── [userId]/
│   │           └── page.tsx
│   └── api/                    # API routes (locale 무관)
├── layout.tsx                  # 최상위 layout (locale 감지용)
messages/
├── ko.json                     # 한국어 번역
└── en.json                     # 영어 번역
i18n/
└── request.ts                  # i18n 설정 및 요청 처리
components/
└── LanguageSwitcher.tsx         # 언어 전환 컴포넌트
```

## 주요 변경 파일

### 생성할 파일
- `messages/ko.json`
- `messages/en.json`
- `i18n/request.ts`
- `app/[locale]/layout.tsx`
- `app/[locale]/(main)/layout.tsx` (기존 이동)
- `app/[locale]/(main)/page.tsx` (기존 이동)
- `app/[locale]/(main)/profile/[userId]/page.tsx` (기존 이동)
- `components/LanguageSwitcher.tsx`

### 수정할 파일
- `middleware.ts`: next-intl + Clerk 통합
- `app/layout.tsx`: locale 감지용 최상위 레이아웃
- 모든 컴포넌트: 하드코딩된 텍스트 → 번역 키

## 번역 키 구조 예시

### messages/ko.json
```json
{
  "common": {
    "home": "홈",
    "search": "검색",
    "create": "만들기",
    "activity": "활동",
    "profile": "프로필",
    "login": "로그인"
  },
  "post": {
    "create": "새 게시물 만들기",
    "caption": "게시물에 대한 설명을 입력하세요...",
    "cheer": "응원",
    "cheerCount": "{count}개 응원",
    "feedback": "피드백",
    "feedbackRequest": "피드백 요청...",
    "noPosts": "게시물이 없습니다",
    "createFirstPost": "첫 게시물을 만들어보세요!",
    "noMorePosts": "더 이상 게시물이 없습니다"
  },
  "profile": {
    "edit": "프로필 편집",
    "follow": "팔로우",
    "following": "팔로잉",
    "unfollow": "언팔로우",
    "posts": "게시물",
    "followers": "팔로워",
    "followingCount": "팔로잉",
    "notFound": "프로필을 찾을 수 없습니다"
  },
  "errors": {
    "loginRequired": "로그인이 필요합니다",
    "userNotFound": "사용자 정보를 찾을 수 없습니다",
    "postNotFound": "게시물을 찾을 수 없습니다",
    "unauthorized": "권한이 없습니다"
  }
}
```

### messages/en.json
```json
{
  "common": {
    "home": "Home",
    "search": "Search",
    "create": "Create",
    "activity": "Activity",
    "profile": "Profile",
    "login": "Sign In"
  },
  "post": {
    "create": "Create New Post",
    "caption": "Write a caption...",
    "cheer": "Cheer",
    "cheerCount": "{count} cheers",
    "feedback": "Feedback",
    "feedbackRequest": "Request feedback...",
    "noPosts": "No posts yet",
    "createFirstPost": "Create your first post!",
    "noMorePosts": "No more posts"
  },
  "profile": {
    "edit": "Edit Profile",
    "follow": "Follow",
    "following": "Following",
    "unfollow": "Unfollow",
    "posts": "Posts",
    "followers": "Followers",
    "followingCount": "Following",
    "notFound": "Profile not found"
  },
  "errors": {
    "loginRequired": "Login required",
    "userNotFound": "User not found",
    "postNotFound": "Post not found",
    "unauthorized": "Unauthorized"
  }
}
```

## 개발 순서

1. **패키지 설치 및 기본 설정** (i18n 파일, 번역 파일 생성)
2. **미들웨어 설정** (next-intl + Clerk 통합)
3. **App Router 구조 변경** (locale 세그먼트 추가)
4. **번역 파일 작성** (한국어/영어 전체 번역)
5. **레이아웃 컴포넌트 마이그레이션** (Sidebar, BottomNav, Header)
6. **게시물 관련 컴포넌트 마이그레이션** (PostCard, CreatePostModal 등)
7. **프로필 관련 컴포넌트 마이그레이션** (ProfileHeader, FollowButton 등)
8. **언어 전환 기능 추가** (LanguageSwitcher 컴포넌트)
9. **Server Actions 및 페이지 마이그레이션**
10. **테스트 및 최종 검증**

## 사용 예시

### Client Component에서 사용
```tsx
// components/layout/Sidebar.tsx
'use client';

import { useTranslations } from 'next-intl';

export function Sidebar() {
  const t = useTranslations('common');
  
  return (
    <nav>
      <Link href="/">{t('home')}</Link>
      <Link href="/search">{t('search')}</Link>
      {/* ... */}
    </nav>
  );
}
```

### Server Component에서 사용
```tsx
// app/[locale]/(main)/page.tsx
import { useTranslations } from 'next-intl';

export default async function HomePage() {
  const t = await useTranslations('post');
  
  return <div>{t('noPosts')}</div>;
}
```

### Server Actions에서 사용
```tsx
// actions/post.ts
'use server';

import { getTranslations } from 'next-intl/server';

export async function createPost(formData: FormData) {
  const t = await getTranslations('errors');
  
  // ...
  if (!userId) {
    return { error: t('loginRequired') };
  }
}
```

## Clerk 로컬라이제이션 통합

```tsx
// app/[locale]/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { koKR, enUS } from '@clerk/localizations';

export default function LocaleLayout({ 
  children, 
  params: { locale } 
}) {
  const clerkLocale = locale === 'ko' ? koKR : enUS;
  
  return (
    <ClerkProvider localization={clerkLocale}>
      <html lang={locale}>
        {children}
      </html>
    </ClerkProvider>
  );
}
```

## 언어 전환 컴포넌트 예시

```tsx
// components/LanguageSwitcher.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    router.refresh();
  };

  return (
    <select 
      value={locale} 
      onChange={(e) => switchLocale(e.target.value)}
    >
      <option value="ko">한국어</option>
      <option value="en">English</option>
    </select>
  );
}
```

## 주의사항

1. **URL 구조 변경**: 모든 URL이 `/[locale]/...` 형식으로 변경됨
2. **링크 업데이트**: 모든 내부 링크를 `/[locale]/...` 형식으로 변경
3. **API Routes**: `/api/...` 경로는 locale 세그먼트 없이 유지
4. **Clerk 인증**: 로그인/회원가입 후 리다이렉트 URL에 locale 포함 필요
5. **메타데이터**: 각 locale에 맞는 메타데이터 설정 필요

## 참고 자료

- [next-intl 공식 문서](https://next-intl-docs.vercel.app/)
- [Next.js 15 App Router i18n 가이드](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Clerk 다국어 지원](https://clerk.com/docs/customization/localization)

## 진행 시점

**예상 시작 시점**: MVP 핵심 기능 완료 후 (약 1-2주 후)

**시작 조건:**
- ✅ 게시물, 응원하기, 피드백, 프로필, 팔로우 기능이 안정적으로 동작
- ✅ 주요 버그 수정 완료
- ✅ 반응형 테스트 완료
- ✅ 새로운 기능 추가가 잠시 멈춘 시점

---

**작성일**: 2025-01-XX  
**상태**: 계획 수립 완료 (대기 중)  
**우선순위**: 중간 (기본 개발 완료 후 진행)

