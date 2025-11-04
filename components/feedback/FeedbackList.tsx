/**
 * @file FeedbackList.tsx
 * @description 피드백 목록 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { getFeedbacks, deleteFeedback } from "@/actions/feedback";
import type { CommentWithUser } from "@/types/sns";
import { Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface FeedbackListProps {
  postId: string;
  initialFeedbacks?: CommentWithUser[];
  limit?: number;
}

export function FeedbackList({
  postId,
  initialFeedbacks = [],
  limit = 10,
}: FeedbackListProps) {
  const { user } = useUser();
  const [feedbacks, setFeedbacks] =
    useState<CommentWithUser[]>(initialFeedbacks);
  const [loading, setLoading] = useState(false);

  const refreshFeedbacks = async () => {
    setLoading(true);
    const result = await getFeedbacks(postId, limit);
    if (result.data) {
      setFeedbacks(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialFeedbacks.length === 0) {
      refreshFeedbacks();
    }
  }, [postId]);

  const handleDelete = async (feedbackId: string) => {
    const result = await deleteFeedback(feedbackId);
    if (!result.error) {
      setFeedbacks(feedbacks.filter((f) => f.id !== feedbackId));
    }
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
    <div className="space-y-3">
      {feedbacks.map((feedback) => {
        const isOwn = user?.id === feedback.user.clerk_id;

        return (
          <div key={feedback.id} className="flex items-start gap-3 px-4">
            <Avatar
              src={feedback.user.avatar_url}
              alt={feedback.user.name}
              size={32}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {feedback.user.name}
                </span>
                <span className="text-[#8e8e8e] text-sm">
                  {feedback.content}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-[#8e8e8e] text-xs">
                  {formatTimeAgo(feedback.created_at)}
                </span>
              </div>
            </div>
            {isOwn && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => handleDelete(feedback.id)}
                aria-label="피드백 삭제"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        );
      })}
      {loading && (
        <div className="text-center text-sm text-[#8e8e8e] py-4">
          로딩 중...
        </div>
      )}
    </div>
  );
}
