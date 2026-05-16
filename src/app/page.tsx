import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { PointsOverview } from "@/components/PointsOverview";
import { PendingCard } from "@/components/PendingCard";
import { FeatureCards } from "@/components/FeatureCards";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, Heart, ChefHat, CalendarDays, Map, Footprints } from "lucide-react";

export default function Home() {
  return (
    <>
      <TopBar title="织间" showBack={false} />
      <PointsOverview />
      <PendingCard />
      <ActivityTimeline />

      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <Link href="/tasks">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <ListTodo className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">任务</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/wishes">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <Heart className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">心愿</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/recipes">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <ChefHat className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">菜谱</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/anniversaries">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <CalendarDays className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">纪念日</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/travel">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <Map className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">旅游</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/wanders">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-100 text-lime-600">
                <Footprints className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">城市漫游</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <FeatureCards />
    </>
  );
}
