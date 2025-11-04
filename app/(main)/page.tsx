/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * 무한 스크롤을 통한 게시물 목록 표시
 */

import { Suspense } from "react";
import { getPosts } from "@/actions/post";
import { PostFeed } from "@/components/post/PostFeed";

export default async function HomePage() {
  const initialPosts = await getPosts();

  return (
    <div className="min-h-screen bg-[#fafafa] py-8">
      <div className="max-w-[630px] mx-auto px-4">
        <Suspense fallback={<PostFeedSkeleton />}>
          <PostFeed initialPosts={initialPosts} />
        </Suspense>
      </div>
    </div>
  );
}

function PostFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white border border-[#dbdbdb] rounded-lg animate-pulse"
        >
          <div className="h-[60px] bg-gray-200" />
          <div className="aspect-square bg-gray-200" />
          <div className="h-[48px] bg-gray-200" />
          <div className="h-32 bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
