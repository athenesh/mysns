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
 * 응원하기 토글 (좋아요/좋아요 취소)
 */
export async function toggleCheer(postId: string) {
  try {
    console.group("toggleCheer");
    console.log("Post ID:", postId);

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      console.error("Unauthorized");
      return { error: "로그인이 필요합니다." };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      console.error("User not found");
      return { error: "사용자 정보를 찾을 수 없습니다." };
    }

    const supabase = getServiceRoleClient();

    // 기존 응원하기 확인
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existingLike) {
      // 응원하기 취소
      console.log("Removing cheer");
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) {
        console.error("Error removing cheer:", error);
        return { error: error.message };
      }

      console.log("Cheer removed successfully");
      console.groupEnd();
      return { data: { is_cheered: false } };
    } else {
      // 응원하기 추가
      console.log("Adding cheer");
      const { data: like, error } = await supabase
        .from("likes")
        .insert({
          post_id: postId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding cheer:", error);
        return { error: error.message };
      }

      console.log("Cheer added successfully");
      console.groupEnd();
      return { data: { is_cheered: true, like } };
    }
  } catch (error) {
    console.error("toggleCheer error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "응원하기 처리에 실패했습니다.",
    };
  }
}

/**
 * 게시물의 응원 수 조회
 */
export async function getCheerCount(postId: string) {
  try {
    const supabase = getServiceRoleClient();
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      return { error: error.message };
    }

    return { data: { count: count || 0 } };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "응원 수 조회에 실패했습니다.",
    };
  }
}
