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
 * 피드백 작성 (댓글 또는 대댓글)
 * @param postId 게시물 ID
 * @param content 피드백 내용
 * @param parentId 대댓글인 경우 부모 댓글 ID (선택)
 */
export async function createFeedback(
  postId: string,
  content: string,
  parentId?: string | null,
) {
  try {
    console.group("createFeedback");
    console.log(
      "Post ID:",
      postId,
      "Content:",
      content,
      "Parent ID:",
      parentId,
    );

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

    // 대댓글인 경우 부모 댓글 존재 여부 확인
    if (parentId) {
      const { data: parentComment } = await supabase
        .from("comments")
        .select("id, post_id")
        .eq("id", parentId)
        .single();

      if (!parentComment) {
        return { error: "부모 댓글을 찾을 수 없습니다." };
      }

      // 부모 댓글이 같은 게시물에 속하는지 확인
      if (parentComment.post_id !== postId) {
        return { error: "잘못된 요청입니다." };
      }
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        parent_comment_id: parentId || null,
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
      replies: [],
      replies_count: 0,
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
 * 게시물의 피드백 목록 조회 (대댓글 포함, 계층 구조)
 * @param postId 게시물 ID
 * @param limit 최대 조회 개수 (최상위 댓글만)
 */
export async function getFeedbacks(postId: string, limit: number = 10) {
  try {
    console.group("getFeedbacks");
    console.log("Post ID:", postId, "Limit:", limit);

    const supabase = getServiceRoleClient();

    // 최상위 댓글만 조회 (parent_comment_id가 null인 것들)
    const { data: topLevelComments, error } = await supabase
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
      .is("parent_comment_id", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching top-level feedbacks:", error);
      return { data: [] };
    }

    if (!topLevelComments || topLevelComments.length === 0) {
      console.log("No top-level feedbacks found");
      console.groupEnd();
      return { data: [] };
    }

    // 각 최상위 댓글의 대댓글 조회
    const topLevelCommentIds = topLevelComments.map((c) => c.id);

    const { data: replies, error: repliesError } = await supabase
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
      .in("parent_comment_id", topLevelCommentIds)
      .order("created_at", { ascending: true });

    if (repliesError) {
      console.error("Error fetching replies:", repliesError);
      // 대댓글 조회 실패해도 최상위 댓글은 반환
    }

    // 대댓글을 부모 댓글별로 그룹화
    const repliesByParent = new Map<string, CommentWithUser[]>();
    if (replies) {
      replies.forEach((reply) => {
        const parentId = reply.parent_comment_id as string;
        if (!repliesByParent.has(parentId)) {
          repliesByParent.set(parentId, []);
        }
        repliesByParent.get(parentId)!.push({
          ...reply,
          user: Array.isArray(reply.users) ? reply.users[0] : reply.users,
          replies: [],
          replies_count: 0,
        });
      });
    }

    // 최상위 댓글에 대댓글 연결
    const feedbacks: CommentWithUser[] = topLevelComments.map((c) => {
      const commentReplies = repliesByParent.get(c.id) || [];
      return {
        ...c,
        user: Array.isArray(c.users) ? c.users[0] : c.users,
        replies: commentReplies,
        replies_count: commentReplies.length,
      };
    });

    console.log(
      `Fetched ${feedbacks.length} top-level feedbacks with ${
        replies?.length || 0
      } replies`,
    );
    console.groupEnd();
    return { data: feedbacks };
  } catch (error) {
    console.error("getFeedbacks error:", error);
    return { data: [] };
  }
}

/**
 * 피드백 수정
 */
export async function updateFeedback(feedbackId: string, content: string) {
  try {
    console.group("updateFeedback");
    console.log("Feedback ID:", feedbackId, "Content:", content);

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

    // 내용 검증
    if (!content || content.trim().length === 0) {
      return { error: "피드백 내용을 입력해주세요." };
    }

    if (content.length > 1000) {
      return { error: "피드백은 1,000자 이하여야 합니다." };
    }

    // 업데이트 실행
    const { data: updatedComment, error } = await supabase
      .from("comments")
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedbackId)
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
      console.error("Error updating feedback:", error);
      return { error: error.message };
    }

    const feedback: CommentWithUser = {
      ...updatedComment,
      user: Array.isArray(updatedComment.users)
        ? updatedComment.users[0]
        : updatedComment.users,
    };

    console.log("Feedback updated successfully:", feedback.id);
    console.groupEnd();
    return { data: feedback };
  } catch (error) {
    console.error("updateFeedback error:", error);
    return {
      error:
        error instanceof Error ? error.message : "피드백 수정에 실패했습니다.",
    };
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
