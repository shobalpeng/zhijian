interface ExpenseSummaryData {
  total: number;
  myTotal: number;
  partnerTotal: number;
  diff: number;
  whoOwes: string | null;
}

interface ExpenseSummaryProps {
  data: ExpenseSummaryData | null;
}

export function ExpenseSummary({ data }: ExpenseSummaryProps) {
  if (!data || data.total === 0) return null;

  const myPct = data.total > 0 ? Math.round((data.myTotal / data.total) * 100) : 0;
  const partnerPct = data.total > 0 ? Math.round((data.partnerTotal / data.total) * 100) : 0;

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
      <h3 className="text-sm font-medium mb-3">结算摘要</h3>

      {/* Total */}
      <div className="text-center mb-3">
        <span className="text-2xl font-bold text-primary tabular-nums">¥{data.total.toLocaleString()}</span>
        <p className="text-xs text-muted-foreground">总花费</p>
      </div>

      {/* Bar chart: me vs partner */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs w-8">我</span>
        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden flex">
          <div
            className="h-full bg-info transition-all"
            style={{ width: `${myPct}%` }}
          />
        </div>
        <span className="text-xs tabular-nums w-14 text-right">¥{data.myTotal.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs w-8">Ta</span>
        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden flex">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${partnerPct}%` }}
          />
        </div>
        <span className="text-xs tabular-nums w-14 text-right">¥{data.partnerTotal.toLocaleString()}</span>
      </div>

    </div>
  );
}
