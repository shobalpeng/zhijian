"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface Todo { id: number; content: string; done: number; area: string; }

export default function TodosArchivePage() {
  const [area, setArea] = useState("together");
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/todos?area=${area}&archived=1`);
    if (res.ok) { const d = await res.json(); setItems(d.todos); }
    setLoading(false);
  }, [area]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function handleRestore(id: number) {
    await fetch("/api/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restore", id }) });
    load();
  }

  return (
    <>
      <TopBar title="归档" showBell={false} />
      <div className="px-4 pt-4 pb-4">
        <div className="flex gap-1 mb-4">
          {[{k:"together",l:"👥 我们一起"},{k:"personal",l:"👤 我的计划"}].map(t => (
            <button key={t.k} onClick={() => setArea(t.k)} className={cn("flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", area===t.k ? "bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/70")}>{t.l}</button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">还没有归档待办</p>
        ) : (
          <div className="space-y-1">
            {items.map(todo => (
              <div key={todo.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground/60 line-through flex-1">{todo.content}</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleRestore(todo.id)}>
                  <RotateCcw className="h-3 w-3 mr-1" />恢复
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
