/**
 * @file FeedbackForm.tsx
 * @description 피드백 작성 폼 컴포넌트
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createFeedback } from "@/actions/feedback";
import { Loader2 } from "lucide-react";

interface FeedbackFormProps {
  postId: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ postId, onSuccess }: FeedbackFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    const result = await createFeedback(postId, content);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setContent("");
    setLoading(false);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#dbdbdb] p-4">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="피드백 요청..."
          maxLength={1000}
          rows={1}
          className="resize-none flex-1 min-h-[40px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={!content.trim() || loading} size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "게시"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
}
