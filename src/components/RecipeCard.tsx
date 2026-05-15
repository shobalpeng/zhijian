import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  id: number;
  title: string;
  imageUrl?: string | null;
  cookCount: number;
  avgRating?: number | null;
  lastCookedAt?: string | null;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min}分钟前`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}周前`;
  const months = Math.floor(days / 30);
  return `${months}个月前`;
}

export function RecipeCard({ id, title, imageUrl, cookCount, avgRating, lastCookedAt }: RecipeCardProps) {
  return (
    <Link
      href={`/recipes/${id}`}
      className="flex gap-3 rounded-xl bg-card ring-1 ring-foreground/10 p-3 hover:bg-muted/30 transition-colors"
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 rounded-lg bg-muted overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground">
            🍳
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <h3 className="text-sm font-medium truncate">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>已做 {cookCount} 次</span>
          {avgRating != null && (
            <span className="inline-flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-amber-500" />
              {avgRating}
            </span>
          )}
        </div>
        {lastCookedAt && (
          <p className="text-xs text-muted-foreground/70">{relativeTime(lastCookedAt)}做过</p>
        )}
      </div>
    </Link>
  );
}
