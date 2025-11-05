/**
 * @file PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트
 *
 * Desktop: 모달 (이미지 50% + 피드백 50%)
 * Mobile: 전체 페이지로 전환
 */

"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PostDetailLayout } from "./PostDetailLayout";
import type { PostWithUser } from "@/types/sns";

interface PostModalProps {
  post: PostWithUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile?: boolean;
}

export function PostModal({
  post,
  open,
  onOpenChange,
  isMobile = false,
}: PostModalProps) {
  // Mobile인 경우 페이지로 이동 (향후 구현)
  // 현재는 모달로 표시
  // if (isMobile) {
  //   router.push(`/feed/post/${post.id}`);
  //   return null;
  // }

  const handleDelete = () => {
    console.group("PostModal: handleDelete");
    console.log("Post deleted, closing modal");
    onOpenChange(false);
    console.groupEnd();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden md:flex">
        <PostDetailLayout post={post} onDelete={handleDelete} />
      </DialogContent>
    </Dialog>
  );
}
