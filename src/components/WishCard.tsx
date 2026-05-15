import Link from "next/link";
import { cn } from "@/lib/utils";

interface WishCardProps {
  id: number;
  title: string;
  points: number;
  status: string;
  creatorLabel?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "待完成",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  submitted: {
    label: "待确认",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  confirmed: {
    label: "已完成",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

export function WishCard({ id, title, points, status, creatorLabel }: WishCardProps) {
  // Map old statuses for backward compatibility
  const mappedStatus = status === "unclaimed" ? "pending" : status === "frozen" || status === "implemented" ? "submitted" : status === "completed" ? "confirmed" : status;
  const config = statusConfig[mappedStatus] ?? statusConfig.pending;

  return (
    <Link
      href={`/wishes/${id}`}
      className="block rounded-xl bg-card ring-1 ring-foreground/10 p-4 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium leading-snug truncate">{title}</h3>
          {creatorLabel && (
            <p className="text-xs text-muted-foreground mt-1">{creatorLabel}</p>
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
