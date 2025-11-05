"use client";

/**
 * @file layout.tsx
 * @description 프로필 페이지 레이아웃 (Sidebar + Header + BottomNav)
 *
 * feed 레이아웃과 동일한 구조 사용
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Desktop/Tablet Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <Header />

      {/* Main Content */}
      <main className="md:ml-[244px] lg:ml-[72px] xl:ml-[244px] pt-0 md:pt-0 pb-[50px] md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}

