"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, string> = {
  task_assigned: "📋",
  task_submitted: "✅",
  task_confirmed: "🎉",
  wish_created: "💝",
  wish_exchanged: "🔄",
  wish_implemented: "✨",
  wish_confirmed: "🎊",
  wish_negotiation: "💬",
  wish_accepted: "🤝",
  wish_cancelled: "❌",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
}

interface NotificationItemProps {
  id: number;
  type: string;
  title: string;
  body: string;
  linkType?: string | null;
  linkId?: number | null;
  isRead: number;
  createdAt: string;
  onMarkRead?: (id: number) => void;
}

export function NotificationItem({
  id,
  type,
  title,
  body,
  linkType,
  linkId,
  isRead,
  createdAt,
  onMarkRead,
}: NotificationItemProps) {
  const icon = typeIcons[type] ?? "🔔";
  const unread = !isRead;

  const href =
    linkType && linkId
      ? linkType === "task"
        ? `/tasks/${linkId}`
        : `/wishes/${linkId}`
      : null;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl transition-colors hover:bg-muted/30",
        unread && "bg-muted/30 ring-1 ring-primary/10"
      )}
    >
      <span className="text-xl mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium leading-snug">{title}</h4>
          <div className="flex items-center gap-2 shrink-0">
            {unread && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {relativeTime(createdAt)}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block"
        onClick={() => {
          if (unread && onMarkRead) onMarkRead(id);
        }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
