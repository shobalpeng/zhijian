"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { DineCard } from "@/components/DineCard";
import { DineStats } from "@/components/DineStats";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Dine {
  id: number; restaurant: string; date: string; people: string | null;
  dishes: string | null; cost: number | null; rating: number | null; peopleCount: number | null;
  comment: string | null; imageUrls: string[] | null; creatorId: number;
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const searchParam = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    try {
      const res = await fetch(`/api/dines${searchParam}`);
      if (res.ok) { const d = await res.json(); setItems(d.dines); setStats(d.stats); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <TopBar title="聚餐记录" showBell={false} />
      <PullToRefresh onRefresh={load}>
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索餐厅或参与人..." className="pl-9" />
          </div>
        </div>
        <div className="px-4 pt-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 rounded-xl bg-muted/50 animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3"><div className="w-3 h-3 rounded-full bg-muted/50 mt-1.5 shrink-0" /><div className="flex-1 h-24 rounded-xl bg-muted/50 animate-pulse" /></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon="🍽️" title={debouncedSearch ? "没有找到匹配的餐厅" : "还没有聚餐记录"} description={debouncedSearch ? "换个关键词试试" : "点击下方 + 按钮记录一次聚餐"} />
          ) : (
            <>
              <div className="mb-4"><DineStats stats={stats} /></div>
              {items.map((d, i) => (
                <DineCard key={d.id} id={d.id} restaurant={d.restaurant} date={d.date}
                  people={d.people} peopleCount={d.peopleCount} dishes={d.dishes} rating={d.rating}
                  comment={d.comment} imageUrls={d.imageUrls} cost={d.cost}
                  isLast={i === items.length - 1} />
              ))}
            </>
          )}
        </div>
      </PullToRefresh>
    </>
  );
}
