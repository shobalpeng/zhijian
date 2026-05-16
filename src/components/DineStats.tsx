interface DineStatsData {
  total: number;
  avgCost: number;
  topRestaurants: { name: string; count: number }[];
  count: number;
}

interface DineStatsProps {
  stats: DineStatsData | null;
}

export function DineStats({ stats }: DineStatsProps) {
  if (!stats || stats.count === 0) return null;

  const top = stats.topRestaurants;

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
      <h3 className="text-sm font-medium mb-2">🍽️ 聚餐统计</h3>
      <div className="grid grid-cols-2 gap-2 mb-3 text-center">
        <div className="rounded-lg bg-muted p-2">
          <p className="text-lg font-bold text-primary tabular-nums">{stats.count}</p>
          <p className="text-xs text-muted-foreground">聚餐次数</p>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <p className="text-lg font-bold text-primary tabular-nums">¥{stats.total}</p>
          <p className="text-xs text-muted-foreground">总花费</p>
        </div>
      </div>
      {stats.avgCost > 0 && (
        <p className="text-xs text-muted-foreground text-center mb-2">人均约 ¥{stats.avgCost}</p>
      )}
      {top.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground">🏆 最常去：</span>
          {top.map((r, i) => (
            <span key={r.name} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
              {i === 0 && "👑 "}{r.name} <span className="opacity-60">{r.count}次</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
