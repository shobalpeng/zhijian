import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-3" role="status" aria-label="加载中">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("rounded-xl bg-muted/50 animate-pulse", className)}
        />
      ))}
      <span className="sr-only">加载中...</span>
    </div>
  );
}
