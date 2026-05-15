"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export function PendingCard() {
  const [count, setCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings?pending=true")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCount(data.count ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) {
    return (
      <div className="px-4 py-2">
        <div className="rounded-xl bg-muted/50 animate-pulse h-[72px]" />
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <button
        onClick={() => router.push("/pending")}
        className="w-full rounded-xl bg-card ring-1 ring-foreground/10 p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-medium">待处理</span>
        </div>
        <span
          className={
            count > 0
              ? "flex items-center justify-center min-w-[28px] h-7 rounded-full bg-orange-500 text-white text-xs font-bold px-1.5"
              : "text-sm text-muted-foreground"
          }
        >
          {count > 0 ? (count > 99 ? "99+" : count) : "无"}
        </span>
      </button>
    </div>
  );
}
