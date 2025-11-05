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
 * 프로필 정보 조회 공통 로직
 * Server Actions와 API Routes에서 공통으로 사용
 * @param targetClerkId - 조회할 사용자의 Clerk ID
 * @param currentClerkId - 현재 로그인한 사용자의 Clerk ID (옵션, 팔로우 상태 확인용)
 */
export async function getProfileData(
  targetClerkId: string,
  currentClerkId?: string | null,
): Promise<{ data: Profile | null; error: string | null }> {
  try {
    const isOwnProfile = currentClerkId === targetClerkId;

    const supabase = getServiceRoleClient();

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", targetClerkId)
      .single();

    if (userError || !user) {
      console.error("User not found:", {
        error: userError,
        error_code: userError?.code,
        error_message: userError?.message,
        target_clerk_id: targetClerkId,
      });
      return { data: null, error: "사용자를 찾을 수 없습니다." };
    }

    console.log("User found:", {
      user_id: user.id,
      clerk_id: user.clerk_id,
      name: user.name,
      fullname: user.fullname,
      bio: user.bio ? "exists" : "null",
      avatar_url: user.avatar_url ? "exists" : "null",
      created_at: user.created_at,
    });

    // user_stats 뷰에서 통계 가져오기
    const { data: stats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (statsError) {
      console.warn("user_stats 조회 실패, 기본값 사용:", statsError);
      console.log("Stats error code:", statsError.code);
      console.log("Stats error message:", statsError.message);
    }

    // 통계 데이터 기본값 처리 (null 또는 undefined일 경우 0으로 설정)
    const postsCount = stats?.posts_count ?? 0;
    const followersCount = stats?.followers_count ?? 0;
    const followingCount = stats?.following_count ?? 0;

    console.log("User stats:", {
      user_id: user.id,
      posts_count: postsCount,
      followers_count: followersCount,
      following_count: followingCount,
      stats_exists: !!stats,
    });

    // 팔로우 상태 확인
    let isFollowing = false;
    if (currentClerkId && !isOwnProfile) {
      // currentClerkId로부터 user_id 조회
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentClerkId)
        .single();

      if (currentUser?.id) {
        const { data: follow, error: followError } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", user.id)
          .single();

        isFollowing = !!follow;
        if (followError && followError.code !== "PGRST116") {
          // PGRST116은 데이터가 없을 때 발생하는 에러 (정상)
          console.warn("Follow status check error:", followError);
        }
        console.log("Follow status:", {
          current_user_id: currentUser.id,
          target_user_id: user.id,
          is_following: isFollowing,
        });
      }
    }

    const profile: Profile = {
      ...user,
      posts_count: postsCount,
      followers_count: followersCount,
      following_count: followingCount,
      is_following: isFollowing,
      is_own_profile: isOwnProfile,
    };

    console.log("Profile fetched successfully:", {
      user_id: profile.id,
      name: profile.name,
      avatar_url: profile.avatar_url ? "exists" : "null",
      posts_count: profile.posts_count,
      followers_count: profile.followers_count,
      following_count: profile.following_count,
      is_own_profile: profile.is_own_profile,
    });

    return { data: profile, error: null };
  } catch (error) {
    console.error("getProfileData error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "프로필 조회에 실패했습니다.",
    };
  }
}

/**
 * 프로필 정보 조회 (Server Action)
 */
export async function getProfile(
  targetClerkId: string,
): Promise<{ data: Profile | null; error: string | null }> {
  try {
    console.group("getProfile");
    console.log("Target clerk ID:", targetClerkId);

    const { userId: currentClerkId } = await auth();

    console.log("Auth status:", {
      current_clerk_id: currentClerkId || "not authenticated",
      target_clerk_id: targetClerkId,
      is_own_profile: currentClerkId === targetClerkId,
    });

    const result = await getProfileData(targetClerkId, currentClerkId);

    console.groupEnd();
    return result;
  } catch (error) {
    console.error("getProfile error:", error);
    console.groupEnd();
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "프로필 조회에 실패했습니다.",
    };
  }
}

/**
 * 프로필 정보 수정
 */
export async function updateProfile({
  fullname,
  bio,
}: {
  fullname?: string | null;
  bio?: string | null;
}): Promise<{ data: Profile | null; error: string | null }> {
  try {
    console.group("updateProfile");
    console.log("Updating profile:", { fullname, bio });

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      console.error("Not authenticated");
      console.groupEnd();
      return { data: null, error: "로그인이 필요합니다." };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      console.error("User ID not found");
      console.groupEnd();
      return { data: null, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const supabase = getServiceRoleClient();

    // 업데이트할 데이터 준비 (undefined인 필드는 제외)
    const updateData: { fullname?: string | null; bio?: string | null } = {};
    if (fullname !== undefined) {
      updateData.fullname = fullname || null;
    }
    if (bio !== undefined) {
      updateData.bio = bio || null;
    }

    // 업데이트할 데이터가 없으면 에러 반환
    if (Object.keys(updateData).length === 0) {
      console.warn("No data to update");
      console.groupEnd();
      return { data: null, error: "수정할 정보가 없습니다." };
    }

    console.log("Update data:", updateData);

    // 사용자 정보 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (updateError || !updatedUser) {
      console.error("Update error:", updateError);
      console.groupEnd();
      return {
        data: null,
        error: updateError?.message || "프로필 수정에 실패했습니다.",
      };
    }

    console.log("Profile updated successfully:", {
      user_id: updatedUser.id,
      fullname: updatedUser.fullname,
      bio: updatedUser.bio ? "exists" : "null",
    });

    // 업데이트된 프로필 정보 조회 (통계 포함)
    const profileResult = await getProfileData(clerkId, clerkId);

    if (profileResult.error || !profileResult.data) {
      console.warn(
        "Profile fetch failed after update:",
        profileResult.error || "Unknown error",
      );
      console.groupEnd();
      // 업데이트는 성공했지만 프로필 조회 실패 시 업데이트된 사용자 정보만 반환
      const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      const profile: Profile = {
        ...updatedUser,
        posts_count: stats?.posts_count ?? 0,
        followers_count: stats?.followers_count ?? 0,
        following_count: stats?.following_count ?? 0,
        is_following: false,
        is_own_profile: true,
      };

      console.groupEnd();
      return { data: profile, error: null };
    }

    console.groupEnd();
    return { data: profileResult.data, error: null };
  } catch (error) {
    console.error("updateProfile error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "프로필 수정에 실패했습니다.",
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
