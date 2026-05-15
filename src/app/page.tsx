import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { PointsOverview } from "@/components/PointsOverview";
import { PendingCard } from "@/components/PendingCard";
import { FeatureCards } from "@/components/FeatureCards";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, Heart, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <TopBar title="织间" showBack={false} />
      <PointsOverview />
      <PendingCard />
      <ActivityTimeline />

      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <Link href="/tasks">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <ListTodo className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">任务</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/wishes">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                  <Heart className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">心愿</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <FeatureCards />
    </>
  );
}
