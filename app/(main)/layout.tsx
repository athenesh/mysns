/**
 * @file layout.tsx
 * @description 메인 레이아웃 (Sidebar + Header + BottomNav)
 *
 * 반응형 레이아웃:
 * - Desktop (1024px+): Sidebar (244px) + Main Content
 * - Tablet (768px-1023px): Sidebar (72px, 아이콘만) + Main Content
 * - Mobile (< 768px): Header + Main Content + BottomNav
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({
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
