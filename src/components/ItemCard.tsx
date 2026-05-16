import Link from "next/link";
import { CalendarDays } from "lucide-react";

interface ItemCardProps { id: number; name: string; date: string; price: number; category?: string | null; status?: string | null; retiredDate?: string | null; imageUrl?: string | null; }

const catIcons: Record<string, string> = { "电子": "📱","家居":"🏠","户外":"⛺","服饰":"👗","其他":"📦" };

export function ItemCard({ id, name, date, price, category, status, retiredDate, imageUrl }: ItemCardProps) {
  const endDate = status === "retired" && retiredDate ? new Date(retiredDate + "T00:00:00") : new Date();
  const days = Math.max(1, Math.floor((endDate.getTime() - new Date(date + "T00:00:00").getTime()) / 86400000));
  const dailyCost = price / days;

  return (
    <Link href={`/items/${id}/edit`} className="flex gap-3 rounded-xl bg-card ring-1 ring-foreground/10 p-3 hover:bg-muted/30 transition-colors">
      <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center text-2xl">
        {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : (catIcons[category ?? ""] ?? "📦")}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2"><h3 className="text-sm font-medium truncate">{name}</h3>
          {category && <span className="shrink-0 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{category}</span>}
          {status === "retired" && <span className="shrink-0 text-xs text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded">已退役</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><CalendarDays className="h-3 w-3" />{date} · 已用 {days} 天</p>
      </div>
      <div className="shrink-0 text-right flex flex-col justify-center">
        <span className="text-lg font-bold text-primary tabular-nums">¥{dailyCost.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground tabular-nums">/天</span>
      </div>
    </Link>
  );
}
