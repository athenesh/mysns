-- ============================================
-- Add fullname and bio columns to users table
-- ============================================
-- 프로필 페이지에 Fullname, Bio 표시 기능을 위한 컬럼 추가
-- ============================================

-- fullname 컬럼 추가
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS fullname TEXT;

-- bio 컬럼 추가
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 주석 추가
COMMENT ON COLUMN public.users.fullname IS '사용자의 전체 이름 (선택사항)';
COMMENT ON COLUMN public.users.bio IS '사용자의 자기소개 (선택사항)';

