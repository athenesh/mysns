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
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          cursor &&
          !error
        ) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [cursor, hasMore, loading, error]);

  const loadMore = async () => {
    if (!cursor || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getPosts(cursor);

      if (result.data.length > 0) {
        setPosts((prev) => [...prev, ...result.data]);
        setCursor(result.next_cursor);
        setHasMore(result.has_more);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
      setError(
        err instanceof Error
          ? err.message
          : "게시물을 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (deletedPostId: string) => {
    console.group("PostFeed: handleDelete");
    console.log("Removing post from feed:", deletedPostId);

    setPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== deletedPostId);
      console.log("Posts updated:", prev.length, "→", filtered.length);
      return filtered;
    });

    console.groupEnd();
  };

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          priority={index === 0}
          onDelete={() => handleDelete(post.id)}
        />
      ))}

      {/* 무한 스크롤 트리거 */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="h-20 flex flex-col items-center justify-center gap-2"
        >
          {loading && <div className="text-sm text-[#8e8e8e]">로딩 중...</div>}
          {error && (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={loadMore}
                className="text-sm text-[#0095f6] hover:opacity-50"
              >
                다시 시도
              </button>
            </div>
          )}
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
