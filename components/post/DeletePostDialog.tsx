/**
 * @file DeletePostDialog.tsx
 * @description 게시물 삭제 확인 다이얼로그 컴포넌트
 *
 * Instagram 스타일의 삭제 확인 다이얼로그
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/actions/post";
import { Trash2 } from "lucide-react";

interface DeletePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onSuccess: () => void;
}

export function DeletePostDialog({
  open,
  onOpenChange,
  postId,
  onSuccess,
}: DeletePostDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    console.group("DeletePostDialog: handleDelete");
    console.log("Deleting post:", postId);

    setIsDeleting(true);

    try {
      const result = await deletePost(postId);

      if (result.error) {
        console.error("Delete error:", result.error);
        alert(result.error);
        setIsDeleting(false);
        return;
      }

      console.log("Post deleted successfully");
      console.groupEnd();

      // 성공 시 다이얼로그 닫기 및 콜백 호출
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Delete error:", error);
      alert("게시물 삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            게시물을 삭제하시겠습니까?
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-[#8e8e8e] pt-2">
            이 작업은 되돌릴 수 없습니다. 게시물이 영구적으로 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isDeleting ? (
              "삭제 중..."
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                삭제
              </>
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            variant="outline"
            className="w-full"
          >
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
