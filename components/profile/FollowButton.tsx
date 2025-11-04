/**
 * @file FollowButton.tsx
 * @description 팔로우/언팔로우 버튼 컴포넌트
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/actions/follow";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);

    // Optimistic update
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);

    const result = await toggleFollow(targetUserId);

    if (result.error) {
      // 롤백
      setIsFollowing(isFollowing);
      alert(result.error);
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={hoverText === "언팔로우" ? "border-red-500 text-red-600" : ""}
      onMouseEnter={() => {
        if (isFollowing) setHoverText("언팔로우");
      }}
      onMouseLeave={() => setHoverText(null)}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        hoverText || (isFollowing ? "팔로잉" : "팔로우")
      )}
    </Button>
  );
}
