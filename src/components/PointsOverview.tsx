"use client";

import { useEffect, useState } from "react";

interface PointsData {
  myPoints: number;
  partnerPoints: number;
}

export function PointsOverview() {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings?points=true")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-4">
        <div className="rounded-xl bg-muted/50 animate-pulse h-[104px]" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { myPoints, partnerPoints } = data;

  return (
    <div className="px-4 py-4">
      <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
        {/* Points side by side */}
        <div className="flex items-center justify-around mb-3">
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">我</span>
            <span className="text-3xl font-bold text-primary tabular-nums">
              {myPoints}
            </span>
            <span className="text-xs text-muted-foreground">积分</span>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Ta</span>
            <span className="text-3xl font-bold text-secondary-foreground tabular-nums">
              {partnerPoints}
            </span>
            <span className="text-xs text-muted-foreground">积分</span>
          </div>
        </div>

      </div>
    </div>
  );
}
