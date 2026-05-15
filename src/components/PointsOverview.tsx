"use client";

import { useEffect, useState } from "react";

interface PointsData {
  myPoints: number;
  partnerPoints: number;
}

export function PointsOverview() {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [togetherDays, setTogetherDays] = useState<number | null>(null);

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
          setTimeout(() => setMounted(true), 50);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/anniversaries")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const together = data.anniversaries?.find((a: { isTogether: number }) => a.isTogether === 1);
        if (together) {
          const [y, m, d] = together.date.split("-").map(Number);
          let start: Date;
          if (together.isLunar) {
            try {
              const { Lunar } = require("lunar-javascript");
              const solar = Lunar.fromYmd(y, m, d).getSolar();
              start = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
            } catch {
              start = new Date(y, m - 1, d);
            }
          } else {
            start = new Date(y, m - 1, d);
          }
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
          setTogetherDays(Math.max(0, diff));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-4">
        <div className="rounded-xl bg-muted/50 animate-pulse h-[104px]" />
      </div>
    );
  }

  if (!data) return null;

  const { myPoints, partnerPoints } = data;

  return (
    <div className="px-4 py-4">
      <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">我</span>
            <span className={`text-3xl font-bold text-primary tabular-nums transition-all duration-500 ${mounted ? "scale-100" : "scale-90 opacity-0"}`}>
              {myPoints}
            </span>
            <span className="text-xs text-muted-foreground">积分</span>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Ta</span>
            <span className={`text-3xl font-bold text-secondary-foreground tabular-nums transition-all duration-500 delay-150 ${mounted ? "scale-100" : "scale-90 opacity-0"}`}>
              {partnerPoints}
            </span>
            <span className="text-xs text-muted-foreground">积分</span>
          </div>
        </div>
        {togetherDays != null && (
          <p className="text-center text-xs text-pink-600 font-medium mt-3 pt-3 border-t">
            💕 和Ta在一起已经 {togetherDays} 天
          </p>
        )}
      </div>
    </div>
  );
}
