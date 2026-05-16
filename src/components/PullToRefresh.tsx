"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 60;

  const canPull = () => {
    return containerRef.current && containerRef.current.scrollTop === 0;
  };

  const handlePullStart = useCallback((clientY: number) => {
    if (canPull()) {
      startY.current = clientY;
      pulling.current = true;
    }
  }, []);

  const handlePullMove = useCallback((clientY: number) => {
    if (!pulling.current) return;
    const dy = clientY - startY.current;
    if (dy > 0) {
      setPullDistance(Math.min(dy * 0.4, 120));
    }
  }, []);

  const handlePullEnd = useCallback(async () => {
    if (pullDistance > THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    pulling.current = false;
  }, [pullDistance, refreshing, onRefresh]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handlePullStart(e.touches[0].clientY);
  }, [handlePullStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handlePullMove(e.touches[0].clientY);
  }, [handlePullMove]);

  const handleTouchEnd = useCallback(() => {
    handlePullEnd();
  }, [handlePullEnd]);

  // Mouse events (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handlePullStart(e.clientY);
  }, [handlePullStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handlePullMove(e.clientY);
  }, [handlePullMove]);

  const handleMouseUp = useCallback(() => {
    handlePullEnd();
  }, [handlePullEnd]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="min-h-full select-none"
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance }}
      >
        {refreshing ? (
          <Loader2 className="h-5 w-5 animate-spin-refresh text-muted-foreground" />
        ) : pullDistance > 30 ? (
          <span className="text-xs text-muted-foreground">释放刷新</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
