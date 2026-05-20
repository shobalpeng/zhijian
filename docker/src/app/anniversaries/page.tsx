"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { AnniversaryCard } from "@/components/AnniversaryCard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";

interface Anniversary {
  id: number;
  name: string;
  date: string;
  note: string | null;
  isLunar: number;
  isTogether: number;
  userId: number;
}

const PAGE_SIZE = 10;

export default function AnniversariesPage() {
  const [items, setItems] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/anniversaries");
      if (res.ok) {
        const data = await res.json();
        setItems(data.anniversaries);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const displayedItems = items.slice(0, page * PAGE_SIZE);
  const hasMore = items.length > displayedItems.length;

  return (
    <>
      <TopBar title="纪念日" showBell={false} />
      <PullToRefresh onRefresh={load}>
        <div className="px-4 pt-4 pb-4">
          {loading ? (
            <Skeleton className="h-[72px]" count={3} />
          ) : items.length === 0 ? (
            <EmptyState icon="💝" title="还没有添加纪念日" description="点击下方 + 按钮添加第一个纪念日" />
          ) : (
            <><div className="space-y-3">
              {displayedItems.map((a) => (
                <AnniversaryCard
                  key={a.id}
                  id={a.id}
                  name={a.name}
                  date={a.date}
                  note={a.note}
                  isLunar={a.isLunar}
                  isTogether={a.isTogether}
                />
              ))}
            </div>
            {hasMore && (
              <div className="pt-4 pb-2 text-center">
                <button onClick={() => setPage(p => p + 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  查看更多（{items.length - displayedItems.length}条）
                </button>
              </div>
            )}</>
          )}
        </div>
      </PullToRefresh>
    </>
  );
}
