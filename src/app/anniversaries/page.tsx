"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { AnniversaryCard } from "@/components/AnniversaryCard";
import { PullToRefresh } from "@/components/PullToRefresh";

interface Anniversary {
  id: number;
  name: string;
  date: string;
  note: string | null;
  isLunar: number;
  isTogether: number;
  userId: number;
}

export default function AnniversariesPage() {
  const [items, setItems] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <TopBar title="纪念日" showBell={false} />
      <PullToRefresh onRefresh={load}>
        <div className="px-4 pt-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[72px] rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <span className="text-4xl mb-3">💝</span>
              <p className="text-sm">还没有添加纪念日</p>
              <p className="text-xs text-muted-foreground/70 mt-1">点击下方 + 按钮添加第一个纪念日</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((a) => (
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
          )}
        </div>
      </PullToRefresh>
    </>
  );
}
