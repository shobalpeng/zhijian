"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { WanderCard } from "@/components/WanderCard";
import { WanderStats } from "@/components/WanderStats";
import { PullToRefresh } from "@/components/PullToRefresh";

interface Wander {
  id: number;
  location: string;
  date: string;
  imageUrl: string | null;
  mood: string | null;
  creatorId: number;
}

interface Stats {
  location: string;
  count: number;
}

export default function WandersPage() {
  const [items, setItems] = useState<Wander[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/wanders");
      if (res.ok) {
        const data = await res.json();
        setItems(data.wanders);
        setStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <TopBar title="城市漫游" showBell={false} />
      <PullToRefresh onRefresh={load}>
        <div className="px-4 pt-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 rounded-xl bg-muted/50 animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-3 h-3 rounded-full bg-muted/50 mt-1.5 shrink-0" />
                  <div className="flex-1 h-24 rounded-xl bg-muted/50 animate-pulse" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <span className="text-4xl mb-3">🚶</span>
              <p className="text-sm">还没有漫游记录</p>
              <p className="text-xs text-muted-foreground/70 mt-1">点击下方 + 按钮记录一次城市漫步</p>
            </div>
          ) : (
            <div className="space-y-0">
              {/* Stats */}
              {stats.length > 0 && (
                <div className="mb-4">
                  <WanderStats stats={stats} />
                </div>
              )}

              {/* Timeline */}
              {items.map((w, i) => (
                <WanderCard
                  key={w.id}
                  id={w.id}
                  location={w.location}
                  date={w.date}
                  imageUrl={w.imageUrl}
                  mood={w.mood}
                  isLast={i === items.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>
    </>
  );
}
