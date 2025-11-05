/**
 * @file not-found.tsx
 * @description 404 페이지
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-[#8e8e8e] mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link href="/feed">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}

