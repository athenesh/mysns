/**
 * @file FeedbackList.tsx
 * @description 피드백 목록 컴포넌트
 */

"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import {
  getFeedbacks,
  deleteFeedback,
  updateFeedback,
} from "@/actions/feedback";
import { FeedbackForm } from "./FeedbackForm";
import type { CommentWithUser } from "@/types/sns";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeedbackListProps {
  postId: string;
  initialFeedbacks?: CommentWithUser[];
  limit?: number;
  onDelete?: () => void;
}

export interface FeedbackListRef {
  refresh: () => Promise<void>;
  addFeedback: (feedback: CommentWithUser) => void;
}

export const FeedbackList = forwardRef<FeedbackListRef, FeedbackListProps>(
  ({ postId, initialFeedbacks = [], limit = 10, onDelete }, ref) => {
    const { user } = useUser();
    const [feedbacks, setFeedbacks] =
      useState<CommentWithUser[]>(initialFeedbacks);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(
      null,
    );
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [showReplies, setShowReplies] = useState<Set<string>>(new Set());

    const refreshFeedbacks = async () => {
      setLoading(true);
      const result = await getFeedbacks(postId, limit);
      if (result.data) {
        setFeedbacks(result.data);
      }
      setLoading(false);
    };

    // Optimistic UI: 새 피드백을 목록에 추가
    const addFeedback = (feedback: CommentWithUser) => {
      // 대댓글인 경우 부모 댓글의 replies에 추가
      if (feedback.parent_comment_id) {
        setFeedbacks((prev) =>
          prev.map((f) => {
            if (f.id === feedback.parent_comment_id) {
              const updatedReplies = [...(f.replies || []), feedback];
              return {
                ...f,
                replies: updatedReplies,
                replies_count: updatedReplies.length,
              };
            }
            return f;
          }),
        );
      } else {
        // 최상위 댓글인 경우 목록 맨 앞에 추가
        setFeedbacks((prev) => [
          { ...feedback, replies: [], replies_count: 0 },
          ...prev,
        ]);
      }
    };

    // 외부에서 호출 가능한 메서드 노출
    useImperativeHandle(ref, () => ({
      refresh: refreshFeedbacks,
      addFeedback,
    }));

    useEffect(() => {
      if (initialFeedbacks.length === 0) {
        refreshFeedbacks();
      }
    }, [postId]);

    const handleDeleteClick = (feedbackId: string) => {
      setFeedbackToDelete(feedbackId);
      setDeleteDialogOpen(true);
    };

    const handleEditClick = (feedback: CommentWithUser) => {
      setEditingId(feedback.id);
      setEditContent(feedback.content);
    };

    const handleEditCancel = () => {
      setEditingId(null);
      setEditContent("");
    };

    const handleEditSave = async (feedbackId: string) => {
      if (!editContent.trim()) return;

      setEditLoading(true);
      const previousFeedbacks = [...feedbacks];

      try {
        const result = await updateFeedback(feedbackId, editContent);

        if (result.error) {
          alert(result.error || "피드백 수정에 실패했습니다.");
          setEditLoading(false);
          return;
        }

        // 성공 시 목록 업데이트
        if (result.data) {
          setFeedbacks((prev) =>
            prev.map((f) => (f.id === feedbackId ? result.data! : f)),
          );
        }

        setEditingId(null);
        setEditContent("");
        setEditLoading(false);
      } catch (error) {
        console.error("Error updating feedback:", error);
        alert(
          error instanceof Error
            ? `수정 중 오류가 발생했습니다: ${error.message}`
            : "피드백 수정에 실패했습니다. 다시 시도해주세요.",
        );
        setFeedbacks(previousFeedbacks);
        setEditLoading(false);
      }
    };

    const handleDeleteConfirm = async () => {
      if (!feedbackToDelete) return;

      // Optimistic update: 먼저 UI에서 제거
      const previousFeedbacks = [...feedbacks];
      setFeedbacks(feedbacks.filter((f) => f.id !== feedbackToDelete));
      setDeleteDialogOpen(false);
      const feedbackId = feedbackToDelete;
      setFeedbackToDelete(null);

      try {
        const result = await deleteFeedback(feedbackId);
        if (result.error) {
          // 실패 시 롤백
          setFeedbacks(previousFeedbacks);
          alert(result.error || "피드백 삭제에 실패했습니다.");
        } else {
          // 삭제 성공 시 콜백 호출
          onDelete?.();
        }
      } catch (error) {
        // 에러 발생 시 롤백
        setFeedbacks(previousFeedbacks);
        console.error("Error deleting feedback:", error);
        alert(
          error instanceof Error
            ? `삭제 중 오류가 발생했습니다: ${error.message}`
            : "피드백 삭제에 실패했습니다. 다시 시도해주세요.",
        );
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

    const toggleReplies = (feedbackId: string) => {
      setShowReplies((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(feedbackId)) {
          newSet.delete(feedbackId);
        } else {
          newSet.add(feedbackId);
        }
        return newSet;
      });
    };

    const handleReplySuccess = (
      feedback: CommentWithUser,
      parentId: string,
    ) => {
      console.group("FeedbackList: handleReplySuccess");
      console.log("New reply created:", feedback.id, "for parent:", parentId);

      // 부모 댓글의 replies에 추가
      setFeedbacks((prev) =>
        prev.map((f) => {
          if (f.id === parentId) {
            const updatedReplies = [...(f.replies || []), feedback];
            return {
              ...f,
              replies: updatedReplies,
              replies_count: updatedReplies.length,
            };
          }
          return f;
        }),
      );

      // 대댓글 영역 자동으로 보이게
      setShowReplies((prev) => new Set([...prev, parentId]));

      // 답글 작성 폼 숨김
      setReplyingToId(null);

      console.groupEnd();
    };

    const renderFeedback = (
      feedback: CommentWithUser,
      isReply: boolean = false,
    ) => {
      const isOwn = user?.id === feedback.user.clerk_id;
      const isEditing = editingId === feedback.id;
      const isReplying = replyingToId === feedback.id;
      const hasReplies = (feedback.replies_count || 0) > 0;
      const showRepliesForThis = showReplies.has(feedback.id);

      return (
        <div key={feedback.id} className={isReply ? "ml-8 mt-2" : ""}>
          <div className="flex items-start gap-3 px-4 py-1">
            <Avatar
              src={feedback.user.avatar_url}
              alt={feedback.user.name}
              size={isReply ? 24 : 32}
            />
            <div className="flex-1 min-w-0">
              {/* Instagram 스타일: 이름 + 내용 한 줄 */}
              {!isEditing ? (
                <div className="text-sm">
                  <span className="font-semibold mr-2">
                    {feedback.user.name}
                  </span>
                  <span className="text-[#262626]">{feedback.content}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={1000}
                    rows={2}
                    className="resize-none text-sm"
                    disabled={editLoading}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditCancel}
                      disabled={editLoading}
                      className="h-7 text-xs"
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditSave(feedback.id)}
                      disabled={!editContent.trim() || editLoading}
                      className="h-7 text-xs"
                    >
                      저장
                    </Button>
                  </div>
                </div>
              )}

              {/* 시간 및 액션 버튼 */}
              {!isEditing && (
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[#8e8e8e] text-xs">
                    {formatTimeAgo(feedback.created_at)}
                  </span>
                  {!isReply && (
                    <button
                      onClick={() => setReplyingToId(feedback.id)}
                      className="text-[#8e8e8e] text-xs hover:text-[#262626] font-semibold"
                    >
                      답글
                    </button>
                  )}
                  {isOwn && (
                    <>
                      <button
                        onClick={() => handleEditClick(feedback)}
                        className="text-[#8e8e8e] text-xs hover:text-[#262626]"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteClick(feedback.id)}
                        className="text-[#8e8e8e] text-xs hover:text-red-600"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* 대댓글 보기/숨기기 토글 */}
              {!isReply && hasReplies && (
                <button
                  onClick={() => toggleReplies(feedback.id)}
                  className="text-[#8e8e8e] text-xs mt-1 hover:text-[#262626]"
                >
                  {showRepliesForThis
                    ? "답글 숨기기"
                    : `답글 ${feedback.replies_count}개 보기`}
                </button>
              )}

              {/* 대댓글 목록 */}
              {!isReply && showRepliesForThis && feedback.replies && (
                <div className="mt-2">
                  {feedback.replies.map((reply) => renderFeedback(reply, true))}
                </div>
              )}

              {/* 답글 작성 폼 */}
              {isReplying && (
                <div className="mt-2">
                  <FeedbackForm
                    postId={postId}
                    parentId={feedback.id}
                    parentUserName={feedback.user.name}
                    onSuccess={(newReply) =>
                      handleReplySuccess(newReply, feedback.id)
                    }
                    onCancel={() => setReplyingToId(null)}
                    className="border-0 px-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-1">
        {feedbacks.map((feedback) => renderFeedback(feedback, false))}
        {loading && (
          <div className="text-center text-sm text-[#8e8e8e] py-4">
            로딩 중...
          </div>
        )}

        {/* 삭제 확인 다이얼로그 */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>피드백 삭제</DialogTitle>
              <DialogDescription>
                이 피드백을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setFeedbackToDelete(null);
                }}
              >
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);
