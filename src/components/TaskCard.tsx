import Link from "next/link";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: number;
  title: string;
  points: number;
  status: string;
  creatorLabel?: string;
  createdAt?: string;
  submittedAt?: string | null;
}

function relativeTime(iso?: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "待完成",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  submitted: {
    label: "待确认",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  confirmed: {
    label: "已完成",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

export function TaskCard({ id, title, points, status, creatorLabel, createdAt, submittedAt }: TaskCardProps) {
  const config = statusConfig[status] ?? statusConfig.pending;

  return (
    <Link
      href={`/tasks/${id}`}
      className="block rounded-xl bg-card ring-1 ring-foreground/10 p-4 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium leading-snug truncate">{title}</h3>
          {creatorLabel && (
            <p className="text-xs text-muted-foreground mt-0.5">{creatorLabel}</p>
          )}
          {(createdAt || submittedAt) && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {relativeTime(submittedAt || createdAt)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-primary tabular-nums">
            {points} 分
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              config.className
            )}
          >
            {config.label}
          </span>
        </div>
      </div>
    </Link>
  );
}
