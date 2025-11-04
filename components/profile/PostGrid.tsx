/**
 * @file PostGrid.tsx
 * @description 프로필 게시물 그리드 컴포넌트
 *
 * 3열 그리드 레이아웃, 1:1 정사각형 썸네일
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PostCard } from "@/components/post/PostCard";
import type { Post, PostWithUser } from "@/types/sns";

interface PostGridProps {
  posts: Post[];
  postsWithUser?: PostWithUser[];
}

export function PostGrid({ posts, postsWithUser }: PostGridProps) {
  const [selectedPost, setSelectedPost] = useState<PostWithUser | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-[#8e8e8e]">
        <p className="text-lg mb-2">게시물이 없습니다</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 max-w-[935px] mx-auto">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => {
              // postsWithUser에서 해당 post 찾기
              const postWithUser = postsWithUser?.find((p) => p.id === post.id);
              if (postWithUser) {
                setSelectedPost(postWithUser);
              }
            }}
            className="relative aspect-square bg-gray-100 hover:opacity-75 transition-opacity"
          >
            <img
              src={post.image_url}
              alt={post.caption || "게시물"}
              className="w-full h-full object-cover"
            />
            {/* Hover 시 좋아요/댓글 수 표시 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
              <span className="flex items-center gap-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="font-semibold">0</span>
              </span>
              <span className="flex items-center gap-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="font-semibold">0</span>
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 게시물 상세 모달 */}
      {selectedPost && (
        <Dialog
          open={!!selectedPost}
          onOpenChange={() => setSelectedPost(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 aspect-square md:aspect-auto md:h-[600px] bg-black">
                <img
                  src={selectedPost.image_url}
                  alt={selectedPost.caption || "게시물"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-full md:w-[400px] flex flex-col max-h-[600px] overflow-y-auto">
                <PostCard post={selectedPost} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
