"use client";

import { PostFeed } from "./PostFeed";
import type { PostWithUser, PaginatedResponse } from "@/types/sns";

interface PostFeedWrapperProps {
  initialPosts: PaginatedResponse<PostWithUser>;
}

export function PostFeedWrapper({ initialPosts }: PostFeedWrapperProps) {
  return <PostFeed initialPosts={initialPosts} />;
}