# 게시물 작성 플로우 (Create Post Flow)

이 문서는 게시물 작성 과정의 상세한 시퀀스 다이어그램을 제공합니다.

## 다이어그램

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as CreatePostModal
    participant SA as Server Action<br/>createPost
    participant Storage as Supabase Storage
    participant DB as Supabase DB<br/>posts 테이블
    participant Feed as 홈 피드

    User->>UI: "만들기" 버튼 클릭
    UI->>UI: 모달 열기
    User->>UI: 이미지 선택 (최대 5MB)
    UI->>UI: 이미지 미리보기
    User->>UI: 캡션 입력 (최대 2,200자)
    User->>UI: "게시" 버튼 클릭
    
    UI->>SA: FormData 전송<br/>(이미지 + 캡션)
    SA->>SA: 이미지 크기 검증<br/>(5MB 이하)
    SA->>SA: 캡션 길이 검증<br/>(2,200자 이하)
    
    SA->>Storage: 이미지 업로드<br/>uploads/{clerk_id}/filename.jpg
    Storage-->>SA: 업로드 성공<br/>파일 경로 반환
    
    SA->>SA: Supabase Storage<br/>Public URL 생성
    SA->>DB: posts 테이블에 삽입<br/>(user_id, image_url, caption)
    DB-->>SA: 게시물 생성 완료
    
    SA-->>UI: 게시물 생성 성공
    UI->>UI: 모달 닫기
    UI->>Feed: 페이지 새로고침<br/>또는 실시간 업데이트
    Feed->>DB: 최신 게시물 조회<br/>(post_stats VIEW)
    DB-->>Feed: 게시물 목록 반환
    Feed->>User: 새 게시물 표시
```

## 설명

이 플로우는 사용자가 게시물을 작성할 때 발생하는 모든 단계를 보여줍니다.

### 주요 단계

1. **UI 인터랙션**: 모달 열기, 이미지 선택, 캡션 입력
2. **검증**: 이미지 크기(5MB), 캡션 길이(2,200자) 검증
3. **이미지 업로드**: Supabase Storage에 파일 업로드
4. **데이터 저장**: posts 테이블에 게시물 정보 저장
5. **UI 업데이트**: 홈 피드에 새 게시물 표시

## 관련 파일

- `components/post/CreatePostModal.tsx` - 게시물 작성 모달 컴포넌트
- `actions/post.ts` - createPost Server Action
- `actions/storage.ts` - uploadFile Server Action
- `supabase/migrations/20251104172452_create_sns_tables.sql` - posts 테이블 정의

