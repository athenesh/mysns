/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * 무한 스크롤을 통한 게시물 목록 표시
 */

import { getPosts } from "@/actions/post";
import { PostFeedWrapper } from "@/components/post/PostFeedWrapper";

// 동적 렌더링 강제 (auth() 사용으로 인해 필요)
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    const initialPosts = await getPosts();

    return (
      <div className="min-h-screen bg-[#fafafa] py-8">
        <div className="max-w-[630px] mx-auto px-4">
          <PostFeedWrapper initialPosts={initialPosts} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading posts:", error);
    return (
      <div className="min-h-screen bg-[#fafafa] py-8">
        <div className="max-w-[630px] mx-auto px-4">
          <div className="text-center py-16 text-[#8e8e8e]">
            <p className="text-lg mb-2">게시물을 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-sm">페이지를 새로고침해주세요.</p>
          </div>
        </div>
      </div>
    );
  }
}