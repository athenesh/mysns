/**
 * @file sns.ts
 * @description SNS 애플리케이션의 TypeScript 타입 정의
 *
 * 데이터베이스 스키마와 일치하는 타입 정의
 * - User: 사용자 정보
 * - Post: 게시물
 * - Like: 응원하기 (likes 테이블)
 * - Comment: 피드백 요청 (comments 테이블)
 * - Follow: 팔로우
 * - 통계 뷰 타입 (PostStats, UserStats)
 */

export interface User {
  id: string;
  clerk_id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// 통계 뷰 타입
export interface PostStats {
  post_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export interface UserStats {
  user_id: string;
  clerk_id: string;
  name: string;
  avatar_url: string | null;
  posts_count: number;
  followers_count: number;
  following_count: number;
}

// 게시물과 사용자 정보를 함께 포함하는 타입
export interface PostWithUser extends Post {
  user: User;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

// 댓글과 사용자 정보를 함께 포함하는 타입
export interface CommentWithUser extends Comment {
  user: User;
}

// 프로필 정보 타입
export interface Profile extends User {
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_own_profile: boolean;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}
