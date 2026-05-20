"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerProps {
  urls: string[];
  index: number;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
}

export function ImageViewer({ urls, index, onClose, onChangeIndex }: ImageViewerProps) {
  const hasPrev = index > 0;
  const hasNext = index < urls.length - 1;

  const prev = useCallback(() => { if (hasPrev) onChangeIndex(index - 1); }, [hasPrev, index, onChangeIndex]);
  const next = useCallback(() => { if (hasNext) onChangeIndex(index + 1); }, [hasNext, index, onChangeIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
        <X className="h-6 w-6 text-white" />
      </button>

      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      )}

      <img src={urls[index]} alt="" className="max-w-[95vw] max-h-[90vh] object-contain select-none" onClick={(e) => e.stopPropagation()} />

      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      )}

      <div className="absolute bottom-6 text-white/70 text-sm font-medium">
        {index + 1} / {urls.length}
      </div>
    </div>
  );
}
