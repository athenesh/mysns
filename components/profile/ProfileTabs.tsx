/**
 * @file ProfileTabs.tsx
 * @description 프로필 페이지 탭 컴포넌트
 *
 * [게시물] [릴스] [태그됨] 탭 UI
 * 현재는 게시물 탭만 활성화 (릴스, 태그됨은 향후 기능)
 */

"use client";

import type { TabType } from "./ProfileHeader";

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  postsCount: number;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  postsCount,
}: ProfileTabsProps) {
  return (
    <div className="border-t border-[#dbdbdb]">
      <div className="max-w-[935px] mx-auto flex items-center justify-center">
        <button
          onClick={() => onTabChange("posts")}
          className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold uppercase tracking-wider relative ${
            activeTab === "posts"
              ? "text-[#262626]"
              : "text-[#8e8e8e] hover:text-[#262626]"
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={activeTab === "posts" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 3v18" />
          </svg>
          <span>게시물</span>
          {activeTab === "posts" && (
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#262626]" />
          )}
        </button>

        <button
          onClick={() => onTabChange("reels")}
          disabled
          className="flex items-center gap-2 px-4 py-4 text-sm font-semibold uppercase tracking-wider text-[#8e8e8e] cursor-not-allowed opacity-50"
          title="향후 구현 예정"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21l4-4 4 4M12 17v4" />
          </svg>
          <span>릴스</span>
        </button>

        <button
          onClick={() => onTabChange("tagged")}
          disabled
          className="flex items-center gap-2 px-4 py-4 text-sm font-semibold uppercase tracking-wider text-[#8e8e8e] cursor-not-allowed opacity-50"
          title="향후 구현 예정"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span>태그됨</span>
        </button>
      </div>
    </div>
  );
}

