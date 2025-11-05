/**
 * @file FeedbackForm.tsx
 * @description 피드백 작성 폼 컴포넌트
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createFeedback } from "@/actions/feedback";
import { Loader2 } from "lucide-react";
import type { CommentWithUser } from "@/types/sns";

interface FeedbackFormProps {
  postId: string;
  parentId?: string | null; // 대댓글인 경우 부모 댓글 ID
  parentUserName?: string; // 대댓글인 경우 부모 댓글 작성자 이름
  onSuccess?: (feedback: CommentWithUser) => void;
  onCancel?: () => void; // 대댓글 작성 취소 콜백
  className?: string; // 추가 스타일링
}

export function FeedbackForm({
  postId,
  parentId,
  parentUserName,
  onSuccess,
  onCancel,
  className,
}: FeedbackFormProps) {
  const { isSignedIn } = useUser();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isReply = !!parentId;

  // 로그인하지 않은 경우 로그인 유도 메시지 표시
  if (!isSignedIn) {
    return (
      <div className="border-t border-[#dbdbdb] p-4 text-center">
        <p className="text-sm text-[#8e8e8e]">
          <Link
            href="/sign-in"
            className="text-[#0095f6] hover:underline font-semibold"
          >
            로그인
          </Link>
          하여 피드백을 남겨보세요.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createFeedback(postId, content, parentId || null);

      if (result.error) {
        // 네트워크 에러인지 확인
        if (
          result.error.includes("네트워크") ||
          result.error.includes("Network")
        ) {
          setError("네트워크 연결을 확인해주세요. 다시 시도해주세요.");
        } else {
          setError(result.error);
        }
        setLoading(false);
        return;
      }

      setContent("");
      setLoading(false);
      if (result.data) {
        onSuccess?.(result.data);
        // 대댓글 작성 후 취소 콜백 호출 (폼 숨김)
        if (isReply) {
          onCancel?.();
        }
      }
    } catch (error) {
      console.error("Error creating feedback:", error);
      setError(
        error instanceof Error
          ? `피드백 작성 중 오류가 발생했습니다: ${error.message}`
          : "피드백 작성에 실패했습니다. 다시 시도해주세요.",
      );
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`border-t border-[#dbdbdb] ${isReply ? "px-4 py-2" : "p-4"} ${
        className || ""
      }`}
    >
      {isReply && parentUserName && (
        <div className="mb-2 text-xs text-[#8e8e8e]">
          <span className="font-semibold">{parentUserName}</span>님에게 답글
        </div>
      )}
      <div className="flex gap-2 items-center">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isReply
              ? parentUserName
                ? `${parentUserName}님에게 답글 작성...`
                : "답글 작성..."
              : "피드백 요청..."
          }
          maxLength={1000}
          rows={isReply ? 1 : 1}
          className="resize-none flex-1 min-h-[40px] text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
            if (e.key === "Escape" && isReply) {
              onCancel?.();
            }
          }}
          autoFocus={isReply}
        />
        {isReply && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
            className="text-[#8e8e8e] hover:text-[#262626]"
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          disabled={!content.trim() || loading}
          size="sm"
          className="text-[#0095f6] hover:text-[#0095f6] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isReply ? (
            "게시"
          ) : (
            "게시"
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
}
