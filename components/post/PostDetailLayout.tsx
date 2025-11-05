/**
 * @file PostDetailLayout.tsx
 * @description 게시물 상세 레이아웃 컴포넌트 (공통)
 *
 * PostModal과 PostDetailPage에서 공통으로 사용하는 레이아웃
 * Desktop: 이미지 50% + 피드백 50%
 */

"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@/components/ui/avatar";
import { CheerButton } from "./CheerButton";
import {
  FeedbackList,
  type FeedbackListRef,
} from "@/components/feedback/FeedbackList";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { DeletePostDialog } from "./DeletePostDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, MoreVertical, Trash2 } from "lucide-react";
import type { PostWithUser, CommentWithUser } from "@/types/sns";

interface PostDetailLayoutProps {
  post: PostWithUser;
  onFeedbackSuccess?: (feedback: CommentWithUser) => void;
  onFeedbackDelete?: () => void;
  onDelete?: () => void;
}

export function PostDetailLayout({
  post,
  onFeedbackSuccess,
  onFeedbackDelete,
  onDelete,
}: PostDetailLayoutProps) {
  const { user } = useUser();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const feedbackListRef = useRef<FeedbackListRef>(null);

  // 본인 게시물 여부 확인
  const isOwnPost = post.user.clerk_id === user?.id;

  // 피드백 작성 성공 핸들러
  const handleFeedbackSuccess = (feedback: CommentWithUser) => {
    console.group("PostDetailLayout: handleFeedbackSuccess");
    console.log(
      "New feedback created:",
      feedback.id,
      "Is reply:",
      !!feedback.parent_comment_id,
    );

    // 최상위 댓글만 카운트 증가 (대댓글은 FeedbackList에서 처리)
    if (!feedback.parent_comment_id) {
      setCommentsCount((prev) => {
        console.log("Comments count updated:", prev, "→", prev + 1);
        return prev + 1;
      });

      // FeedbackList에 피드백 추가 (Optimistic UI)
      feedbackListRef.current?.addFeedback(feedback);

      // 피드백 목록 새로고침
      feedbackListRef.current?.refresh();
    }

    // 부모 컴포넌트에 알림
    onFeedbackSuccess?.(feedback);

    console.groupEnd();
  };

  // 피드백 삭제 핸들러
  const handleFeedbackDelete = () => {
    console.group("PostDetailLayout: handleFeedbackDelete");
    console.log("Feedback deleted");

    // 피드백 수 감소
    setCommentsCount((prev) => {
      const newCount = Math.max(0, prev - 1);
      console.log("Comments count updated:", prev, "→", newCount);
      return newCount;
    });

    // 부모 컴포넌트에 알림
    onFeedbackDelete?.();

    console.groupEnd();
  };

  // 게시물 삭제 핸들러
  const handleDeleteSuccess = () => {
    console.group("PostDetailLayout: handleDeleteSuccess");
    console.log("Post deleted, notifying parent");
    onDelete?.();
    console.groupEnd();
  };

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

  return (
    <div className="flex flex-col md:flex-row bg-white">
      {/* 이미지 영역 (50%) */}
      <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-[600px] bg-black">
        <Image
          src={post.image_url}
          alt={post.caption || "게시물"}
          fill
          className="object-contain"
          unoptimized={!post.image_url.startsWith("http")}
        />
      </div>

      {/* 피드백 영역 (50%) */}
      <div className="w-full md:w-1/2 flex flex-col max-h-[600px] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#dbdbdb]">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.user.clerk_id}`}>
              <Avatar
                src={post.user.avatar_url}
                alt={post.user.name}
                size={32}
              />
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
          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 hover:opacity-50"
                  aria-label="더보기 메뉴"
                >
                  <MoreVertical size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer"
                >
                  <Trash2 size={16} className="mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* 피드백 목록 */}
        <div className="flex-1 overflow-y-auto">
          <FeedbackList
            ref={feedbackListRef}
            postId={post.id}
            limit={20}
            onDelete={handleFeedbackDelete}
          />
        </div>

        {/* 액션 버튼 및 피드백 입력 */}
        <div className="border-t border-[#dbdbdb]">
          {/* 액션 버튼 */}
          <div className="flex items-center gap-4 px-4 py-3">
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

          {/* 응원 수 */}
          {post.likes_count > 0 && (
            <div className="px-4 pb-2">
              <p className="font-semibold text-sm">
                응원 {post.likes_count.toLocaleString()}개
              </p>
            </div>
          )}

          {/* 캡션 */}
          {post.caption && (
            <div className="px-4 pb-2 text-sm">
              <Link
                href={`/profile/${post.user.clerk_id}`}
                className="font-semibold mr-2 hover:opacity-50"
              >
                {post.user.name}
              </Link>
              <span>{post.caption}</span>
            </div>
          )}

          {/* 피드백 입력 폼 */}
          <FeedbackForm postId={post.id} onSuccess={handleFeedbackSuccess} />
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        postId={post.id}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
