"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { CommentWithUser } from "@/types/sns";

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
 * 피드백 작성 (댓글)
 */
export async function createFeedback(postId: string, content: string) {
  try {
    console.group("createFeedback");
    console.log("Post ID:", postId, "Content:", content);

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

    if (!content || content.trim().length === 0) {
      return { error: "피드백 내용을 입력해주세요." };
    }

    if (content.length > 1000) {
      return { error: "피드백은 1,000자 이하여야 합니다." };
    }

    const supabase = getServiceRoleClient();

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
      })
      .select(
        `
        *,
        users!inner (
          id,
          clerk_id,
          name,
          avatar_url,
          created_at
        )
      `,
      )
      .single();

    if (error) {
      console.error("Error creating feedback:", error);
      return { error: error.message };
    }

    const feedback: CommentWithUser = {
      ...comment,
      user: Array.isArray(comment.users) ? comment.users[0] : comment.users,
    };

    console.log("Feedback created successfully:", feedback.id);
    console.groupEnd();
    return { data: feedback };
  } catch (error) {
    console.error("createFeedback error:", error);
    return {
      error:
        error instanceof Error ? error.message : "피드백 작성에 실패했습니다.",
    };
  }
}

/**
 * 게시물의 피드백 목록 조회
 */
export async function getFeedbacks(postId: string, limit: number = 10) {
  try {
    console.group("getFeedbacks");
    console.log("Post ID:", postId);

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        users!inner (
          id,
          clerk_id,
          name,
          avatar_url,
          created_at
        )
      `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching feedbacks:", error);
      return { data: [] };
    }

    const feedbacks: CommentWithUser[] = (data || []).map((c) => ({
      ...c,
      user: Array.isArray(c.users) ? c.users[0] : c.users,
    }));

    console.log(`Fetched ${feedbacks.length} feedbacks`);
    console.groupEnd();
    return { data: feedbacks };
  } catch (error) {
    console.error("getFeedbacks error:", error);
    return { data: [] };
  }
}

/**
 * 피드백 삭제
 */
export async function deleteFeedback(feedbackId: string) {
  try {
    console.group("deleteFeedback");
    console.log("Feedback ID:", feedbackId);

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { error: "로그인이 필요합니다." };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "사용자 정보를 찾을 수 없습니다." };
    }

    const supabase = getServiceRoleClient();

    // 피드백 소유자 확인
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", feedbackId)
      .single();

    if (!comment) {
      return { error: "피드백을 찾을 수 없습니다." };
    }

    if (comment.user_id !== userId) {
      return { error: "권한이 없습니다." };
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", feedbackId);

    if (error) {
      console.error("Error deleting feedback:", error);
      return { error: error.message };
    }

    console.log("Feedback deleted successfully");
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error("deleteFeedback error:", error);
    return {
      error:
        error instanceof Error ? error.message : "피드백 삭제에 실패했습니다.",
    };
  }
}
