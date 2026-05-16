"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { DineCard } from "@/components/DineCard";
import { DineStats } from "@/components/DineStats";
import { PullToRefresh } from "@/components/PullToRefresh";

interface Dine {
  id: number; restaurant: string; date: string; people: string | null;
  dishes: string | null; cost: number | null; rating: number | null;
  comment: string | null; imageUrl: string | null; creatorId: number;
}

interface DineStatsData {
  total: number; avgCost: number;
  topRestaurants: { name: string; count: number }[];
  count: number;
}

export default function DinesPage() {
  const [items, setItems] = useState<Dine[]>([]);
  const [stats, setStats] = useState<DineStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/dines");
      if (res.ok) { const d = await res.json(); setItems(d.dines); setStats(d.stats); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <TopBar title="聚餐记录" showBell={false} />
      <PullToRefresh onRefresh={load}>
        <div className="px-4 pt-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 rounded-xl bg-muted/50 animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3"><div className="w-3 h-3 rounded-full bg-muted/50 mt-1.5 shrink-0" /><div className="flex-1 h-24 rounded-xl bg-muted/50 animate-pulse" /></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <span className="text-4xl mb-3">🍽️</span>
              <p className="text-sm">还没有聚餐记录</p>
              <p className="text-xs text-muted-foreground/70 mt-1">点击下方 + 按钮记录一次聚餐</p>
            </div>
          ) : (
            <>
              <div className="mb-4"><DineStats stats={stats} /></div>
              {items.map((d, i) => (
                <DineCard key={d.id} id={d.id} restaurant={d.restaurant} date={d.date}
                  people={d.people} dishes={d.dishes} rating={d.rating}
                  comment={d.comment} imageUrl={d.imageUrl} cost={d.cost}
                  isLast={i === items.length - 1} />
              ))}
            </>
          )}
        </div>
      </PullToRefresh>
    </>
  );
}
