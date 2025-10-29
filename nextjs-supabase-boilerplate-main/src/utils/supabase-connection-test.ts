/**
 * @file supabase-connection-test.ts
 * @description Supabase 연결 테스트 유틸리티
 *
 * 이 파일은 Supabase 데이터베이스 연결을 테스트하고
 * 기본적인 CRUD 작업을 확인하는 기능을 제공합니다.
 */

import { createBrowserSupabaseClient } from "@/utils/supabase/client";

/**
 * Supabase 연결 테스트
 *
 * @returns Promise<boolean> 연결 성공 여부
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.group("🔗 Supabase 연결 테스트 시작");

    const supabase = createBrowserSupabaseClient();

    // 1. 연결 테스트 - products 테이블 조회
    console.log("📊 products 테이블 조회 중...");
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .limit(1);

    if (productsError) {
      console.error("❌ products 테이블 조회 실패:", productsError);
      return false;
    }

    console.log("✅ products 테이블 조회 성공:", products);

    // 2. payments 테이블 존재 확인
    console.log("📊 payments 테이블 조회 중...");
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .limit(1);

    if (paymentsError) {
      console.error("❌ payments 테이블 조회 실패:", paymentsError);
      return false;
    }

    console.log("✅ payments 테이블 조회 성공:", payments);

    // 3. 샘플 데이터 확인
    console.log("📊 샘플 데이터 확인 중...");
    const { data: sampleProducts, error: sampleError } = await supabase
      .from("products")
      .select("id, name, price")
      .order("created_at", { ascending: false });

    if (sampleError) {
      console.error("❌ 샘플 데이터 조회 실패:", sampleError);
      return false;
    }

    console.log("✅ 샘플 데이터 조회 성공:", sampleProducts);
    console.log(`📈 총 ${sampleProducts?.length || 0}개의 상품이 있습니다.`);

    console.groupEnd();
    return true;
  } catch (error) {
    console.error("❌ Supabase 연결 테스트 실패:", error);
    console.groupEnd();
    return false;
  }
}

/**
 * 환경 변수 확인
 *
 * @returns boolean 환경 변수 설정 여부
 */
export function checkEnvironmentVariables(): boolean {
  console.group("🔧 환경 변수 확인");

  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missingVars: string[] = [];

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
      console.error(`❌ ${varName}이 설정되지 않았습니다.`);
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  });

  if (missingVars.length > 0) {
    console.error(
      `❌ 총 ${missingVars.length}개의 환경 변수가 누락되었습니다.`,
    );
    console.groupEnd();
    return false;
  }

  console.log("✅ 모든 필수 환경 변수가 설정되었습니다.");
  console.groupEnd();
  return true;
}

/**
 * 전체 연결 테스트 실행
 *
 * @returns Promise<boolean> 전체 테스트 성공 여부
 */
export async function runFullConnectionTest(): Promise<boolean> {
  console.log("🚀 Supabase 전체 연결 테스트 시작");

  // 1. 환경 변수 확인
  const envCheck = checkEnvironmentVariables();
  if (!envCheck) {
    console.error("❌ 환경 변수 확인 실패");
    return false;
  }

  // 2. 데이터베이스 연결 테스트
  const connectionTest = await testSupabaseConnection();
  if (!connectionTest) {
    console.error("❌ 데이터베이스 연결 테스트 실패");
    return false;
  }

  console.log("🎉 모든 테스트가 성공적으로 완료되었습니다!");
  return true;
}
