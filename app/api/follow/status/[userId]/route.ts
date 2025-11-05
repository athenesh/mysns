/**
 * @file route.ts
 * @description 팔로우 상태 확인 API Route
 *
 * GET /api/follow/status/[userId]
 * 특정 사용자에 대한 팔로우 상태 확인
 * 모바일 앱에서 사용할 RESTful API 엔드포인트
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkFollowStatus } from "@/actions/follow";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * GET /api/follow/status/[userId]
 * 특정 사용자에 대한 팔로우 상태 확인
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId: targetClerkId } = await params;
    console.group("GET /api/follow/status/[userId]");
    console.log("Target clerk ID:", targetClerkId);

    const { userId: currentClerkId } = await auth();

    // 비로그인 사용자는 항상 false 반환
    if (!currentClerkId) {
      console.log("Not authenticated, returning false");
      console.groupEnd();
      return NextResponse.json(
        { data: { is_following: false } },
        { status: 200 },
      );
    }

    // Clerk ID로 대상 사용자의 user_id 조회
    const supabase = getServiceRoleClient();
    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", targetClerkId)
      .single();

    if (userError || !targetUser) {
      console.error("Target user not found:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    console.log("Target user ID:", targetUser.id);

    // 팔로우 상태 확인
    const result = await checkFollowStatus(targetUser.id);

    if (result.error) {
      console.warn("Check follow status error:", result.error);
      // 에러가 있어도 기본값 반환
      console.groupEnd();
      return NextResponse.json(
        { data: { is_following: false } },
        { status: 200 },
      );
    }

    console.log("Follow status:", result.data);
    console.groupEnd();
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/follow/status/[userId] error:", error);
    // 에러 발생 시 기본값 반환
    return NextResponse.json(
      { data: { is_following: false } },
      { status: 200 },
    );
  }
}
