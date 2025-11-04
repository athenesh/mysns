/**
 * @file ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * 프로필 이미지, 사용자명, 통계, 팔로우 버튼 포함
 */

"use client";

import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "./FollowButton";
import { AvatarUpload } from "./AvatarUpload";
import type { Profile } from "@/types/sns";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-white border-b border-[#dbdbdb]">
      <div className="max-w-[935px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* 프로필 이미지 */}
          <div className="relative">
            <Avatar
              src={profile.avatar_url}
              alt={profile.name}
              size={150}
              className="md:w-[150px] md:h-[150px] w-[90px] h-[90px]"
            />
            {profile.is_own_profile && <AvatarUpload />}
          </div>

          {/* 프로필 정보 */}
          <div className="flex-1 space-y-4">
            {/* 사용자명 및 팔로우 버튼 */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-light">
                {profile.name}
              </h1>
              {profile.is_own_profile ? (
                <Button variant="outline" size="sm">
                  프로필 편집
                </Button>
              ) : (
                <FollowButton
                  targetUserId={profile.id}
                  initialIsFollowing={profile.is_following}
                />
              )}
            </div>

            {/* 통계 */}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-semibold">{profile.posts_count}</span>
                <span className="text-[#8e8e8e] ml-1">게시물</span>
              </div>
              <div>
                <span className="font-semibold">{profile.followers_count}</span>
                <span className="text-[#8e8e8e] ml-1">팔로워</span>
              </div>
              <div>
                <span className="font-semibold">{profile.following_count}</span>
                <span className="text-[#8e8e8e] ml-1">팔로잉</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
