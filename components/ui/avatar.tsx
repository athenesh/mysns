"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  size = 32,
  className,
  ...props
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
    <img
      src={src}
      alt={alt}
      className={cn("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
      {...props}
    />
  );
}
