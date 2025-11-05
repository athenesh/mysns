/**
 * @file CheerButton.tsx
 * @description 응원하기 버튼 컴포넌트
 *
 * 하트 아이콘 클릭 시 응원하기/응원 취소 토글
 */

"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleCheer } from "@/actions/cheer";
import { cn } from "@/lib/utils";

interface CheerButtonProps {
  postId: string;
  initialIsCheered: boolean;
  initialCount: number;
  onToggle?: (isCheered: boolean, count: number) => void;
}

export function CheerButton({
  postId,
  initialIsCheered,
  initialCount,
  onToggle,
}: CheerButtonProps) {
  const [isCheered, setIsCheered] = useState(initialIsCheered);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);

    // Optimistic update
    const previousIsCheered = isCheered;
    const previousCount = count;
    const newIsCheered = !isCheered;
    const newCount = newIsCheered ? count + 1 : count - 1;
    setIsCheered(newIsCheered);
    setCount(newCount);

    try {
      const result = await toggleCheer(postId);

      if (result.error) {
        // 롤백
        setIsCheered(previousIsCheered);
        setCount(previousCount);
      } else {
        onToggle?.(newIsCheered, newCount);
      }
    } catch (error) {
      // 에러 발생 시 롤백
      console.error("Error toggling cheer:", error);
      setIsCheered(previousIsCheered);
      setCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "p-1 transition-all duration-150 hover:scale-110 active:scale-95",
        isCheered && "scale-110",
      )}
      aria-label={isCheered ? "응원 취소" : "응원하기"}
    >
      <Heart
        size={24}
        className={cn(
          "transition-colors",
          isCheered ? "fill-[#ed4956] text-[#ed4956]" : "text-[#262626]",
        )}
      />
    </button>
  );
}
