/**
 * @file page.tsx
 * @description 프로필 페이지
 *
 * 사용자 프로필 정보 및 게시물 그리드 표시
 */

import { Suspense } from "react";
import { getProfile } from "@/actions/profile";
import { getPostsByUserId } from "@/actions/post";
import { ProfilePageWrapper } from "@/components/profile/ProfilePageWrapper";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { PostWithUser } from "@/types/sns";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId: clerkId } = await params;

  console.group("ProfilePage");
  console.log("Loading profile for clerk ID:", clerkId);

  const profileResult = await getProfile(clerkId);
  if (profileResult.error || !profileResult.data) {
    console.error("Profile load failed:", {
      error: profileResult.error,
      clerk_id: clerkId,
    });
    console.groupEnd();
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-[#262626]">
            프로필을 불러올 수 없습니다
          </p>
          <p className="text-sm text-[#8e8e8e]">
            {profileResult.error || "사용자를 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  const profile = profileResult.data;
  console.log("Profile loaded successfully:", {
    user_id: profile.id,
    name: profile.name,
    posts_count: profile.posts_count,
  });

  const postsResult = await getPostsByUserId(profile.id);
  if (postsResult.error) {
    console.warn("Posts load failed, using empty array:", postsResult.error);
  }
  console.log("Posts loaded:", {
    count: postsResult.data.length,
    has_error: !!postsResult.error,
  });

  // postsWithUser 생성 (PostGrid에서 사용)
  const supabase = getServiceRoleClient();
  const postsWithUser: PostWithUser[] = await Promise.all(
    postsResult.data.map(async (post) => {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", post.user_id)
        .single();

      if (userError) {
        console.warn(`User not found for post ${post.id}:`, userError);
      }

      const { data: postStats, error: statsError } = await supabase
        .from("post_stats")
        .select("*")
        .eq("post_id", post.id)
        .single();

      if (statsError && statsError.code !== "PGRST116") {
        // PGRST116은 데이터가 없을 때 발생하는 에러 (정상)
        console.warn(`Post stats error for post ${post.id}:`, statsError);
      }

      return {
        ...post,
        user: user || {
          id: "",
          clerk_id: "",
          name: "Unknown",
          fullname: null,
          bio: null,
          avatar_url: null,
          created_at: "",
        },
        likes_count: postStats?.likes_count ?? 0,
        comments_count: postStats?.comments_count ?? 0,
        is_liked: false,
      };
    }),
  );

  console.log("PostsWithUser created:", {
    count: postsWithUser.length,
  });
  console.log("Profile page ready to render");
  console.groupEnd();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfilePageWrapper
          profile={profile}
          posts={postsResult.data}
          postsWithUser={postsWithUser}
        />
      </Suspense>
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="bg-white border-b border-[#dbdbdb]">
      <div className="max-w-[935px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="flex items-center gap-6">
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#dbdbdb]">
        <div className="max-w-[935px] mx-auto flex items-center justify-center">
          <div className="h-12 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="max-w-[935px] mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
