const features = [
  { title: "共享账本", emoji: "💰" },
  { title: "体重记录", emoji: "⚖️" },
];

export function FeatureCards() {
  return (
    <div className="px-4 py-4">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">更多功能即将上线</h2>
      <div className="grid grid-cols-3 gap-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card ring-1 ring-foreground/10 p-4 opacity-50 cursor-not-allowed"
          >
            <span className="text-2xl">{feature.emoji}</span>
            <span className="text-xs text-muted-foreground">{feature.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
