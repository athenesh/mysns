import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // 루트 경로 제외하고 필요한 경로만
    '/feed/:path*',
    '/feed/profile/:path*',
    '/api/:path*',
  ],
};