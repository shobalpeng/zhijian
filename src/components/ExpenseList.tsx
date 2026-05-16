"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Train, Hotel, UtensilsCrossed, Ticket, ShoppingBag, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Expense {
  id: number;
  destinationId: number;
  category: string;
  amount: number;
  payer: string;
  note: string | null;
  createdAt: string;
  destinationName?: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  transport: { label: "交通", icon: Train },
  accommodation: { label: "住宿", icon: Hotel },
  dining: { label: "餐饮", icon: UtensilsCrossed },
  tickets: { label: "门票", icon: Ticket },
  shopping: { label: "购物", icon: ShoppingBag },
  other: { label: "其他", icon: MoreHorizontal },
};

interface ExpenseListProps {
  expenses: Expense[];
  destinations: { id: number; name: string }[];
  onRefresh: () => void;
}

export function ExpenseList({ expenses, destinations, onRefresh }: ExpenseListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newDestId, setNewDestId] = useState("");
  const [newCat, setNewCat] = useState("dining");
  const [newAmount, setNewAmount] = useState("");
  const [newPayer, setNewPayer] = useState("me");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Group expenses by destination
  const grouped = new Map<number, { name: string; expenses: Expense[] }>();
  for (const e of expenses) {
    const key = e.destinationId;
    if (!grouped.has(key)) {
      grouped.set(key, { name: e.destinationName ?? `目的地 #${key}`, expenses: [] });
    }
    grouped.get(key)!.expenses.push(e);
  }

  async function handleAddExpense() {
    if (!newDestId || !newAmount) {
      toast.error("请选择目的地并填写金额");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/travel/${newDestId}/expenses`, {
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
      setShowAdd(false);
      setNewAmount("");
      setNewNote("");
      onRefresh();
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
      onRefresh();
    } catch {
      toast.error("删除失败");
    }
  }

  if (expenses.length === 0 && !showAdd) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <span className="text-3xl mb-2">💰</span>
        <p className="text-sm">还没有花费记录</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAdd(true)}>
          添加花费
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Add expense form */}
      {showAdd && (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
          <p className="text-sm font-medium">添加花费</p>

          <select
            value={newDestId}
            onChange={(e) => setNewDestId(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">选择目的地</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <div className="flex gap-2 flex-wrap">
            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setNewCat(key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  newCat === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                )}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="金额"
              className="flex-1"
            />
            <select
              value={newPayer}
              onChange={(e) => setNewPayer(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm w-20"
            >
              <option value="me">我</option>
              <option value="partner">Ta</option>
            </select>
          </div>

          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="备注（可选）"
          />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>取消</Button>
            <Button className="flex-1" onClick={handleAddExpense} disabled={saving}>
              {saving ? "..." : "添加"}
            </Button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showAdd && (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAdd(true)}>
          + 添加花费
        </Button>
      )}

      {/* Grouped expenses */}
      {Array.from(grouped.entries()).map(([destId, group]) => (
        <div key={destId} className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">{group.name}</h4>
            <span className="text-sm font-bold text-primary tabular-nums">
              ¥{group.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
            </span>
          </div>
          {/* Per-person totals */}
          <div className="flex gap-3 mb-2 text-xs text-muted-foreground">
            <span>我付：¥{group.expenses.filter((e) => e.payer === "me").reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
            <span>Ta付：¥{group.expenses.filter((e) => e.payer === "partner").reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
          </div>
          <div className="space-y-1.5">
            {group.expenses.map((e) => {
              const cfg = categoryConfig[e.category] ?? categoryConfig.other;
              const Icon = cfg.icon;
              return (
                <div key={e.id} className="flex items-center gap-2 text-sm">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground text-xs">{cfg.label}</span>
                  {e.note && <span className="text-xs text-muted-foreground/70 truncate flex-1">{e.note}</span>}
                  <span className="tabular-nums font-medium text-xs">¥{e.amount}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded", e.payer === "me" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600")}>
                    {e.payer === "me" ? "我" : "Ta"}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="text-muted-foreground/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
