import Link from "next/link";
import { MapPin, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface DineCardProps {
  id: number;
  restaurant: string;
  date: string;
  people?: string | null;
  dishes?: string | null;
  rating?: number | null;
  comment?: string | null;
  imageUrl?: string | null;
  cost?: number | null;
  isLast?: boolean;
}

export function DineCard({ id, restaurant, date, people, rating, comment, imageUrl, cost, isLast }: DineCardProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
      </div>
      <Link href={`/dines/${id}/edit`} className={`flex-1 min-w-0 rounded-xl bg-card ring-1 ring-foreground/10 hover:bg-muted/30 transition-colors overflow-hidden ${!isLast ? "mb-4" : ""}`}>
        {imageUrl && <div className="h-40 bg-muted"><img src={imageUrl} alt="" className="w-full h-full object-cover" /></div>}
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm truncate">{restaurant}</span>
            </div>
            {rating && (
              <span className="shrink-0 inline-flex items-center gap-0.5 text-xs text-amber-500">
                <Star className="h-3 w-3 fill-amber-400" />
                {rating}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
          {people && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Users className="h-3 w-3" />{people}
            </p>
          )}
          {cost && <p className="text-xs text-muted-foreground mt-0.5">人均 ¥{cost}</p>}
          {comment && <p className="text-sm text-muted-foreground mt-1 italic">"{comment}"</p>}
        </div>
      </Link>
    </div>
  );
}
