/**
 * @file route.ts
 * @description 팔로우/언팔로우 토글 API Route
 *
 * POST /api/follow/[userId]
 * 특정 사용자 팔로우 또는 언팔로우
 * 모바일 앱에서 사용할 RESTful API 엔드포인트
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { toggleFollow } from "@/actions/follow";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * POST /api/follow/[userId]
 * 특정 사용자 팔로우 또는 언팔로우 토글
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId: targetClerkId } = await params;
    console.group("POST /api/follow/[userId]");
    console.log("Target clerk ID:", targetClerkId);

    const { userId: currentClerkId } = await auth();

    if (!currentClerkId) {
      console.error("Unauthorized");
      console.groupEnd();
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
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

    // 자기 자신 팔로우 방지
    if (currentClerkId === targetClerkId) {
      console.error("Cannot follow self");
      console.groupEnd();
      return NextResponse.json(
        { error: "자기 자신을 팔로우할 수 없습니다." },
        { status: 400 },
      );
    }

    // 팔로우/언팔로우 토글
    const result = await toggleFollow(targetUser.id);

    if (result.error) {
      console.error("Toggle follow failed:", result.error);
      console.groupEnd();
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log("Follow toggled successfully:", result.data);
    console.groupEnd();
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error("POST /api/follow/[userId] error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "팔로우 처리에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
