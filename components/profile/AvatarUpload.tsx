/**
 * @file AvatarUpload.tsx
 * @description 프로필 이미지 업로드 컴포넌트
 */

"use client";

import { useState, useRef } from "react";
import { uploadAvatar } from "@/actions/profile";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AvatarUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadAvatar(formData);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="p-2 bg-white/90 rounded-full"
        aria-label="프로필 이미지 업로드"
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-gray-700" />
        ) : (
          <Camera className="h-6 w-6 text-gray-700" />
        )}
      </button>
    </div>
  );
}
