"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface PendingData {
  count: number;
  pendingTasks: number;
  submittedTasks: number;
  pendingWishes: number;
  submittedWishes: number;
}

export function PendingCard() {
  const [data, setData] = useState<PendingData | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings?pending=true")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => { cancelled = true; };
  }, []);

  if (!data) {
    return (
      <div className="px-4 py-2">
        <div className="rounded-xl bg-muted/50 animate-pulse h-[72px]" />
      </div>
    );
  }

  const parts: string[] = [];
  if (data.pendingTasks > 0) parts.push(`${data.pendingTasks}个任务待完成`);
  if (data.submittedTasks > 0) parts.push(`${data.submittedTasks}个任务待确认`);
  if (data.pendingWishes > 0) parts.push(`${data.pendingWishes}个心愿待实现`);
  if (data.submittedWishes > 0) parts.push(`${data.submittedWishes}个心愿待确认`);

  return (
    <div className="px-4 py-2">
      <button
        onClick={() => router.push("/pending")}
        className="w-full rounded-xl bg-card ring-1 ring-foreground/10 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">待处理</span>
            {data.count > 0 && (
              <span className="flex items-center justify-center min-w-[22px] h-5 rounded-full bg-orange-500 text-white text-xs font-bold px-1.5">
                {data.count > 99 ? "99+" : data.count}
              </span>
            )}
          </div>
        </div>
        {parts.length > 0 ? (
          <p className="text-xs text-muted-foreground ml-6">{parts.join(" · ")}</p>
        ) : (
          <p className="text-xs text-muted-foreground ml-6">暂无待处理事项</p>
        )}
      </button>
    </div>
  );
}
