import Link from "next/link";

interface AnniversaryCardProps {
  id: number;
  name: string;
  date: string;
  note?: string | null;
  isLunar: number;
  isTogether: number;
}

function getRelativeDays(dateStr: string): { text: string; isToday: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(dateStr + "T00:00:00");
  const thisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate());

  if (
    thisYear.getDate() === today.getDate() &&
    thisYear.getMonth() === today.getMonth() &&
    thisYear.getFullYear() === today.getFullYear()
  ) {
    return { text: "今天！", isToday: true };
  }

  if (thisYear < today) {
    thisYear.setFullYear(thisYear.getFullYear() + 1);
  }

  const diff = Math.floor((thisYear.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return { text: "今天！", isToday: true };

  // Check if it's this year (not wrapped to next year)
  const originalThisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (originalThisYear >= today) {
    return { text: `还有 ${diff} 天`, isToday: false };
  }

  // Already passed this year
  const daysSince = Math.floor((today.getTime() - originalThisYear.getTime()) / 86400000);
  return { text: `已过 ${daysSince} 天`, isToday: false };
}

export function AnniversaryCard({ id, name, date, note, isLunar, isTogether }: AnniversaryCardProps) {
  const { text, isToday } = getRelativeDays(date);

  return (
    <Link
      href={`/anniversaries/${id}/edit`}
      className={`block rounded-xl bg-card ring-1 p-4 hover:bg-muted/30 transition-colors ${
        isTogether ? "ring-pink-400/50" : "ring-foreground/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium truncate">{name}</h3>
            {isLunar === 1 && (
              <span className="shrink-0 inline-flex items-center rounded-full bg-warning/10 text-warning-foreground dark:text-warning px-2 py-0.5 text-xs font-medium">
                农历
              </span>
            )}
            {isTogether === 1 && (
              <span className="shrink-0 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                💕 在一起
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
          {note && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{note}</p>}
        </div>
        <div className="shrink-0">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              isToday
                ? "bg-success/10 text-success dark:text-green-400"
                : text.startsWith("还有")
                ? "bg-info/10 text-info dark:text-blue-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {text}
          </span>
        </div>
      </div>
    </Link>
  );
}
