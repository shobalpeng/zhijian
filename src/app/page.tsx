import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { PointsOverview } from "@/components/PointsOverview";
import { PendingCard } from "@/components/PendingCard";
import { FeatureCards } from "@/components/FeatureCards";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, Heart, ChefHat, CalendarDays, Map, Footprints, UtensilsCrossed, CheckSquare, Calculator } from "lucide-react";

export default function Home() {
  return (
    <>
      <TopBar title="织间" showBack={false} />
      <PointsOverview />
      <PendingCard />
      <ActivityTimeline />

      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        <Link href="/tasks">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-400">
                <ListTodo className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">任务</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/wishes">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/10 text-pink-600 dark:bg-pink-400/20 dark:text-pink-400">
                <Heart className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">心愿</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/recipes">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:bg-orange-400/20 dark:text-orange-400">
                <ChefHat className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">菜谱</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/anniversaries">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-400/20 dark:text-rose-400">
                <CalendarDays className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">纪念日</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/travel">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:bg-teal-400/20 dark:text-teal-400">
                <Map className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">旅游</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/wanders">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-500/10 text-lime-600 dark:bg-lime-400/20 dark:text-lime-400">
                <Footprints className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">城市漫游</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dines">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:bg-violet-400/20 dark:text-violet-400">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">聚餐</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/todos">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-400">
                <CheckSquare className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">待办</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/items">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400">
                <Calculator className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">日均成本</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <FeatureCards />
    </>
  );
}
