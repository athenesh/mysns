/**
 * @file PostCard.tsx
 * @description Instagram 스타일 게시물 카드 컴포넌트
 *
 * 헤더, 이미지, 액션 버튼, 컨텐츠 포함
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { CheerButton } from "./CheerButton";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { MessageCircle, MoreVertical } from "lucide-react";
import type { PostWithUser } from "@/types/sns";

interface PostCardProps {
  post: PostWithUser;
}

export function PostCard({ post }: PostCardProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [doubleTapCount, setDoubleTapCount] = useState(0);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return "방금 전";
  };

  const handleDoubleTap = async () => {
    setDoubleTapCount((prev) => prev + 1);
    setTimeout(() => setDoubleTapCount(0), 1000);

    // 더블탭 시 응원하기
    if (!post.is_liked) {
      const { toggleCheer } = await import("@/actions/cheer");
      await toggleCheer(post.id);
    }
  };

  const shouldShowMore = post.caption && post.caption.length > 100;

  return (
    <article className="bg-white border border-[#dbdbdb] rounded-lg mb-4 max-w-[630px] mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 h-[60px]">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.user.clerk_id}`}>
            <Avatar src={post.user.avatar_url} alt={post.user.name} size={32} />
          </Link>
          <div>
            <Link
              href={`/profile/${post.user.clerk_id}`}
              className="font-semibold text-sm hover:opacity-50"
            >
              {post.user.name}
            </Link>
            <p className="text-xs text-[#8e8e8e]">
              {formatTimeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <button className="p-1 hover:opacity-50">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* 이미지 */}
      <div
        className="relative w-full aspect-square bg-gray-100"
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          className="w-full h-full object-cover"
        />
        {/* 더블탭 응원하기 애니메이션 */}
        {doubleTapCount > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-ping">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="#ed4956"
                className="opacity-80"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <CheerButton
            postId={post.id}
            initialIsCheered={post.is_liked}
            initialCount={post.likes_count}
          />
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="p-1 hover:opacity-50"
            aria-label="피드백 요청"
          >
            <MessageCircle
              size={24}
              className={showFeedback ? "text-[#262626]" : "text-[#262626]"}
            />
          </button>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 응원 수 */}
        {post.likes_count > 0 && (
          <p className="font-semibold text-sm">
            응원 {post.likes_count.toLocaleString()}개
          </p>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-sm">
            <Link
              href={`/profile/${post.user.clerk_id}`}
              className="font-semibold mr-2 hover:opacity-50"
            >
              {post.user.name}
            </Link>
            <span>
              {showFullCaption || !shouldShowMore
                ? post.caption
                : `${post.caption.slice(0, 100)}...`}
            </span>
            {shouldShowMore && (
              <button
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-[#8e8e8e] ml-1 hover:opacity-50"
              >
                {showFullCaption ? "간략히" : "더 보기"}
              </button>
            )}
          </div>
        )}

        {/* 피드백 미리보기 */}
        {post.comments_count > 0 && !showFeedback && (
          <div>
            <button
              onClick={() => setShowFeedback(true)}
              className="text-[#8e8e8e] text-sm hover:opacity-50"
            >
              피드백 {post.comments_count}개 모두 보기
            </button>
            <FeedbackList postId={post.id} limit={2} />
          </div>
        )}

        {/* 피드백 전체 보기 */}
        {showFeedback && (
          <div>
            <FeedbackList postId={post.id} limit={10} />
            <FeedbackForm
              postId={post.id}
              onSuccess={() => {
                // 피드백 목록 새로고침은 FeedbackList 내부에서 처리
              }}
            />
          </div>
        )}
      </div>
    </article>
  );
}
