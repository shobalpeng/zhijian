"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ArrowLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  showBell?: boolean;
  showBack?: boolean;
}

export function TopBar({ title, showBell = true, showBack = true }: TopBarProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!showBell) return;

    let cancelled = false;
    fetch("/api/notifications?unread=true")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setUnreadCount(data.count ?? data.length ?? 0);
        }
      })
      .catch(() => {
        // Silently fail — notifications are non-critical
      });

    return () => {
      cancelled = true;
    };
  }, [showBell]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-1">
        {showBack && (
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="inline-flex items-center justify-center h-11 w-11 -ml-2 rounded-md hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="返回"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {showBell && (
        <Link
          href="/notifications"
          className="relative inline-flex items-center justify-center h-11 w-11 rounded-md hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="消息通知"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] rounded-full bg-destructive text-destructive-foreground text-[0.625rem] font-bold leading-none px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      )}
    </header>
  );
}
