"use client";

import { useState, useRef, useEffect } from "react";
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

function ImageCarousel({ urls, onOpen }: { urls: string[]; onOpen: (i: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const hasDragged = useRef(false);
  const draggingRef = useRef(false);

  const getContainerWidth = () => containerRef.current?.offsetWidth ?? 1;

  // Native touchmove listener with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const diff = touch.clientX - startX.current;
      if (Math.abs(diff) > 10) {
        hasDragged.current = true;
        e.preventDefault();
      }
      setOffsetX(diff);
    };
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, []);

  const beginDrag = (clientX: number) => {
    startX.current = clientX;
    hasDragged.current = false;
    draggingRef.current = true;
    setIsDragging(true);
  };

  const moveDrag = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX.current;
    if (Math.abs(diff) > 10) hasDragged.current = true;
    setOffsetX(diff);
  };

  const endDrag = () => {
    setIsDragging(false);
    draggingRef.current = false;
    if (hasDragged.current) {
      const threshold = getContainerWidth() * 0.2;
      if (Math.abs(offsetX) > threshold) {
        if (offsetX > 0 && currentIndex > 0) {
          setCurrentIndex(i => i - 1);
        } else if (offsetX < 0 && currentIndex < urls.length - 1) {
          setCurrentIndex(i => i + 1);
        }
      }
    }
    setOffsetX(0);
  };

  const translateX = isDragging
    ? -(currentIndex * 100) + (offsetX / getContainerWidth()) * 100
    : -(currentIndex * 100);

  return (
    <div>
      <div
        ref={containerRef}
        className="relative overflow-hidden select-none touch-pan-y"
        onTouchStart={(e) => beginDrag(e.touches[0].clientX)}
        onTouchEnd={endDrag}
        onMouseDown={(e) => beginDrag(e.clientX)}
        onMouseMove={(e) => isDragging && moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={() => { if (isDragging) endDrag(); }}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: isDragging ? 'none' : 'transform 300ms ease-out',
          }}
        >
          {urls.map((url, i) => (
            <button
              key={i}
              type="button"
              className="w-full shrink-0 bg-muted focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                if (hasDragged.current) {
                  hasDragged.current = false;
                  return;
                }
                onOpen(i);
              }}
            >
              <img src={url} alt="" className="w-full object-cover max-h-64" style={{ height: 'auto' }} draggable={false} />
            </button>
          ))}
        </div>
      </div>

      {urls.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-primary w-5 h-2'
                  : 'bg-muted-foreground/30 w-2 h-2 hover:bg-muted-foreground/50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(i);
              }}
            />
          ))}
        </div>
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
          <ImageCarousel urls={urls} onOpen={setViewerIndex} />
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
          {comment && <p className="text-sm text-muted-foreground mt-1">"{comment}"</p>}
        </div>
      </Link>

      {viewerIndex !== null && (
        <ImageViewer urls={urls} index={viewerIndex} onClose={() => setViewerIndex(null)} onChangeIndex={setViewerIndex} />
      )}
    </div>
  );
}
