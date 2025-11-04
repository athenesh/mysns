"use client";

export function PostFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white border border-[#dbdbdb] rounded-lg animate-pulse"
        >
          <div className="h-[60px] bg-gray-200" />
          <div className="aspect-square bg-gray-200" />
          <div className="h-[48px] bg-gray-200" />
          <div className="h-32 bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
