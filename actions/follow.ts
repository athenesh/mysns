"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

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
 * 팔로우/언팔로우 토글
 */
export async function toggleFollow(targetUserId: string) {
  try {
    console.group("toggleFollow");
    console.log("Target user ID:", targetUserId);

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      console.error("Unauthorized");
      return { error: "로그인이 필요합니다." };
    }

    const followerId = await getCurrentUserId();
    if (!followerId) {
      console.error("User not found");
      return { error: "사용자 정보를 찾을 수 없습니다." };
    }

    if (followerId === targetUserId) {
      return { error: "자기 자신을 팔로우할 수 없습니다." };
    }

    const supabase = getServiceRoleClient();

    // 기존 팔로우 확인
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", targetUserId)
      .single();

    if (existingFollow) {
      // 언팔로우
      console.log("Unfollowing");
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("id", existingFollow.id);

      if (error) {
        console.error("Error unfollowing:", error);
        return { error: error.message };
      }

      console.log("Unfollowed successfully");
      console.groupEnd();
      return { data: { is_following: false } };
    } else {
      // 팔로우
      console.log("Following");
      const { data: follow, error } = await supabase
        .from("follows")
        .insert({
          follower_id: followerId,
          following_id: targetUserId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error following:", error);
        return { error: error.message };
      }

      console.log("Followed successfully");
      console.groupEnd();
      return { data: { is_following: true, follow } };
    }
  } catch (error) {
    console.error("toggleFollow error:", error);
    return {
      error:
        error instanceof Error ? error.message : "팔로우 처리에 실패했습니다.",
    };
  }
}

/**
 * 팔로우 상태 확인
 */
export async function checkFollowStatus(targetUserId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { data: { is_following: false } };
    }

    const followerId = await getCurrentUserId();
    if (!followerId || followerId === targetUserId) {
      return { data: { is_following: false } };
    }

    const supabase = getServiceRoleClient();

    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", targetUserId)
      .single();

    return { data: { is_following: !!data } };
  } catch (error) {
    return { data: { is_following: false } };
  }
}
