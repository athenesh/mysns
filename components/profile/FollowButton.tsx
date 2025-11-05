/**
 * @file FollowButton.tsx
 * @description 팔로우/언팔로우 버튼 컴포넌트
 *
 * PRD 요구사항:
 * - 미팔로우: "팔로우" (파란색 #0095f6)
 * - 팔로우 중: "팔로잉" (회색)
 * - Hover: "언팔로우" (빨간 테두리)
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/actions/follow";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);

  // 초기 상태 동기화: prop이 변경되면 상태 업데이트
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);

    // 이전 상태 저장 (롤백용)
    const previousIsFollowing = isFollowing;

    // Optimistic update
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);

    if (process.env.NODE_ENV === "development") {
      console.group("FollowButton - toggleFollow");
      console.log("Target user ID:", targetUserId);
      console.log("Previous state:", previousIsFollowing);
      console.log("New state (optimistic):", newIsFollowing);
    }

    const result = await toggleFollow(targetUserId);

    if (result.error) {
      // 롤백
      setIsFollowing(previousIsFollowing);
      if (process.env.NODE_ENV === "development") {
        console.error("Toggle follow failed:", result.error);
      }
      // TODO: 향후 toast 알림으로 교체
      alert(result.error);
    } else {
      const finalIsFollowing = result.data?.is_following ?? newIsFollowing;
      
      if (process.env.NODE_ENV === "development") {
        console.log("Toggle follow success:", {
          is_following: finalIsFollowing,
        });
      }

      // 팔로우 상태 변경 콜백 호출 (팔로워 수 업데이트용)
      if (onFollowChange) {
        onFollowChange(finalIsFollowing);
      }
    }

    setLoading(false);
    if (process.env.NODE_ENV === "development") {
      console.groupEnd();
    }
  };

  // 버튼 스타일 클래스 결정
  const getButtonClassName = () => {
    if (loading) return "";
    
    if (hoverText === "언팔로우") {
      return "border-red-500 text-red-600 hover:bg-red-50";
    }
    
    if (isFollowing) {
      return "border-[#dbdbdb] text-[#262626] hover:bg-[#fafafa]";
    }
    
    return "bg-[#0095f6] hover:bg-[#1877f2] text-white";
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={getButtonClassName()}
      onMouseEnter={() => {
        if (isFollowing && !loading) setHoverText("언팔로우");
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
