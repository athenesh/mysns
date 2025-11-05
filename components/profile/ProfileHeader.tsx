/**
 * @file ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * 프로필 이미지, 사용자명, 통계, 팔로우 버튼 포함
 * 팔로우/언팔로우 후 팔로워 수 실시간 업데이트 지원
 */

"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "./FollowButton";
import { AvatarUpload } from "./AvatarUpload";
import { ProfileTabs } from "./ProfileTabs";
import type { Profile } from "@/types/sns";
import { Button } from "@/components/ui/button";

export type TabType = "posts" | "reels" | "tagged";

interface ProfileHeaderProps {
  profile: Profile;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ProfileHeader({
  profile,
  activeTab,
  onTabChange,
}: ProfileHeaderProps) {
  // 팔로워 수 상태 관리 (Optimistic update)
  const [followersCount, setFollowersCount] = useState(
    profile.followers_count ?? 0
  );

  // profile이 변경되면 팔로워 수 동기화
  useEffect(() => {
    setFollowersCount(profile.followers_count ?? 0);
  }, [profile.followers_count]);

  // 데이터 검증 로그 (개발 모드)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.group("ProfileHeader");
      console.log("Profile data:", {
        user_id: profile.id,
        name: profile.name || "MISSING",
        avatar_url: profile.avatar_url || "MISSING",
        posts_count: profile.posts_count ?? "MISSING",
        followers_count: followersCount,
        following_count: profile.following_count ?? "MISSING",
        fullname: profile.fullname || "null",
        bio: profile.bio || "null",
        is_own_profile: profile.is_own_profile,
      });
      console.groupEnd();
    }
  }, [profile, followersCount]);

  // 팔로우/언팔로우 성공 시 콜백
  const handleFollowChange = (isFollowing: boolean) => {
    if (process.env.NODE_ENV === "development") {
      console.log("ProfileHeader - Follow change:", {
        isFollowing,
        previousCount: followersCount,
      });
    }

    // Optimistic update: 팔로우 시 +1, 언팔로우 시 -1
    setFollowersCount((prev) => (isFollowing ? prev + 1 : Math.max(0, prev - 1)));
  };

  // 데이터 fallback 처리
  const displayName = profile.name || "사용자";
  const postsCount = profile.posts_count ?? 0;
  const followingCount = profile.following_count ?? 0;

  return (
    <div className="bg-white border-b border-[#dbdbdb]">
      <div className="max-w-[935px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* 프로필 이미지 */}
          <div className="relative">
            <Avatar
              src={profile.avatar_url}
              alt={displayName}
              size={150}
              className="md:w-[150px] md:h-[150px] w-[90px] h-[90px]"
            />
            {profile.is_own_profile && <AvatarUpload />}
          </div>

          {/* 프로필 정보 */}
          <div className="flex-1 space-y-4">
            {/* 사용자명 및 팔로우 버튼 */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-light">{displayName}</h1>
              {profile.is_own_profile ? (
                <Button variant="outline" size="sm">
                  프로필 편집
                </Button>
              ) : (
                <FollowButton
                  targetUserId={profile.id}
                  initialIsFollowing={profile.is_following}
                  onFollowChange={handleFollowChange}
                />
              )}
            </div>

            {/* 통계 */}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-semibold">{postsCount}</span>
                <span className="text-[#8e8e8e] ml-1">게시물</span>
              </div>
              <div>
                <span className="font-semibold">{followersCount}</span>
                <span className="text-[#8e8e8e] ml-1">팔로워</span>
              </div>
              <div>
                <span className="font-semibold">{followingCount}</span>
                <span className="text-[#8e8e8e] ml-1">팔로잉</span>
              </div>
            </div>

            {/* Fullname 및 Bio */}
            {(profile.fullname || profile.bio) && (
              <div className="space-y-1">
                {profile.fullname && (
                  <p className="font-semibold text-sm">{profile.fullname}</p>
                )}
                {profile.bio && (
                  <p className="text-sm text-[#262626] whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        postsCount={profile.posts_count}
      />
    </div>
  );
}
