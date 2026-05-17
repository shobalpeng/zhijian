"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { RecipeCard } from "@/components/RecipeCard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";

interface Recipe {
  id: number;
  title: string;
  imageUrl: string | null;
  ingredients: string | null;
  steps: string | null;
  cookCount: number;
  avgRating: number | null;
  lastCookedAt: string | null;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
}

const sorts = [
  { key: "latest", label: "最新" },
  { key: "cookCount", label: "常做" },
  { key: "lastCooked", label: "最近做过" },
] as const;

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("sort", sort);

    try {
      const res = await fetch(`/api/recipes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  return (
    <>
      <TopBar title="菜谱" showBell={false} />
      <PullToRefresh onRefresh={load}>
        {/* Search bar */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索菜谱..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 px-4 py-3">
          {sorts.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                sort === s.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Recipe list */}
        <div className="px-4 pb-4">
          {loading ? (
            <Skeleton className="h-[92px] flex gap-3" count={3} />
          ) : recipes.length === 0 ? (
            <EmptyState
              icon="🍳"
              title={debouncedSearch ? "没有找到匹配的菜谱" : "还没有添加菜谱"}
              description={debouncedSearch ? "换个关键词试试" : "点击下方 + 按钮添加第一道菜"}
            />
          ) : (
            <div className="space-y-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  imageUrl={recipe.imageUrl}
                  cookCount={recipe.cookCount}
                  avgRating={recipe.avgRating}
                  lastCookedAt={recipe.lastCookedAt}
                />
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>
    </>
  );
}
