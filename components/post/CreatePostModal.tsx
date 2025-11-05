/**
 * @file CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * 이미지 업로드 및 캡션 입력 기능
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/actions/post";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useUser } from "@clerk/nextjs";
import { Loader2, Image as ImageIcon, X } from "lucide-react";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const { user } = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setImage(file);
    setError(null);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError("이미지를 선택해주세요.");
      return;
    }

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.group("createPost - client upload");
      console.log("Starting image upload...");

      // 1. 클라이언트에서 직접 Supabase Storage에 이미지 업로드
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log("Uploading to path:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, image, {
          cacheControl: "3600",
          upsert: false,
          contentType: image.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(uploadError.message || "이미지 업로드에 실패했습니다.");
        setLoading(false);
        setUploadProgress(null);
        console.groupEnd();
        return;
      }

      console.log("Image uploaded successfully:", uploadData.path);
      setUploadProgress(100);

      // 2. Supabase Storage Public URL 생성
      const { data: urlData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);

      console.log("Public URL generated:", urlData.publicUrl);

      // 3. 이미지 URL과 캡션을 Server Action에 전달
      const result = await createPost({
        imageUrl: urlData.publicUrl,
        caption: caption,
      });

      if (result.error) {
        // 네트워크 에러인지 확인
        if (result.error.includes("네트워크") || result.error.includes("Network")) {
          setError("네트워크 연결을 확인해주세요. 다시 시도해주세요.");
        } else {
          setError(result.error);
        }
        setLoading(false);
        setUploadProgress(null);
        console.groupEnd();
        return;
      }

      console.log("Post created successfully");
      console.groupEnd();

      // 성공 시 모달 닫기 및 페이지 새로고침
      setImage(null);
      setPreview(null);
      setCaption("");
      setLoading(false);
      setUploadProgress(null);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      setError(
        error instanceof Error
          ? `업로드 중 오류가 발생했습니다: ${error.message}`
          : "게시물 업로드에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요."
      );
      setLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 게시물 만들기</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">이미지</label>
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto rounded-lg object-cover max-h-[400px]"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <ImageIcon size={48} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  이미지를 선택하세요
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 캡션 입력 */}
          <div className="space-y-2">
            <label htmlFor="caption" className="block text-sm font-medium">
              캡션
            </label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="게시물에 대한 설명을 입력하세요..."
              maxLength={2200}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {caption.length}/2,200
            </p>
          </div>

          {/* 업로드 진행률 */}
          {uploadProgress !== null && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                이미지 업로드 중... {uploadProgress}%
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={!image || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              게시
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
