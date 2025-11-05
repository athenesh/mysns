"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  Post,
  PostWithUser,
  PaginatedResponse,
  ApiResponse,
} from "@/types/sns";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";
const POSTS_PER_PAGE = 10;

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
 * 게시물 생성
 * @param imageUrl - 클라이언트에서 업로드된 이미지의 Public URL
 * @param caption - 게시물 캡션 (선택사항)
 */
export async function createPost({
  imageUrl,
  caption,
}: {
  imageUrl: string;
  caption?: string;
}) {
  try {
    console.group("createPost");

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      console.error("Unauthorized");
      return { error: "로그인이 필요합니다." };
    }

    // 현재 사용자 ID 가져오기
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error("User not found in database");
      return { error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 이미지 URL 검증
    if (!imageUrl) {
      return { error: "이미지 URL이 필요합니다." };
    }

    // 캡션 길이 검증 (2,200자)
    if (caption && caption.length > 2200) {
      return { error: "캡션은 2,200자 이하여야 합니다." };
    }

    console.log("Creating post with image URL:", imageUrl);

    // 게시물 생성
    const supabase = getServiceRoleClient();
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        caption: caption || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Post creation error:", error);
      return { error: error.message };
    }

    console.log("Post created successfully:", post.id);
    console.groupEnd();
    return { data: post };
  } catch (error) {
    console.error("createPost error:", error);
    return {
      error:
        error instanceof Error ? error.message : "게시물 생성에 실패했습니다.",
    };
  }
}

/**
 * 게시물 목록 조회 (페이지네이션)
 */
export async function getPosts(
  cursor?: string,
  limit: number = POSTS_PER_PAGE,
): Promise<PaginatedResponse<PostWithUser>> {
  try {
    console.group("getPosts");
    console.log("Fetching posts, cursor:", cursor, "limit:", limit);

    const supabase = getServiceRoleClient();
    const { userId: clerkId } = await auth();
    let currentUserId: string | null = null;

    if (clerkId) {
      currentUserId = await getCurrentUserId();
    }

    // post_stats 뷰를 사용하여 통계 포함
    let query = supabase
      .from("post_stats")
      .select(
        `
        post_id,
        user_id,
        image_url,
        caption,
        created_at,
        likes_count,
        comments_count,
        users!inner (
          id,
          clerk_id,
          name,
          avatar_url,
          created_at
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return { data: [], next_cursor: null, has_more: false };
    }

    // 현재 사용자의 응원하기 상태 확인
    const postIds = data?.map((p) => p.post_id) || [];
    let likedPostIds: Set<string> = new Set();

    if (currentUserId && postIds.length > 0) {
      const { data: likes } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", currentUserId)
        .in("post_id", postIds);

      likedPostIds = new Set(likes?.map((l) => l.post_id) || []);
    }

    const posts: PostWithUser[] = (data || []).slice(0, limit).map((p) => ({
      id: p.post_id,
      user_id: p.user_id,
      image_url: p.image_url,
      caption: p.caption,
      created_at: p.created_at,
      updated_at: p.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
      user: Array.isArray(p.users) ? p.users[0] : p.users,
      likes_count: p.likes_count || 0,
      comments_count: p.comments_count || 0,
      is_liked: likedPostIds.has(p.post_id),
    }));

    const hasMore = (data || []).length > limit;
    const nextCursor = hasMore ? posts[posts.length - 1]?.created_at : null;

    console.log(`Fetched ${posts.length} posts, has_more: ${hasMore}`);
    console.groupEnd();
    return {
      data: posts,
      next_cursor: nextCursor || null,
      has_more: hasMore,
    };
  } catch (error) {
    console.error("getPosts error:", error);
    return { data: [], next_cursor: null, has_more: false };
  }
}

/**
 * 특정 사용자의 게시물 조회
 */
export async function getPostsByUserId(
  targetUserId: string,
  cursor?: string,
  limit: number = POSTS_PER_PAGE,
): Promise<PaginatedResponse<Post>> {
  try {
    console.group("getPostsByUserId");
    console.log("Fetching posts for user:", targetUserId);

    const supabase = getServiceRoleClient();

    let query = supabase
      .from("posts")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user posts:", error);
      return { data: [], next_cursor: null, has_more: false };
    }

    const posts = (data || []).slice(0, limit);
    const hasMore = (data || []).length > limit;
    const nextCursor = hasMore ? posts[posts.length - 1]?.created_at : null;

    console.log(`Fetched ${posts.length} posts for user`);
    console.groupEnd();
    return {
      data: posts,
      next_cursor: nextCursor || null,
      has_more: hasMore,
    };
  } catch (error) {
    console.error("getPostsByUserId error:", error);
    return { data: [], next_cursor: null, has_more: false };
  }
}

/**
 * 단일 게시물 조회 (ID로)
 */
export async function getPostById(
  postId: string,
): Promise<ApiResponse<PostWithUser>> {
  try {
    console.group("getPostById");
    console.log("Fetching post by ID:", postId);

    const supabase = getServiceRoleClient();
    const { userId: clerkId } = await auth();
    let currentUserId: string | null = null;

    if (clerkId) {
      currentUserId = await getCurrentUserId();
    }

    // post_stats 뷰를 사용하여 통계 포함
    const { data, error } = await supabase
      .from("post_stats")
      .select(
        `
        post_id,
        user_id,
        image_url,
        caption,
        created_at,
        likes_count,
        comments_count,
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
      .single();

    if (error || !data) {
      console.error("Error fetching post:", error);
      console.groupEnd();
      return { data: null, error: "게시물을 찾을 수 없습니다." };
    }

    // 현재 사용자의 응원하기 상태 확인
    let isLiked = false;
    if (currentUserId) {
      const { data: like } = await supabase
        .from("likes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", currentUserId)
        .single();

      isLiked = !!like;
    }

    // posts 테이블에서 updated_at 가져오기
    const { data: postData } = await supabase
      .from("posts")
      .select("updated_at")
      .eq("id", postId)
      .single();

    const post: PostWithUser = {
      id: data.post_id,
      user_id: data.user_id,
      image_url: data.image_url,
      caption: data.caption,
      created_at: data.created_at,
      updated_at: postData?.updated_at || data.created_at,
      user: Array.isArray(data.users) ? data.users[0] : data.users,
      likes_count: data.likes_count || 0,
      comments_count: data.comments_count || 0,
      is_liked: isLiked,
    };

    console.log("Post fetched successfully:", post.id);
    console.groupEnd();
    return { data: post, error: null };
  } catch (error) {
    console.error("getPostById error:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "게시물 조회에 실패했습니다.",
    };
  }
}

/**
 * 게시물 삭제
 */
export async function deletePost(postId: string) {
  try {
    console.group("deletePost");

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { error: "로그인이 필요합니다." };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "사용자 정보를 찾을 수 없습니다." };
    }

    const supabase = getServiceRoleClient();

    // 게시물 소유자 확인
    const { data: post } = await supabase
      .from("posts")
      .select("user_id, image_url")
      .eq("id", postId)
      .single();

    if (!post) {
      return { error: "게시물을 찾을 수 없습니다." };
    }

    if (post.user_id !== userId) {
      return { error: "권한이 없습니다." };
    }

    // 이미지 삭제 (Storage)
    if (post.image_url) {
      // URL에서 경로 추출
      const pathMatch = post.image_url.match(
        /\/storage\/v1\/object\/public\/uploads\/(.+)/,
      );
      if (pathMatch) {
        const filePath = pathMatch[1];
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      }
    }

    // 게시물 삭제 (CASCADE로 좋아요, 댓글도 자동 삭제)
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.error("Delete post error:", error);
      return { error: error.message };
    }

    console.log("Post deleted successfully");
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error("deletePost error:", error);
    return {
      error:
        error instanceof Error ? error.message : "게시물 삭제에 실패했습니다.",
    };
  }
}
