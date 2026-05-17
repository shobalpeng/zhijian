"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { RatingPicker } from "@/components/RatingPicker";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Star, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

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
  creatorName: string;
  createdAt: string;
  updatedAt: string;
}

interface CookHistoryEntry {
  id: number;
  userId: number;
  rating: number | null;
  createdAt: string;
  username: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min}分钟前`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}周前`;
  const months = Math.floor(days / 30);
  return `${months}个月前`;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [history, setHistory] = useState<CookHistoryEntry[]>([]);
  const [user, setUser] = useState<{ userId: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cook dialog
  const [showCookPicker, setShowCookPicker] = useState(false);
  const [cookRating, setCookRating] = useState<number | null>(null);
  const [cooking, setCooking] = useState(false);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [res, meRes] = await Promise.all([
        fetch(`/api/recipes/${id}`),
        fetch("/api/auth/me"),
      ]);
      if (!res.ok) {
        if (res.status === 404) setError("菜谱不存在");
        else if (res.status === 403) setError("无权访问");
        else setError("加载失败");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRecipe(data.recipe);
      setHistory(data.cookHistory);
      if (meRes.ok) {
        const me = await meRes.json();
        setUser(me);
      }
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCook() {
    setCooking(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cook", rating: cookRating }),
      });
      if (!res.ok) {
        toast.error("操作失败");
        setCooking(false);
        return;
      }
      const data = await res.json();
      setRecipe(data.recipe);
      setHistory(data.cookHistory);
      setShowCookPicker(false);
      setCookRating(null);
    } catch {
      toast.error("操作失败");
    } finally {
      setCooking(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("删除失败");
        return;
      }
      router.replace("/recipes");
    } catch {
      toast.error("删除失败");
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="菜谱详情" showBell={false} />
        <div className="px-4 py-6 space-y-4">
          <div className="h-48 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-8 w-2/3 rounded bg-muted/50 animate-pulse" />
          <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </>
    );
  }

  if (error || !recipe) {
    return (
      <>
        <TopBar title="菜谱详情" showBell={false} />
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <span className="text-4xl mb-3">😔</span>
          <p className="text-sm">{error ?? "菜谱不存在"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="菜谱详情" showBell={false} />

      <div className="px-4 py-4 space-y-5">
        {/* Image */}
        {recipe.imageUrl && (
          <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10">
            <img src={recipe.imageUrl} alt="" className="w-full h-52 object-cover" />
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-bold">{recipe.title}</h1>

        {/* Stats */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-primary tabular-nums">{recipe.cookCount}</span>
              <span className="text-xs text-muted-foreground">已做次数</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              {recipe.avgRating != null ? (
                <>
                  <span className="text-2xl font-bold text-amber-500 tabular-nums">{recipe.avgRating}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.round(recipe.avgRating!)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-muted-foreground">-</span>
                  <span className="text-xs text-muted-foreground">暂无评分</span>
                </>
              )}
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground">最近做菜</span>
              <span className="text-sm font-medium">
                {recipe.lastCookedAt ? relativeTime(recipe.lastCookedAt) : "从未做过"}
              </span>
            </div>
          </div>
        </div>

        {/* Cook button */}
        {!showCookPicker ? (
          <Button
            onClick={() => setShowCookPicker(true)}
            className="w-full"
            size="lg"
          >
            🙌 做了一次
          </Button>
        ) : (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
            <p className="text-sm font-medium text-center">这次做得怎么样？（可选）</p>
            <div className="flex justify-center">
              <RatingPicker value={cookRating} onChange={setCookRating} />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCookPicker(false);
                  setCookRating(null);
                }}
              >
                跳过
              </Button>
              <Button
                className="flex-1"
                onClick={handleCook}
                disabled={cooking}
              >
                {cooking ? "..." : "确认"}
              </Button>
            </div>
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients && (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <h3 className="text-sm font-medium mb-2">食材清单</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recipe.ingredients}</p>
          </div>
        )}

        {/* Steps */}
        {recipe.steps && (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <h3 className="text-sm font-medium mb-2">烹饪步骤</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recipe.steps}</p>
          </div>
        )}

        {/* Cook history */}
        {history.length > 0 && (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <h3 className="text-sm font-medium mb-3">做菜记录</h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{relativeTime(h.createdAt)}</span>
                    <span>{h.username}</span>
                  </div>
                  {h.rating && (
                    <span className="text-amber-500 text-xs">
                      {"⭐".repeat(h.rating)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/recipes/${id}/edit`)}
          >
            编辑菜谱
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setDeleteOpen(true)}
          >
            删除菜谱
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="删除菜谱"
        body={`确定要删除「${recipe.title}」吗？做菜记录也会一并删除。`}
        onConfirm={handleDelete}
        confirmText="删除"
        variant="destructive"
      />
    </>
  );
}
