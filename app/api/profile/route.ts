/**
 * @file route.ts
 * @description 프로필 API Routes
 *
 * 현재 사용자 프로필 조회 및 수정
 * 모바일 앱에서 사용할 RESTful API 엔드포인트
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileData, updateProfile } from "@/actions/profile";
import type { Profile } from "@/types/sns";

/**
 * GET /api/profile
 * 현재 사용자 프로필 조회
 */
export async function GET() {
  try {
    console.group("GET /api/profile");
    const { userId } = await auth();

    if (!userId) {
      console.error("Unauthorized");
      console.groupEnd();
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    console.log("Fetching profile for clerk ID:", userId);
    const result = await getProfileData(userId, userId);

    if (result.error || !result.data) {
      console.error("Profile fetch failed:", result.error);
      console.groupEnd();
      return NextResponse.json(
        { error: result.error || "프로필을 찾을 수 없습니다." },
        { status: result.error === "사용자를 찾을 수 없습니다." ? 404 : 500 },
      );
    }

    console.log("Profile fetched successfully");
    console.groupEnd();
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/profile error:", error);
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

/**
 * PUT /api/profile
 * 현재 사용자 프로필 수정
 * Body: { fullname?: string | null, bio?: string | null }
 */
export async function PUT(request: Request) {
  try {
    console.group("PUT /api/profile");
    const { userId } = await auth();

    if (!userId) {
      console.error("Unauthorized");
      console.groupEnd();
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { fullname, bio } = body;

    console.log("Updating profile:", { fullname, bio });

    // 유효성 검증
    if (
      fullname !== undefined &&
      typeof fullname !== "string" &&
      fullname !== null
    ) {
      console.error("Invalid fullname type");
      console.groupEnd();
      return NextResponse.json(
        { error: "fullname은 문자열이거나 null이어야 합니다." },
        { status: 400 },
      );
    }

    if (bio !== undefined && typeof bio !== "string" && bio !== null) {
      console.error("Invalid bio type");
      console.groupEnd();
      return NextResponse.json(
        { error: "bio는 문자열이거나 null이어야 합니다." },
        { status: 400 },
      );
    }

    const result = await updateProfile({ fullname, bio });

    if (result.error || !result.data) {
      console.error("Profile update failed:", result.error);
      console.groupEnd();
      return NextResponse.json(
        { error: result.error || "프로필 수정에 실패했습니다." },
        { status: 500 },
      );
    }

    console.log("Profile updated successfully");
    console.groupEnd();
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "프로필 수정에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
