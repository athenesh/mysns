"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function Avatar({
  src,
  alt = "Avatar",
  size = 32,
  className,
  priority = false,
}: AvatarProps) {
  const [error, setError] = React.useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-200 rounded-full overflow-hidden",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <User size={size * 0.6} className="text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
      priority={priority}
      unoptimized={!src.startsWith("http")}
    />
  );
}
