"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { NotificationItem } from "@/components/NotificationItem";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  linkType?: string | null;
  linkId?: number | null;
  isRead: number;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      fetchNotifications();
    } catch {
      // Silently fail
    }
  }

  async function markOneRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n))
    );
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Silently fail
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <>
      <TopBar title="消息中心" showBell={false} />
      <div className="px-4 py-3">
        {hasUnread && notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="w-full rounded-lg bg-muted/50 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors mb-3"
          >
            全部已读
          </button>
        )}
      </div>

      {loading ? (
        <div className="px-4"><Skeleton className="h-[72px]" count={3} /></div>
      ) : notifications.length === 0 ? (
        <EmptyState title="暂无消息" />
      ) : (
        <div className="px-4 space-y-2 pb-4">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              id={n.id}
              type={n.type}
              title={n.title}
              body={n.body}
              linkType={n.linkType}
              linkId={n.linkId}
              isRead={n.isRead}
              createdAt={n.createdAt}
              onMarkRead={markOneRead}
            />
          ))}
        </div>
      )}
    </>
  );
}
