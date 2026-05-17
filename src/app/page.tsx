import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { PointsOverview } from "@/components/PointsOverview";
import { PendingCard } from "@/components/PendingCard";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ListTodo, Heart, ChefHat, CalendarDays, Map, Footprints, UtensilsCrossed, CheckSquare, Calculator } from "lucide-react";

const navItems = [
  { href: "/tasks", label: "任务", icon: ListTodo, color: "blue" },
  { href: "/wishes", label: "心愿", icon: Heart, color: "pink" },
  { href: "/recipes", label: "菜谱", icon: ChefHat, color: "orange" },
  { href: "/anniversaries", label: "纪念日", icon: CalendarDays, color: "rose" },
  { href: "/travel", label: "旅游", icon: Map, color: "teal" },
  { href: "/wanders", label: "城市漫游", icon: Footprints, color: "lime" },
  { href: "/dines", label: "聚餐", icon: UtensilsCrossed, color: "violet" },
  { href: "/todos", label: "待办", icon: CheckSquare, color: "cyan" },
  { href: "/items", label: "日均成本", icon: Calculator, color: "indigo" },
] as const;

const colorClasses: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-400",
  pink: "bg-pink-500/10 text-pink-600 dark:bg-pink-400/20 dark:text-pink-400",
  orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-400/20 dark:text-orange-400",
  rose: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/20 dark:text-rose-400",
  teal: "bg-teal-500/10 text-teal-600 dark:bg-teal-400/20 dark:text-teal-400",
  lime: "bg-lime-500/10 text-lime-600 dark:bg-lime-400/20 dark:text-lime-400",
  violet: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/20 dark:text-violet-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400",
};

export default function Home() {
  return (
    <>
      <TopBar title="织间" showBack={false} />
      <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <PointsOverview />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <PendingCard />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <ActivityTimeline />
      </div>

      <div className="px-4 mt-4 grid grid-cols-4 gap-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="aspect-square rounded-xl bg-card ring-1 ring-foreground/10 flex flex-col items-center justify-center gap-0.5 p-2 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colorClasses[item.color]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
