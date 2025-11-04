/**
 * @file Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * Desktop: 244px 너비, 아이콘 + 텍스트
 * Tablet: 72px 너비, 아이콘만 표시
 * Mobile: 숨김 (BottomNav 사용)
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/post/CreatePostModal";

type MenuItem = {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    fill?: string;
  }>;
  label: string;
  href: string;
  isAction?: boolean;
  getHref?: (user: any) => string;
};

const menuItems: MenuItem[] = [
  { icon: Home, label: "홈", href: "/" },
  { icon: Search, label: "검색", href: "/search" },
  { icon: PlusSquare, label: "만들기", href: "#", isAction: true },
  { icon: Heart, label: "활동", href: "/activity" },
  {
    icon: User,
    label: "프로필",
    href: "#",
    getHref: (user) => (user ? `/profile/${user.id}` : "/profile"),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-[#dbdbdb] z-40">
      {/* Desktop: 244px */}
      <div className="w-[244px] flex flex-col h-full px-4 pt-4">
        {/* 로고 */}
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-bold">Instagram</h1>
        </div>

        {/* 메뉴 아이템 */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const href = item.getHref ? item.getHref(user) : item.href;
            const isActive = pathname === href;

            if (item.isAction) {
              return (
                <button
                  key={item.href}
                  onClick={() => setCreatePostOpen(true)}
                  className={`flex items-center gap-4 px-2 py-3 rounded-lg transition-colors w-full text-left ${
                    isActive ? "font-semibold" : "hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    size={24}
                    className={isActive ? "stroke-[2.5]" : ""}
                    fill={isActive ? "currentColor" : "none"}
                  />
                  <span className="text-base">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={href}
                className={`flex items-center gap-4 px-2 py-3 rounded-lg transition-colors ${
                  isActive ? "font-semibold" : "hover:bg-gray-50"
                }`}
              >
                <Icon
                  size={24}
                  className={isActive ? "stroke-[2.5]" : ""}
                  fill={isActive ? "currentColor" : "none"}
                />
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 로그인 버튼 (로그아웃 상태) */}
        <SignedOut>
          <div className="px-2 pb-4">
            <SignInButton mode="modal">
              <Button className="w-full">로그인</Button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>

      {/* Tablet: 72px (아이콘만) */}
      <div className="w-[72px] hidden lg:hidden xl:flex flex-col h-full px-2 pt-4">
        <div className="mb-8 flex justify-center">
          <h1 className="text-xl font-bold">IG</h1>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const href = item.getHref ? item.getHref(user) : item.href;
            const isActive = pathname === href;

            if (item.isAction) {
              return (
                <button
                  key={item.href}
                  onClick={() => setCreatePostOpen(true)}
                  className={`flex items-center justify-center p-3 rounded-lg transition-colors w-full ${
                    isActive ? "font-semibold" : "hover:bg-gray-50"
                  }`}
                  title={item.label}
                >
                  <Icon
                    size={24}
                    className={isActive ? "stroke-[2.5]" : ""}
                    fill={isActive ? "currentColor" : "none"}
                  />
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={href}
                className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                  isActive ? "font-semibold" : "hover:bg-gray-50"
                }`}
                title={item.label}
              >
                <Icon
                  size={24}
                  className={isActive ? "stroke-[2.5]" : ""}
                  fill={isActive ? "currentColor" : "none"}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </aside>
  );
}
