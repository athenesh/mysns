/**
 * @file Header.tsx
 * @description Mobile 헤더 컴포넌트 (60px 높이)
 *
 * Mobile 전용: 로고 + 알림/메시지/프로필 아이콘
 */

"use client";

import Link from "next/link";
import { Heart, MessageCircle, User } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#dbdbdb] z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold">
          Instagram
        </Link>

        {/* 우측 아이콘들 */}
        <SignedIn>
          <div className="flex items-center gap-4">
            <Link href="/activity" className="p-2">
              <Heart size={24} />
            </Link>
            <Link href="/messages" className="p-2">
              <MessageCircle size={24} />
            </Link>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
