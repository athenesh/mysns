/**
 * @file ProfilePageWrapper.tsx
 * @description 프로필 페이지 클라이언트 래퍼 컴포넌트
 *
 * 탭 상태 관리를 위한 클라이언트 컴포넌트
 */

"use client";

import { useState } from "react";
import { ProfileHeader, type TabType } from "./ProfileHeader";
import { PostGrid } from "./PostGrid";
import type { Profile, Post, PostWithUser } from "@/types/sns";

interface ProfilePageWrapperProps {
  profile: Profile;
  posts: Post[];
  postsWithUser: PostWithUser[];
}

export function ProfilePageWrapper({
  profile,
  posts,
  postsWithUser,
}: ProfilePageWrapperProps) {
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  // 현재는 게시물 탭만 지원
  const displayPosts = activeTab === "posts" ? posts : [];
  const displayPostsWithUser =
    activeTab === "posts" ? postsWithUser : [];

  return (
    <>
      <ProfileHeader
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="max-w-[935px] mx-auto px-4 py-8">
        {activeTab === "posts" ? (
          <PostGrid posts={displayPosts} postsWithUser={displayPostsWithUser} />
        ) : (
          <div className="text-center py-16 text-[#8e8e8e]">
            <p className="text-lg mb-2">향후 구현 예정입니다</p>
          </div>
        )}
      </div>
    </>
  );
}

