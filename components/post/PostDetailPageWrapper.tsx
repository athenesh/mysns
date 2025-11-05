/**
 * @file PostDetailPageWrapper.tsx
 * @description 게시물 상세 페이지 래퍼 컴포넌트
 *
 * 삭제 후 리다이렉트를 위한 클라이언트 컴포넌트
 */

"use client";

import { useRouter } from "next/navigation";
import { PostDetailLayout } from "./PostDetailLayout";
import type { PostWithUser } from "@/types/sns";

interface PostDetailPageWrapperProps {
  post: PostWithUser;
}

export function PostDetailPageWrapper({ post }: PostDetailPageWrapperProps) {
  const router = useRouter();

  const handleDelete = () => {
    console.group("PostDetailPageWrapper: handleDelete");
    console.log("Post deleted, redirecting to feed");
    router.push("/feed");
    console.groupEnd();
  };

  return <PostDetailLayout post={post} onDelete={handleDelete} />;
}
