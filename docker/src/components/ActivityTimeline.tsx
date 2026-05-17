"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, Heart, CalendarDays } from "lucide-react";

interface Activity {
  id: number;
  type: string;
  time: string;
  label: string;
  pointLabel: string;
}

interface UpcomingAnniversary {
  name: string;
  daysUntil: number;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingAnniversary | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/recent")
      .then(r => r.json())
      .then(d => { if (!cancelled) setActivities(d.activities ?? []); })
      .catch(() => { if (!cancelled) setActivities([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/anniversaries/upcoming")
      .then(r => r.json())
      .then(d => { if (!cancelled && d.anniversary) setUpcoming(d.anniversary); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if ((!activities || activities.length === 0) && !upcoming) return null;

  return (
    <div className="px-4 py-2">
      <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">最近动态</span>
        </div>

        {/* Upcoming anniversary */}
        {upcoming && (
          <div className="flex items-start gap-3 text-sm mb-3 pb-3 border-b border-border">
            <div className="mt-0.5">
              <CalendarDays className="h-4 w-4 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed">
                <span className="text-muted-foreground">距离{upcoming.name}还剩</span>
                <span className="font-bold text-blue-600">
                  {" "}{upcoming.daysUntil === 0 ? "0天，就是今天！" : `${upcoming.daysUntil}天`}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Recent activities */}
        {activities && activities.length > 0 && (
          <div className="space-y-2">
            {activities.map((a) => (
              <div key={`${a.type}-${a.id}`} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5">
                  {a.type === "task" ? (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Heart className="h-4 w-4 text-pink-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">
                    <span className="text-muted-foreground">{a.label}</span>
                    <span className={`font-bold ${a.pointLabel.includes("+") ? "text-emerald-600" : "text-red-500"}`}>
                      {a.pointLabel}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground/70">{relativeTime(a.time)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
