"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { ItemCard } from "@/components/ItemCard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";

interface Item { id: number; name: string; date: string; price: number; category: string | null; status: string; retiredDate?: string | null; imageUrl: string | null; }

export default function ItemsPage() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const load = useCallback(async () => {
    try { const r = await fetch(`/api/items?status=${filter}`); if (r.ok) { const d = await r.json(); setData(d.items); } } catch {} finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  // Sort by daily cost descending
  const sorted = [...data].sort((a, b) => {
    const endA = a.status === "retired" && a.retiredDate ? new Date(a.retiredDate + "T00:00:00") : new Date();
    const endB = b.status === "retired" && b.retiredDate ? new Date(b.retiredDate + "T00:00:00") : new Date();
    const da = a.price / Math.max(1, Math.floor((endA.getTime() - new Date(a.date + "T00:00:00").getTime()) / 86400000));
    const db2 = b.price / Math.max(1, Math.floor((endB.getTime() - new Date(b.date + "T00:00:00").getTime()) / 86400000));
    return db2 - da;
  });

  return (
    <>
      <TopBar title="日均成本" showBell={false} />
      <div className="flex gap-1 px-4 pt-3 pb-1">
        {[{k:"all",l:"全部"},{k:"active",l:"服役中"},{k:"retired",l:"已退役"}].map(t => (
          <button key={t.k} onClick={() => { setFilter(t.k); setLoading(true); }}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", filter===t.k ? "bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/70")}>{t.l}</button>
        ))}
      </div>
      <PullToRefresh onRefresh={load}>
        <div className="px-4 pt-4 pb-4">
          {loading ? <Skeleton className="h-[80px]" count={3} />
          : sorted.length === 0 ? <EmptyState icon="📊" title="还没有物品" description="点击下方 + 按钮添加大件物品" />
          : <div className="space-y-3">{sorted.map(item => <ItemCard key={item.id} {...item} />)}</div>}
        </div>
      </PullToRefresh>
    </>
  );
}
