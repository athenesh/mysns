/**
 * @file route.ts
 * @description 프로필 이미지 업로드 API Route
 *
 * POST /api/profile/avatar
 * 모바일 앱에서 사용할 프로필 이미지 업로드 엔드포인트
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { uploadAvatar } from "@/actions/profile";

/**
 * POST /api/profile/avatar
 * 프로필 이미지 업로드
 * FormData: { image: File }
 */
export async function POST(request: Request) {
  try {
    console.group("POST /api/profile/avatar");
    const { userId } = await auth();

    if (!userId) {
      console.error("Unauthorized");
      console.groupEnd();
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      console.error("No image provided");
      console.groupEnd();
      return NextResponse.json(
        { error: "이미지를 선택해주세요." },
        { status: 400 },
      );
    }

    // 이미지 크기 검증 (5MB)
    if (image.size > 5 * 1024 * 1024) {
      console.error("Image too large:", image.size);
      console.groupEnd();
      return NextResponse.json(
        { error: "이미지 크기는 5MB 이하여야 합니다." },
        { status: 400 },
      );
    }

    // 이미지 타입 검증
    if (!image.type.startsWith("image/")) {
      console.error("Invalid image type:", image.type);
      console.groupEnd();
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다." },
        { status: 400 },
      );
    }

    // 업로드용 FormData 생성
    const uploadFormData = new FormData();
    uploadFormData.append("image", image);

    console.log("Uploading avatar:", {
      filename: image.name,
      size: image.size,
      type: image.type,
    });

    const result = await uploadAvatar(uploadFormData);

    if (result.error) {
      console.error("Avatar upload failed:", result.error);
      console.groupEnd();
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log("Avatar uploaded successfully");
    console.groupEnd();
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error("POST /api/profile/avatar error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "프로필 이미지 업로드에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
