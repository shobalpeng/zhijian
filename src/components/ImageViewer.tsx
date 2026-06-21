"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90" />

      <div className="absolute inset-0 flex items-center justify-center">
        <img src={urls[index]} alt="" className="max-w-[95vw] max-h-[90dvh] object-contain select-none" onClick={(e) => e.stopPropagation()} />
      </div>

      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
        <X className="h-6 w-6 text-white" />
      </button>

      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors shadow-lg shadow-black/20">
          <ChevronLeft className="h-7 w-7 text-white" />
        </button>
      )}

      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors shadow-lg shadow-black/20">
          <ChevronRight className="h-7 w-7 text-white" />
        </button>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
        {index + 1} / {urls.length}
      </div>
    </div>,
    document.body
  );
}
