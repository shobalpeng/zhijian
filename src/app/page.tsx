import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { PointsOverview } from "@/components/PointsOverview";
import { PendingCard } from "@/components/PendingCard";
import { FeatureCards } from "@/components/FeatureCards";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, Heart, ChefHat, ChevronRight } from "lucide-react";

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
            <CardContent className="flex flex-col items-center gap-1.5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <ListTodo className="h-5 w-5" />
              </div>
              <span className="font-medium text-xs">任务</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/wishes">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1.5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <Heart className="h-5 w-5" />
              </div>
              <span className="font-medium text-xs">心愿</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/recipes">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-1.5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <ChefHat className="h-5 w-5" />
              </div>
              <span className="font-medium text-xs">菜谱</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <FeatureCards />
    </>
  );
}
