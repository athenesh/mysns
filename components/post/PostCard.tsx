/**
 * @file PostCard.tsx
 * @description Instagram 스타일 게시물 카드 컴포넌트
 *
 * 헤더, 이미지, 액션 버튼, 컨텐츠 포함
 */

"use client";

import { useState, useRef, useEffect, memo } from "react";
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
import { PostModal } from "./PostModal";
import { DeletePostDialog } from "./DeletePostDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, MoreVertical, Trash2 } from "lucide-react";
import type { PostWithUser, CommentWithUser } from "@/types/sns";

interface PostCardProps {
  post: PostWithUser;
  priority?: boolean;
  onDelete?: () => void;
}

function PostCardComponent({
  post,
  priority = false,
  onDelete,
}: PostCardProps) {
  const { user } = useUser();
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCheered, setIsCheered] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [isLoading, setIsLoading] = useState(false);

  // 본인 게시물 여부 확인
  const isOwnPost = post.user.clerk_id === user?.id;

  // FeedbackList ref
  const feedbackListRef = useRef<FeedbackListRef>(null);
  const feedbackListPreviewRef = useRef<FeedbackListRef>(null);

  // 터치 이벤트 관리
  const lastTouchTimeRef = useRef<number>(0);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const DOUBLE_TAP_DELAY = 300; // ms

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };
  }, []);

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

  const handleImageClick = () => {
    // 단일 클릭 시 모달 열기 (더블탭은 handleDoubleTapLike에서 처리됨)
    setShowModal(true);
  };

  // 더블탭 애니메이션 표시
  const triggerDoubleTapAnimation = () => {
    setShowDoubleTapHeart(true);
    setTimeout(() => {
      setShowDoubleTapHeart(false);
    }, 1000);
  };

  // 더블탭 좋아요 처리
  const handleDoubleTapLike = async () => {
    // 이미 좋아요가 되어 있거나 로딩 중이면 무시
    if (isCheered || isLoading) return;

    // 애니메이션 즉시 표시 (UX 개선)
    triggerDoubleTapAnimation();

    setIsLoading(true);

    // Optimistic update
    const previousIsCheered = isCheered;
    const previousCount = likesCount;
    setIsCheered(true);
    setLikesCount((prev) => prev + 1);

    try {
      const { toggleCheer } = await import("@/actions/cheer");
      const result = await toggleCheer(post.id);

      if (result.error) {
        // 롤백
        setIsCheered(previousIsCheered);
        setLikesCount(previousCount);
      }
    } catch (error) {
      // 에러 발생 시 롤백
      console.error("Error handling double tap:", error);
      setIsCheered(previousIsCheered);
      setLikesCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  // 마우스 더블클릭 핸들러
  const handleDoubleClick = () => {
    handleDoubleTapLike();
  };

  // 터치 시작 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();

    // 기존 타이머가 있으면 클리어
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    // 더블탭 감지 (300ms 이내 두 번째 터치)
    if (now - lastTouchTimeRef.current < DOUBLE_TAP_DELAY) {
      // 더블탭 감지 - 이 경우에만 기본 동작 방지
      e.preventDefault();
      handleDoubleTapLike();
      lastTouchTimeRef.current = 0;
    } else {
      // 첫 번째 터치로 기록
      lastTouchTimeRef.current = now;
      // 300ms 후 타임아웃 (더블탭이 아니면 첫 번째 터치로 간주)
      touchTimerRef.current = setTimeout(() => {
        lastTouchTimeRef.current = 0;
      }, DOUBLE_TAP_DELAY);
    }
  };

  // CheerButton 상태 업데이트 콜백
  const handleCheerToggle = (newIsCheered: boolean, newCount: number) => {
    setIsCheered(newIsCheered);
    setLikesCount(newCount);
  };

  // 피드백 작성 성공 핸들러
  const handleFeedbackSuccess = (feedback: CommentWithUser) => {
    console.group("handleFeedbackSuccess");
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
      feedbackListPreviewRef.current?.addFeedback(feedback);

      // 피드백 목록 새로고침
      feedbackListRef.current?.refresh();
      feedbackListPreviewRef.current?.refresh();
    }

    console.groupEnd();
  };

  // 피드백 삭제 핸들러
  const handleFeedbackDelete = () => {
    console.group("handleFeedbackDelete");
    console.log("Feedback deleted");

    // 피드백 수 감소
    setCommentsCount((prev) => {
      const newCount = Math.max(0, prev - 1);
      console.log("Comments count updated:", prev, "→", newCount);
      return newCount;
    });

    console.groupEnd();
  };

  // 게시물 삭제 핸들러
  const handleDeleteSuccess = () => {
    console.group("PostCard: handleDeleteSuccess");
    console.log("Post deleted, notifying parent");
    onDelete?.();
    console.groupEnd();
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
        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:opacity-50" aria-label="더보기 메뉴">
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

      {/* 이미지 */}
      <div
        className="relative w-full aspect-square bg-gray-100"
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
      >
        <button
          onClick={handleImageClick}
          className="absolute inset-0 w-full h-full cursor-pointer z-0"
          aria-label="게시물 상세 보기"
          type="button"
        >
          <Image
            src={post.image_url}
            alt={post.caption || "게시물 이미지"}
            width={630}
            height={630}
            className="w-full h-full object-cover pointer-events-none"
            priority={priority}
            unoptimized={!post.image_url.startsWith("http")}
            onError={(e) => {
              console.error("Image load error:", e);
              // Fallback 이미지 표시는 CSS로 처리
            }}
          />
        </button>
        {/* 더블탭 응원하기 애니메이션 */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="double-tap-heart-animation">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="#ed4956">
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
            initialIsCheered={isCheered}
            initialCount={likesCount}
            onToggle={handleCheerToggle}
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
        {likesCount > 0 && (
          <p className="font-semibold text-sm">
            응원 {likesCount.toLocaleString()}개
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
        {commentsCount > 0 && !showFeedback && (
          <div>
            <button
              onClick={() => setShowFeedback(true)}
              className="text-[#8e8e8e] text-sm hover:opacity-50"
            >
              피드백 {commentsCount}개 모두 보기
            </button>
            <FeedbackList
              ref={feedbackListPreviewRef}
              postId={post.id}
              limit={2}
              onDelete={handleFeedbackDelete}
            />
          </div>
        )}

        {/* 피드백 전체 보기 */}
        {showFeedback && (
          <div>
            <FeedbackList
              ref={feedbackListRef}
              postId={post.id}
              limit={10}
              onDelete={handleFeedbackDelete}
            />
            <FeedbackForm postId={post.id} onSuccess={handleFeedbackSuccess} />
          </div>
        )}
      </div>

      {/* 게시물 상세 모달 */}
      <PostModal
        post={post}
        open={showModal}
        onOpenChange={setShowModal}
        isMobile={false}
      />

      {/* 삭제 확인 다이얼로그 */}
      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        postId={post.id}
        onSuccess={handleDeleteSuccess}
      />
    </article>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const PostCard = memo(PostCardComponent);
