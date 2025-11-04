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
- [ ] `public/` 디렉토리
  - [ ] `icons/` 디렉토리
  - [ ] `logo.png` 파일
  - [ ] `og-image.png` 파일
- [ ] `tsconfig.json` 파일
- [ ] `.cursorignore` 파일
- [ ] `.gitignore` 파일
- [ ] `.prettierignore` 파일
- [ ] `.prettierrc` 파일
- [ ] `tsconfig.json` 파일
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
