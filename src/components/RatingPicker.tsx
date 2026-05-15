"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingPickerProps {
  value: number | null;
  onChange: (rating: number | null) => void;
}

export function RatingPicker({ value, onChange }: RatingPickerProps) {
  const [hover, setHover] = useState<number | null>(null);

  const display = hover ?? value ?? 0;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          onMouseEnter={() => setHover(star)}
          className="p-0.5 transition-colors"
        >
          <Star
            className={cn(
              "h-7 w-7",
              star <= display
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
