"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MapPin, Calendar, Banknote, Pencil, Train, Hotel, UtensilsCrossed, Ticket, ShoppingBag, MoreHorizontal, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Destination {
  id: number;
  name: string;
  coverImage: string | null;
  tagline: string | null;
  status: string;
  city: string | null;
  placesToVisit: string | null;
  itineraryDraft: string | null;
  budgetEstimate: number | null;
  notes: string | null;
  visitedAt: string | null;
  creatorId: number;
}

interface Expense {
  id: number;
  destinationId: number;
  category: string;
  amount: number;
  payer: string;
  note: string | null;
  createdAt: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  transport: { label: "交通", icon: Train },
  accommodation: { label: "住宿", icon: Hotel },
  dining: { label: "餐饮", icon: UtensilsCrossed },
  tickets: { label: "门票", icon: Ticket },
  shopping: { label: "购物", icon: ShoppingBag },
  other: { label: "其他", icon: MoreHorizontal },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TravelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [dest, setDest] = useState<Destination | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitOpen, setVisitOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Add expense form
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newCat, setNewCat] = useState("dining");
  const [newAmount, setNewAmount] = useState("");
  const [newPayer, setNewPayer] = useState("me");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [res, expRes] = await Promise.all([
        fetch(`/api/travel/${id}`),
        fetch(`/api/travel/${id}/expenses`),
      ]);
      if (!res.ok) {
        if (res.status === 404) setError("目的地不存在");
        else setError("加载失败");
        setLoading(false);
        return;
      }
      setDest(await res.json());
      if (expRes.ok) {
        const e = await expRes.json();
        setExpenses(e.expenses);
      }
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleVisit() {
    try {
      const res = await fetch(`/api/travel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "visit" }),
      });
      if (!res.ok) { toast.error("操作失败"); return; }
      const data = await res.json();
      setDest(data.destination);
      setVisitOpen(false);
      toast.success("已标记为去过，已加入足迹地图");
    } catch {
      toast.error("操作失败");
    }
  }

  async function handleAddExpense() {
    if (!newAmount) { toast.error("请填写金额"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/travel/${id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCat,
          amount: Number(newAmount),
          payer: newPayer,
          note: newNote || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setExpenses((prev) => [data.expense, ...prev]);
      setShowAddExpense(false);
      setNewAmount("");
      setNewNote("");
    } catch {
      toast.error("添加失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteExpense(expenseId: number) {
    try {
      const res = await fetch(`/api/travel/expenses/${expenseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch {
      toast.error("删除失败");
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/travel/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("删除失败"); return; }
      router.replace("/travel");
    } catch {
      toast.error("删除失败");
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="目的地详情" showBell={false} />
        <div className="px-4 py-6 space-y-4">
          <div className="h-48 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-8 w-2/3 rounded bg-muted/50 animate-pulse" />
          <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </>
    );
  }

  if (error || !dest) {
    return (
      <>
        <TopBar title="目的地详情" showBell={false} />
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <span className="text-4xl mb-3">🗺️</span>
          <p className="text-sm">{error ?? "目的地不存在"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>返回</Button>
        </div>
      </>
    );
  }

  const destTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <TopBar title="目的地详情" showBell={false} />

      <div className="px-4 py-4 space-y-5">
        {dest.coverImage && (
          <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10 -mx-0">
            <img src={dest.coverImage} alt="" className="w-full h-52 object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{dest.name}</h1>
            {dest.tagline && <p className="text-sm text-muted-foreground mt-0.5">{dest.tagline}</p>}
          </div>
          <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${dest.status === "visited" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-600"}`}>
            {dest.status === "visited" ? "已去过" : "想去"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {dest.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />{dest.city}
            </span>
          )}
          {dest.visitedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />{formatTime(dest.visitedAt)} 去过
            </span>
          )}
        </div>

        {dest.budgetEstimate != null && (
          <div className="flex items-center gap-2 rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <Banknote className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">预算估算：</span>
            <span className="text-lg font-bold text-primary">¥{dest.budgetEstimate.toLocaleString()}</span>
          </div>
        )}

        {dest.placesToVisit && (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <h3 className="text-sm font-medium mb-2">📍 想去的地点</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dest.placesToVisit}</p>
          </div>
        )}

        {dest.itineraryDraft && (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <h3 className="text-sm font-medium mb-2">📝 行程草稿</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dest.itineraryDraft}</p>
          </div>
        )}

        {dest.notes && (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <h3 className="text-sm font-medium mb-2">📌 备注</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dest.notes}</p>
          </div>
        )}

        {/* Mark as visited (only wishlist) */}
        {dest.status === "wishlist" && (
          <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
            <p className="text-sm text-emerald-800 mb-2">准备好了吗？</p>
            <Button
              variant="outline"
              className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => setVisitOpen(true)}
            >
              ✅ 标记为已去过
            </Button>
          </div>
        )}

        {/* Expenses section (visited only) */}
        {dest.status === "visited" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">💰 花费记录</h3>
              {expenses.length > 0 && (
                <span className="text-sm font-bold text-primary tabular-nums">
                  共 ¥{destTotal.toLocaleString()}
                </span>
              )}
            </div>
            {expenses.length > 0 && (
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>我付：¥{expenses.filter((e) => e.payer === "me").reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
                <span>Ta付：¥{expenses.filter((e) => e.payer === "partner").reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
              </div>
            )}

            {/* Add expense form */}
            {showAddExpense && (
              <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewCat(key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        newCat === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                      )}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="金额" className="flex-1" />
                  <select value={newPayer} onChange={(e) => setNewPayer(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm w-20">
                    <option value="me">我</option>
                    <option value="partner">Ta</option>
                  </select>
                </div>

                <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="备注（可选）" />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddExpense(false)}>取消</Button>
                  <Button className="flex-1" onClick={handleAddExpense} disabled={saving}>
                    {saving ? "..." : "添加"}
                  </Button>
                </div>
              </div>
            )}

            {/* Expense list */}
            {expenses.length > 0 ? (
              <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-1.5">
                {expenses.map((e) => {
                  const cfg = categoryConfig[e.category] ?? categoryConfig.other;
                  const Icon = cfg.icon;
                  return (
                    <div key={e.id} className="flex items-center gap-2 text-sm py-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground text-xs">{cfg.label}</span>
                      {e.note && <span className="text-xs text-muted-foreground/70 truncate flex-1">{e.note}</span>}
                      <span className="tabular-nums font-medium text-xs ml-auto">¥{e.amount}</span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded", e.payer === "me" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600")}>
                        {e.payer === "me" ? "我" : "Ta"}
                      </span>
                      <button onClick={() => handleDeleteExpense(e.id)} className="text-muted-foreground/40 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">还没有花费记录</p>
            )}

            {/* Add button */}
            <Button
              variant={expenses.length > 0 ? "outline" : "default"}
              size="sm"
              className="w-full"
              onClick={() => setShowAddExpense(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {expenses.length > 0 ? "继续添加" : "添加花费"}
            </Button>
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => router.push(`/travel/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" />
            编辑
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => setDeleteOpen(true)}>
            删除
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={visitOpen}
        onOpenChange={setVisitOpen}
        title="标记为已去过"
        body={`确定「${dest.name}」已经去过了吗？确认后将从愿望清单移到足迹地图。`}
        onConfirm={handleVisit}
        confirmText="确认去过"
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="删除目的地"
        body={`确定要删除「${dest.name}」吗？相关花费记录也会一并删除。`}
        onConfirm={handleDelete}
        confirmText="删除"
        variant="destructive"
      />
    </>
  );
}
