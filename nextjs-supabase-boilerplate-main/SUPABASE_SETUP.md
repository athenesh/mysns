# Supabase MCP 연결 가이드

## 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://umosqngwqtbqyklxwgpf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE=your_service_role_key_here

# Supabase CLI Configuration
SUPABASE_PROJECT_ID=umosqngwqtbqyklxwgpf
SUPABASE_ACCESS_TOKEN=your_access_token_here

# Clerk Configuration (if using Clerk auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Toss Payments Configuration
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key_here
TOSS_SECRET_KEY=your_toss_secret_key_here
```

## 2. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택: `umosqngwqtbqyklxwgpf`
3. Settings > API에서 다음 키들을 복사:
   - `anon` `public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` 키 → `SUPABASE_SERVICE_ROLE`

## 3. Supabase MCP 설정

Supabase MCP 서버를 사용하려면 액세스 토큰이 필요합니다:

1. Supabase Dashboard > Settings > Access Tokens
2. 새 토큰 생성
3. 환경 변수에 추가:
   ```bash
   SUPABASE_ACCESS_TOKEN=your_access_token_here
   ```

## 6. 연결 테스트

환경 변수 설정 후 다음 방법으로 연결을 테스트할 수 있습니다:

### 방법 1: 연결 테스트 유틸리티 사용

프로젝트에 포함된 연결 테스트 유틸리티를 사용하세요:

```typescript
// 브라우저 콘솔에서 실행
import { runFullConnectionTest } from "@/utils/supabase-connection-test";

// 전체 테스트 실행
await runFullConnectionTest();
```

### 방법 2: 개발 서버에서 테스트

```bash
# 프로젝트 디렉토리로 이동
cd nextjs-supabase-boilerplate-main

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm run dev
```

브라우저에서 `http://localhost:3000/products` 접속하여 상품 목록이 표시되는지 확인하세요.

### 방법 3: 브라우저 콘솔에서 직접 테스트

개발자 도구 콘솔에서 다음 코드를 실행하세요:

```javascript
// Supabase 클라이언트 생성
const supabase = createBrowserSupabaseClient();

// 상품 목록 조회 테스트
supabase
  .from("products")
  .select("*")
  .then(({ data, error }) => {
    if (error) {
      console.error("❌ 연결 실패:", error);
    } else {
      console.log("✅ 연결 성공:", data);
    }
  });
```

## 7. 현재 프로젝트 상태

- ✅ Supabase 클라이언트 설정 완료 (`src/utils/supabase/`)
- ✅ Clerk 인증 통합 완료
- ✅ 토스페이먼츠 통합 완료
- ✅ 데이터베이스 타입 정의 완료 (`src/types/database.types.ts`)
- ✅ 마이그레이션 파일 생성 완료 (`supabase/migrations/`)
- ✅ 연결 테스트 유틸리티 생성 완료 (`src/utils/supabase-connection-test.ts`)
- ⏳ 환경 변수 설정 필요
- ⏳ Supabase MCP 액세스 토큰 설정 필요

## 8. 다음 단계

1. 환경 변수 파일 생성 및 키 설정
2. Supabase MCP 액세스 토큰 설정
3. 데이터베이스 테이블 생성 (Supabase Dashboard 또는 CLI)
4. 애플리케이션 실행 및 테스트
