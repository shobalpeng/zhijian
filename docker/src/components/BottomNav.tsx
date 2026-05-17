"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, User, PenLine, Heart, ChefHat, CalendarDays, Map, Footprints, UtensilsCrossed, CheckSquare, Calculator } from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "首页", icon: Home },
  { href: null, label: "新建", icon: Plus },
  { href: "/settings", label: "我的", icon: User },
] as const;

const createActions = [
  {
    label: "任务",
    icon: PenLine,
    href: "/tasks/create",
  },
  {
    label: "心愿",
    icon: Heart,
    href: "/wishes/create",
  },
  {
    label: "菜谱",
    icon: ChefHat,
    href: "/recipes/create",
  },
  {
    label: "纪念日",
    icon: CalendarDays,
    href: "/anniversaries/create",
  },
  {
    label: "目的地",
    icon: Map,
    href: "/travel/create",
  },
  {
    label: "漫游",
    icon: Footprints,
    href: "/wanders/create",
  },
  {
    label: "聚餐",
    icon: UtensilsCrossed,
    href: "/dines/create",
  },
  {
    label: "待办",
    icon: CheckSquare,
    href: "/todos",
  },
  {
    label: "日均成本",
    icon: Calculator,
    href: "/items/create",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string | null) => {
    if (href === "/") return pathname === "/";
    if (href === "/settings") return pathname.startsWith("/settings");
    return false;
  };

  const isInTasks = pathname.startsWith("/tasks");
  const isInWishes = pathname.startsWith("/wishes");
  const isInRecipes = pathname.startsWith("/recipes");
  const isInAnniversaries = pathname.startsWith("/anniversaries");
  const isInTravel = pathname.startsWith("/travel");
  const isInWanders = pathname.startsWith("/wanders");
  const isInDines = pathname.startsWith("/dines");
  const isInTodos = pathname.startsWith("/todos");
  const isInItems = pathname.startsWith("/items");

  function handlePlusClick() {
    if (isInTasks) router.push("/tasks/create");
    else if (isInWishes) router.push("/wishes/create");
    else if (isInRecipes) router.push("/recipes/create");
    else if (isInAnniversaries) router.push("/anniversaries/create");
    else if (isInTravel) router.push("/travel/create");
    else if (isInWanders) router.push("/wanders/create");
    else if (isInDines) router.push("/dines/create");
    else if (isInTodos) router.push("/todos");
    else if (isInItems) router.push("/items/create");
    else setOpen(true);
  }

  function handleAction(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background" aria-label="主导航">
        <div className="mx-auto flex max-w-lg items-center justify-around h-16">
          {tabs.map((tab) => {
            if (tab.href === null) {
              return (
                <button
                  key="create"
                  onClick={handlePlusClick}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-lg",
                    (isInTasks || isInWishes || isInRecipes || isInAnniversaries || isInTravel || isInWanders || isInDines || isInTodos || isInItems)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-6 w-6" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            }
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-lg",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <tab.icon className="h-6 w-6" />
                <span className="text-xs">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="gap-0 px-4 pb-4 border-none bg-transparent shadow-none max-w-sm mx-auto rounded-t-2xl">
          {/* Grid of small cards */}
          <div className="grid grid-cols-4 gap-3">
            {createActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleAction(action.href)}
                className="flex flex-col items-center justify-center gap-1.5 aspect-square rounded-2xl bg-card hover:bg-muted/50 transition-colors"
              >
                <action.icon className="h-7 w-7 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {action.label}
                </span>
              </button>
            ))}
          </div>

          {/* Cancel button */}
          <button
            onClick={() => setOpen(false)}
            className="w-full mt-3 rounded-2xl bg-card py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            取消
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
