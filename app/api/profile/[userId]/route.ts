/**
 * @file route.ts
 * @description 특정 사용자 프로필 조회 API Route
 *
 * GET /api/profile/[userId]
 * 특정 사용자의 프로필 정보 조회
 * 모바일 앱에서 사용할 RESTful API 엔드포인트
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileData } from "@/actions/profile";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * GET /api/profile/[userId]
 * 특정 사용자 프로필 조회
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId: targetClerkId } = await params;
    console.group("GET /api/profile/[userId]");
    console.log("Target clerk ID:", targetClerkId);

    const { userId: currentClerkId } = await auth();

    console.log("Auth status:", {
      current_clerk_id: currentClerkId || "not authenticated",
      target_clerk_id: targetClerkId,
    });

    const result = await getProfileData(targetClerkId, currentClerkId || null);

    if (result.error || !result.data) {
      console.error("Profile fetch failed:", result.error);
      console.groupEnd();
      return NextResponse.json(
        {
          error: result.error || "프로필을 찾을 수 없습니다.",
        },
        {
          status: result.error === "사용자를 찾을 수 없습니다." ? 404 : 500,
        },
      );
    }

    console.log("Profile fetched successfully");
    console.groupEnd();
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/profile/[userId] error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "프로필 조회에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
