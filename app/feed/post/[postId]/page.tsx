/**
 * @file page.tsx
 * @description 게시물 상세 페이지
 *
 * Desktop: 모달과 동일한 레이아웃 (이미지 50% + 피드백 50%)을 전체 페이지로 표시
 * Mobile: 전체 페이지로 표시 (향후 구현)
 */

import { notFound } from "next/navigation";
import { getPostById } from "@/actions/post";
import { PostDetailPageWrapper } from "@/components/post/PostDetailPageWrapper";

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  console.group("PostDetailPage: Loading");
  const { postId } = await params;
  console.log("Post ID:", postId);

  // 게시물 조회
  const result = await getPostById(postId);

  if (result.error || !result.data) {
    console.error("Post not found or error:", result.error);
    console.groupEnd();
    notFound();
  }

  const post = result.data;
  console.log("Post loaded successfully:", post.id);
  console.groupEnd();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-[#dbdbdb]">
          <PostDetailPageWrapper post={post} />
        </div>
      </div>
    </div>
  );
}
