"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { uploadFile } from "./storage";
import type { Profile } from "@/types/sns";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

/**
 * 현재 사용자의 user_id를 가져오는 헬퍼 함수
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const supabase = getServiceRoleClient();
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    return data?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * 프로필 정보 조회
 */
export async function getProfile(
  targetClerkId: string,
): Promise<{ data: Profile | null; error: string | null }> {
  try {
    console.group("getProfile");
    console.log("Target clerk ID:", targetClerkId);

    const { userId: currentClerkId } = await auth();
    const isOwnProfile = currentClerkId === targetClerkId;

    const supabase = getServiceRoleClient();

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", targetClerkId)
      .single();

    if (userError || !user) {
      console.error("User not found:", userError);
      return { data: null, error: "사용자를 찾을 수 없습니다." };
    }

    // user_stats 뷰에서 통계 가져오기
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // 팔로우 상태 확인
    let isFollowing = false;
    if (currentClerkId && !isOwnProfile) {
      const currentUserId = await getCurrentUserId();
      if (currentUserId) {
        const { data: follow } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", user.id)
          .single();

        isFollowing = !!follow;
      }
    }

    const profile: Profile = {
      ...user,
      posts_count: stats?.posts_count || 0,
      followers_count: stats?.followers_count || 0,
      following_count: stats?.following_count || 0,
      is_following: isFollowing,
      is_own_profile: isOwnProfile,
    };

    console.log("Profile fetched successfully");
    console.groupEnd();
    return { data: profile, error: null };
  } catch (error) {
    console.error("getProfile error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "프로필 조회에 실패했습니다.",
    };
  }
}

/**
 * 프로필 이미지 업로드
 */
export async function uploadAvatar(formData: FormData) {
  try {
    console.group("uploadAvatar");

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { error: "로그인이 필요합니다." };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "사용자 정보를 찾을 수 없습니다." };
    }

    const image = formData.get("image") as File;
    if (!image) {
      return { error: "이미지를 선택해주세요." };
    }

    // 이미지 크기 검증 (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return { error: "이미지 크기는 5MB 이하여야 합니다." };
    }

    // 기존 아바타 삭제
    const supabase = getServiceRoleClient();
    const { data: user } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (user?.avatar_url) {
      const pathMatch = user.avatar_url.match(
        /\/storage\/v1\/object\/public\/uploads\/(.+)/,
      );
      if (pathMatch) {
        const filePath = pathMatch[1];
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      }
    }

    // 새 이미지 업로드
    const uploadFormData = new FormData();
    uploadFormData.append("file", image);
    uploadFormData.append("bucketName", STORAGE_BUCKET);

    const uploadResult = await uploadFile(uploadFormData);
    if (uploadResult.error || !uploadResult.path) {
      return { error: uploadResult.error || "이미지 업로드에 실패했습니다." };
    }

    // Supabase Storage URL 생성
    const { data: urlData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(uploadResult.path);

    // 사용자 정보 업데이트
    const { error } = await supabase
      .from("users")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", userId);

    if (error) {
      console.error("Error updating avatar:", error);
      return { error: error.message };
    }

    console.log("Avatar uploaded successfully");
    console.groupEnd();
    return { data: { avatar_url: urlData.publicUrl } };
  } catch (error) {
    console.error("uploadAvatar error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "프로필 이미지 업로드에 실패했습니다.",
    };
  }
}
