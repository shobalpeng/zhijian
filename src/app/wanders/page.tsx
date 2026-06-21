"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { WanderCard } from "@/components/WanderCard";
import { WanderStats } from "@/components/WanderStats";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Wander {
  id: number;
  location: string;
  date: string;
  imageUrls: string[] | null;
  mood: string | null;
  creatorId: number;
}

interface Stats {
  location: string;
  count: number;
}

const PAGE_SIZE = 10;

export default function WandersPage() {
  const [items, setItems] = useState<Wander[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const searchParam = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    try {
      const res = await fetch(`/api/wanders${searchParam}`);
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
  }, [debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const displayedItems = items.slice(0, page * PAGE_SIZE);
  const hasMore = items.length > displayedItems.length;

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  return (
    <>
      <TopBar title="城市漫游" showBell={false} />
      <PullToRefresh onRefresh={load}>
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索地点..." className="pl-9" />
          </div>
        </div>
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
            <EmptyState icon="🚶" title={debouncedSearch ? "没有找到匹配的地点" : "还没有漫游记录"} description={debouncedSearch ? "换个关键词试试" : "点击下方 + 按钮记录一次城市漫步"} />
          ) : (
            <div className="space-y-0">
              {/* Stats */}
              {stats.length > 0 && (
                <div className="mb-4">
                  <WanderStats stats={stats} />
                </div>
              )}

              {/* Timeline */}
              {displayedItems.map((w, i) => (
                <WanderCard
                  key={w.id}
                  id={w.id}
                  location={w.location}
                  date={w.date}
                  imageUrls={w.imageUrls}
                  mood={w.mood}
                  isLast={i === displayedItems.length - 1}
                />
              ))}
              {hasMore && (
                <div className="pt-4 pb-2 text-center">
                  <button onClick={() => setPage(p => p + 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    查看更多（{items.length - displayedItems.length}条）
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </PullToRefresh>
    </>
  );
}
