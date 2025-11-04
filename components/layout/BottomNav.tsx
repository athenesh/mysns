/**
 * @file BottomNav.tsx
 * @description Mobile 하단 네비게이션 (50px 높이)
 *
 * Mobile 전용: 5개 아이콘 (홈, 검색, 만들기, 활동, 프로필)
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { CreatePostModal } from "@/components/post/CreatePostModal";

const navItems = [
  { icon: Home, href: "/", isAction: false },
  { icon: Search, href: "/search", isAction: false },
  { icon: PlusSquare, href: "#", isAction: true },
  { icon: Heart, href: "/activity", isAction: false },
  {
    icon: User,
    href: "#",
    isAction: false,
    getHref: (user: any) => (user ? `/profile/${user.id}` : "/profile"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#dbdbdb] z-50">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = item.getHref ? item.getHref(user) : item.href;
          const isActive = pathname === href;

          if (item.isAction) {
            return (
              <button
                key={item.href}
                onClick={() => setCreatePostOpen(true)}
                className="flex items-center justify-center p-2"
                aria-label="게시물 만들기"
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
              className="flex items-center justify-center p-2"
            >
              <Icon
                size={24}
                className={isActive ? "stroke-[2.5]" : ""}
                fill={isActive ? "currentColor" : "none"}
              />
            </Link>
          );
        })}
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </nav>
  );
}
