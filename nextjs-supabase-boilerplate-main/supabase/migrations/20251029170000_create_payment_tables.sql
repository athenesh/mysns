-- ============================================
-- Payment System Database Schema Migration
-- Created: 2025-10-29
-- Description: Creates products and payments tables for the payment system
-- ============================================

-- ============================================
-- 1. Products 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 비활성화 (개발 환경)
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 상품을 조회할 수 있음
-- CREATE POLICY "Anyone can view products"
--   ON public.products
--   FOR SELECT
--   USING (true);

-- RLS 정책: 인증된 사용자만 상품을 관리할 수 있음
-- CREATE POLICY "Authenticated users can manage products"
--   ON public.products
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at DESC);

-- 업데이트 시간 자동 갱신 함수 (이미 존재하지 않을 경우에만 생성)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거
DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 샘플 데이터 삽입
INSERT INTO public.products (name, description, price, image_url) VALUES
  ('프리미엄 플랜', '모든 기능을 사용할 수 있는 프리미엄 플랜입니다.', 29900, null),
  ('스탠다드 플랜', '기본 기능을 사용할 수 있는 스탠다드 플랜입니다.', 14900, null),
  ('베이직 플랜', '무료 체험용 베이직 플랜입니다.', 0, null)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. Payments 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_key TEXT UNIQUE NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'DONE', 'CANCELED')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_id TEXT,
  payment_method TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 비활성화 (개발 환경)
-- ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 결제 내역만 조회 가능
-- CREATE POLICY "Users can view own payments"
--   ON public.payments
--   FOR SELECT
--   USING (
--     auth.uid()::text = user_id
--     OR user_id IS NULL  -- 비회원 결제 허용
--   );

-- RLS 정책: 모든 사용자가 임시 주문 생성 가능
-- CREATE POLICY "Anyone can create temporary orders"
--   ON public.payments
--   FOR INSERT
--   WITH CHECK (true);

-- RLS 정책: 인증된 사용자만 결제 정보 수정 가능
-- CREATE POLICY "Authenticated users can update payments"
--   ON public.payments
--   FOR UPDATE
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS payments_payment_key_idx ON public.payments(payment_key);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON public.payments(created_at DESC);

-- 업데이트 트리거
DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 완료 메시지
SELECT 'Database tables created successfully!' as message;
