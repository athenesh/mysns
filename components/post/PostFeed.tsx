/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트 (무한 스크롤)
 *
 * Intersection Observer를 사용한 무한 스크롤 구현
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { PostCard } from "./PostCard";
import { getPosts } from "@/actions/post";
import type { PostWithUser, PaginatedResponse } from "@/types/sns";

interface PostFeedProps {
  initialPosts: PaginatedResponse<PostWithUser>;
}

export function PostFeed({ initialPosts }: PostFeedProps) {
  const [posts, setPosts] = useState<PostWithUser[]>(initialPosts.data);
  const [cursor, setCursor] = useState<string | null>(initialPosts.next_cursor);
  const [hasMore, setHasMore] = useState(initialPosts.has_more);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && cursor) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [cursor, hasMore, loading]);

  const loadMore = async () => {
    if (!cursor || loading) return;

    setLoading(true);
    const result = await getPosts(cursor);

    if (result.data.length > 0) {
      setPosts((prev) => [...prev, ...result.data]);
      setCursor(result.next_cursor);
      setHasMore(result.has_more);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* 무한 스크롤 트리거 */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
        >
          {loading && <div className="text-sm text-[#8e8e8e]">로딩 중...</div>}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center text-sm text-[#8e8e8e] py-8">
          더 이상 게시물이 없습니다
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center text-[#8e8e8e] py-16">
          <p className="text-lg mb-2">게시물이 없습니다</p>
          <p className="text-sm">첫 게시물을 만들어보세요!</p>
        </div>
      )}
    </div>
  );
}
