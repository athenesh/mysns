/**
 * @file page.tsx
 * @description 프로필 페이지
 *
 * 사용자 프로필 정보 및 게시물 그리드 표시
 */

import { Suspense } from "react";
import { getProfile } from "@/actions/profile";
import { getPostsByUserId } from "@/actions/post";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { PostWithUser } from "@/types/sns";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId: clerkId } = await params;

  const profileResult = await getProfile(clerkId);
  if (profileResult.error || !profileResult.data) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#8e8e8e]">
            {profileResult.error || "프로필을 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  const profile = profileResult.data;
  const postsResult = await getPostsByUserId(profile.id);

  // postsWithUser 생성 (PostGrid에서 사용)
  const supabase = getServiceRoleClient();
  const postsWithUser: PostWithUser[] = await Promise.all(
    postsResult.data.map(async (post) => {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", post.user_id)
        .single();

      const { data: postStats } = await supabase
        .from("post_stats")
        .select("*")
        .eq("post_id", post.id)
        .single();

      return {
        ...post,
        user: user || {
          id: "",
          clerk_id: "",
          name: "Unknown",
          avatar_url: null,
          created_at: "",
        },
        likes_count: postStats?.likes_count || 0,
        comments_count: postStats?.comments_count || 0,
        is_liked: false,
      };
    }),
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <ProfileHeader profile={profile} />
      <div className="max-w-[935px] mx-auto px-4 py-8">
        <Suspense fallback={<PostGridSkeleton />}>
          <PostGrid posts={postsResult.data} postsWithUser={postsWithUser} />
        </Suspense>
      </div>
    </div>
  );
}

function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
      ))}
    </div>
  );
}
