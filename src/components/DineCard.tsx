"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Users, Star } from "lucide-react";
import { ImageViewer } from "@/components/ImageViewer";

interface DineCardProps {
  id: number;
  restaurant: string;
  date: string;
  people?: string | null;
  peopleCount?: number | null;
  dishes?: string | null;
  rating?: number | null;
  comment?: string | null;
  imageUrls?: string[] | null;
  cost?: number | null;
  isLast?: boolean;
}

function ImageGrid({ urls, onOpen }: { urls: string[]; onOpen: (i: number) => void }) {
  return (
    <div className="relative">
      <button type="button" onClick={(e) => { e.preventDefault(); onOpen(0); }} className="w-full bg-muted overflow-hidden hover:opacity-90 transition-opacity">
        <img src={urls[0]} alt="" className="w-full object-cover max-h-64" style={{ height: 'auto' }} />
      </button>
      {urls.length > 1 && (
        <button type="button" onClick={(e) => { e.preventDefault(); onOpen(0); }} className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          共 {urls.length} 张
        </button>
      )}
    </div>
  );
}

export function DineCard({ id, restaurant, date, people, peopleCount, rating, comment, imageUrls, cost, isLast }: DineCardProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const urls = imageUrls ?? [];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
      </div>
      <Link href={`/dines/${id}/edit`} className={`flex-1 min-w-0 rounded-xl bg-card ring-1 ring-foreground/10 hover:bg-muted/30 transition-colors overflow-hidden ${!isLast ? "mb-4" : ""}`}>
        {urls.length > 0 && (
          <ImageGrid urls={urls} onOpen={setViewerIndex} />
        )}
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
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 break-all">
              <Users className="h-3 w-3 shrink-0" />{people}{peopleCount != null && <span className="shrink-0 text-muted-foreground/70">· {peopleCount}人</span>}
            </p>
          )}
          {cost && <p className="text-xs text-muted-foreground mt-0.5">总价 ¥{cost}元{peopleCount && peopleCount > 0 ? ` · 人均 ¥${(cost / peopleCount).toFixed(1)}元` : ""}</p>}
          {comment && <p className="text-sm text-muted-foreground mt-1 italic">"{comment}"</p>}
        </div>
      </Link>

      {viewerIndex !== null && (
        <ImageViewer urls={urls} index={viewerIndex} onClose={() => setViewerIndex(null)} onChangeIndex={setViewerIndex} />
      )}
    </div>
  );
}
