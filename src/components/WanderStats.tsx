interface WanderStatsProps {
  stats: { location: string; count: number }[];
}

export function WanderStats({ stats }: WanderStatsProps) {
  if (stats.length === 0) return null;

  const top = stats.slice(0, 5);

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
      <h3 className="text-sm font-medium mb-2">🏆 我们最爱去的地方</h3>
      <div className="flex flex-wrap gap-2">
        {top.map((s, i) => (
          <span
            key={s.location}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              i === 0
                ? "bg-amber-100 text-amber-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i === 0 && "👑 "}
            {s.location}
            <span className="opacity-60">{s.count}次</span>
          </span>
        ))}
      </div>
    </div>
  );
}
