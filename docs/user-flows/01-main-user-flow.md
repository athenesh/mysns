# 전체 사용자 플로우 (Main User Flow)

이 문서는 성장 공유 SNS 애플리케이션의 전체 사용자 플로우를 다이어그램으로 표현합니다.

## 다이어그램

```mermaid
flowchart TD
    Start([사용자 접속]) --> Auth{로그인 상태?}
    Auth -->|미로그인| SignIn[회원가입/로그인<br/>Clerk 인증]
    Auth -->|로그인| Home[홈 피드<br/>/]
    
    SignIn --> SyncUser[Clerk → Supabase<br/>사용자 동기화]
    SyncUser --> Home
    
    Home --> BrowseFeed[게시물 피드 탐색<br/>무한 스크롤]
    
    BrowseFeed --> ActionMenu{사용자 액션}
    
    ActionMenu -->|게시물 작성| CreatePost[게시물 작성 모달<br/>이미지 업로드 + 캡션]
    ActionMenu -->|응원하기| Cheer[응원하기 토글<br/>❤️ 버튼]
    ActionMenu -->|피드백 요청| Feedback[피드백 작성<br/>💬 입력]
    ActionMenu -->|프로필 보기| Profile[프로필 페이지<br/>/profile/[userId]]
    ActionMenu -->|게시물 상세| PostDetail[게시물 상세 모달<br/>Desktop/Mobile]
    
    CreatePost --> UploadImage[Supabase Storage<br/>이미지 업로드]
    UploadImage --> SavePost[posts 테이블<br/>게시물 저장]
    SavePost --> Home
    
    Cheer --> ToggleLike[likes 테이블<br/>응원 추가/삭제]
    ToggleLike --> UpdateUI[UI 업데이트<br/>응원 수 증가/감소]
    UpdateUI --> BrowseFeed
    
    Feedback --> SaveComment[comments 테이블<br/>피드백 저장]
    SaveComment --> UpdateFeedUI[피드백 목록 업데이트]
    UpdateFeedUI --> BrowseFeed
    
    Profile --> ProfileAction{프로필 액션}
    ProfileAction -->|내 프로필| MyProfile[프로필 이미지 업로드<br/>게시물 그리드]
    ProfileAction -->|다른 사용자| OtherProfile[팔로우 버튼<br/>게시물 그리드]
    
    MyProfile --> UploadAvatar[Supabase Storage<br/>프로필 이미지 업로드]
    UploadAvatar --> UpdateUser[users 테이블<br/>avatar_url 업데이트]
    UpdateUser --> MyProfile
    
    OtherProfile --> FollowAction[팔로우/언팔로우<br/>follows 테이블]
    FollowAction --> UpdateFollowUI[팔로워 수 업데이트]
    UpdateFollowUI --> OtherProfile
    
    PostDetail --> PostActions{게시물 액션}
    PostActions -->|응원하기| Cheer
    PostActions -->|피드백| Feedback
    PostActions -->|삭제| DeletePost[게시물 삭제<br/>본인만 가능]
    DeletePost --> Home
```

## 설명

이 플로우는 사용자가 애플리케이션에 접속한 후부터 모든 주요 기능을 사용하는 전체 과정을 보여줍니다.

### 주요 단계

1. **인증**: Clerk를 통한 로그인 및 사용자 동기화
2. **홈 피드**: 게시물 목록 탐색
3. **게시물 작성**: 이미지 업로드 및 캡션 입력
4. **상호작용**: 응원하기, 피드백 요청
5. **프로필 관리**: 프로필 이미지 업로드, 팔로우/언팔로우

## 관련 파일

- `app/(main)/page.tsx` - 홈 피드 페이지
- `app/(main)/profile/[userId]/page.tsx` - 프로필 페이지
- `components/post/PostCard.tsx` - 게시물 카드 컴포넌트
- `components/post/CreatePostModal.tsx` - 게시물 작성 모달
- `middleware.ts` - 인증 미들웨어

