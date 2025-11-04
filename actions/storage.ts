"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

// FileObject 타입 정의
export interface FileObject {
  id: string;
  name: string;
  bucket_id: string;
  owner?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata?: Record<string, any>;
}

/**
 * 파일 업로드 서버 액션
 * Service Role 클라이언트를 사용하여 JWT 알고리즘 문제를 우회합니다.
 */
export async function uploadFile(formData: FormData) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return { error: "로그인이 필요합니다." };
    }

    // Service Role 클라이언트 사용 (JWT 알고리즘 문제 우회)
    const supabase = getServiceRoleClient();
    const file = formData.get("file") as File;
    const bucketName = formData.get("bucketName") as string || STORAGE_BUCKET;

    // 파일 유효성 검사
    if (!file) {
      return { error: "파일을 선택해주세요." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { error: "파일 크기는 10MB 이하여야 합니다." };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { error: "지원되지 않는 파일 형식입니다." };
    }

    // 파일명 생성
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log("Uploading file:", { filePath, size: file.size, type: file.type });

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return { error: error.message };
    }

    console.log("File uploaded successfully:", data);
    return { success: true, path: filePath, fileName };
  } catch (error) {
    console.error("Upload action error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "파일 업로드 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 파일 목록 조회 서버 액션
 */
export async function listFiles(userId: string) {
  try {
    if (!userId) {
      return { error: "사용자 ID가 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    console.log("Fetching files for user:", userId);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Error fetching files:", error);
      return { error: error.message };
    }

    console.log("Files fetched successfully:", data?.length || 0);
    return { success: true, files: data || [] };
  } catch (error) {
    console.error("List files error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "파일 목록을 가져오는데 실패했습니다.",
    };
  }
}

/**
 * 파일 다운로드 서버 액션
 * 서명된 URL을 생성하여 클라이언트에서 직접 다운로드할 수 있도록 합니다.
 */
export async function downloadFile(userId: string, fileName: string) {
  try {
    if (!userId || !fileName) {
      return { error: "사용자 ID와 파일명이 필요합니다." };
    }

    const supabase = getServiceRoleClient();
    const filePath = `${userId}/${fileName}`;

    console.log("Creating signed URL for file:", filePath);

    // 서명된 다운로드 URL 생성 (1시간 유효)
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error("Error creating signed URL:", error);
      return { error: error.message };
    }

    console.log("Signed URL created successfully:", fileName);
    return { success: true, url: data.signedUrl, fileName };
  } catch (error) {
    console.error("Download file error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "파일 다운로드에 실패했습니다.",
    };
  }
}

/**
 * 파일 삭제 서버 액션
 */
export async function deleteFile(userId: string, fileName: string) {
  try {
    if (!userId || !fileName) {
      return { error: "사용자 ID와 파일명이 필요합니다." };
    }

    const supabase = getServiceRoleClient();
    const filePath = `${userId}/${fileName}`;

    console.log("Deleting file:", filePath);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      return { error: error.message };
    }

    console.log("File deleted successfully:", fileName);
    return { success: true };
  } catch (error) {
    console.error("Delete file error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "파일 삭제에 실패했습니다.",
    };
  }
}

