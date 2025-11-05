-- ============================================
-- Add Reply Support to Comments Table
-- ============================================
-- 대댓글(답글) 기능을 위한 parent_comment_id 컬럼 추가
-- ============================================

-- parent_comment_id 컬럼 추가 (대댓글 참조)
ALTER TABLE IF EXISTS public.comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- 인덱스 생성 (대댓글 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON public.comments(parent_comment_id);

-- 대댓글이 없는 댓글만 조회할 때 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post_id_parent_null ON public.comments(post_id, parent_comment_id) 
WHERE parent_comment_id IS NULL;

-- 뷰 업데이트: 대댓글 수 포함 (대댓글은 댓글 수에 포함되므로 기존 뷰는 그대로 유지)
-- comments_count는 댓글과 대댓글 모두 포함

