"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { AlertCircle, CheckCircle, Gift, Heart } from "lucide-react";

interface Task {
  id: number;
  title: string;
  points: number;
  status: string;
  creatorId: number;
  assigneeId: number;
}

interface Wish {
  id: number;
  title: string;
  points: number;
  status: string;
  creatorId: number;
  fulfillerId: number;
}

interface CurrentUser {
  userId: number;
  username: string;
}

interface PendingItem {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
  category: string;
}

export default function PendingPage() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        // Fetch user info
        const userRes = await fetch("/api/auth/me");
        let currentUser: CurrentUser | null = null;
        if (userRes.ok) {
          currentUser = await userRes.json();
          if (!cancelled) setUser(currentUser);
        }

        // Fetch assigned tasks
        const [assignedRes, createdRes, wishesRes] = await Promise.all([
          fetch("/api/tasks?type=assigned"),
          fetch("/api/tasks?type=created"),
          fetch("/api/wishes"),
        ]);

        const assignedData = assignedRes.ok
          ? await assignedRes.json()
          : { tasks: [] };
        const createdData = createdRes.ok
          ? await createdRes.json()
          : { tasks: [] };
        const wishesData = wishesRes.ok
          ? await wishesRes.json()
          : { myWishes: [], partnerWishes: [] };

        if (cancelled) return;

        const items: PendingItem[] = [];
        const uid = currentUser?.userId;

        // Category 1: Tasks assigned to me with status "pending" (need completion)
        (assignedData.tasks as Task[]).forEach((task) => {
          if (task.status === "pending") {
            items.push({
              id: task.id,
              icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
              title: task.title,
              subtitle: "需要你去完成此任务",
              href: `/tasks/${task.id}`,
              category: "待完成任务",
            });
          }
        });

        // Category 2: Tasks I created with status "submitted" (need confirmation)
        (createdData.tasks as Task[]).forEach((task) => {
          if (task.status === "submitted") {
            items.push({
              id: task.id,
              icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
              title: task.title,
              subtitle: "对方已提交完成，需要你确认",
              href: `/tasks/${task.id}`,
              category: "待确认任务",
            });
          }
        });

        // Category 3: Wishes with status "pending" where I'm the fulfiller
        const allWishes = [
          ...(wishesData.myWishes as Wish[]),
          ...(wishesData.partnerWishes as Wish[]),
        ];
        allWishes.forEach((wish) => {
          if (wish.status === "pending" && wish.fulfillerId === uid) {
            items.push({
              id: wish.id,
              icon: <Gift className="h-5 w-5 text-amber-500" />,
              title: wish.title,
              subtitle: "需要你去实现此心愿",
              href: `/wishes/${wish.id}`,
              category: "待实现心愿",
            });
          }
          // Category 4: Wishes with status "submitted" where I'm the creator
          if (wish.status === "submitted" && wish.creatorId === uid) {
            items.push({
              id: wish.id,
              icon: <Heart className="h-5 w-5 text-blue-500" />,
              title: wish.title,
              subtitle: "对方已完成心愿，需要你确认",
              href: `/wishes/${wish.id}`,
              category: "待确认心愿",
            });
          }
        });

        setPendingItems(items);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Group by category
  const grouped: Record<string, PendingItem[]> = {};
  for (const item of pendingItems) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  const categories = [
    "待完成任务",
    "待确认任务",
    "待实现心愿",
    "待确认心愿",
  ];

  return (
    <>
      <TopBar title="待处理" />
      <div className="px-4 py-4 space-y-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[72px] rounded-xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">暂无待处理事项</p>
          </div>
        ) : (
          categories.map((category) => {
            const items = grouped[category];
            if (!items || items.length === 0) return null;
            return (
              <div key={category} className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {category}
                </h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <Link
                      key={`${item.category}-${item.id}`}
                      href={item.href}
                      className="block rounded-xl bg-card ring-1 ring-foreground/10 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium leading-snug truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                        <svg
                          className="h-4 w-4 text-muted-foreground shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
