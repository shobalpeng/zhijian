import Link from "next/link";
import { Star, ChefHat } from "lucide-react";

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
      className="block rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden hover:ring-foreground/30 hover:shadow-md transition-all group"
    >
      {/* Cover image */}
      <div className="relative h-32 bg-muted overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground/40">
            🍳
          </div>
        )}
        {/* Gradient overlay at bottom */}
        {imageUrl && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        )}

        {/* Floating badges at top-right */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-xs font-medium text-foreground">
            <ChefHat className="h-3 w-3" />
            {cookCount}次
          </span>
          {avgRating != null && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-xs font-medium text-amber-600">
              <Star className="h-3 w-3 fill-amber-500" />
              {avgRating}
            </span>
          )}
        </div>
      </div>

      {/* Info below image */}
      <div className="p-3">
        <h3 className="text-sm font-medium truncate">{title}</h3>
        {lastCookedAt && (
          <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(lastCookedAt)}做过</p>
        )}
      </div>
    </Link>
  );
}
