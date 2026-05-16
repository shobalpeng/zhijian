"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Archive, GripVertical, X } from "lucide-react";

interface Todo { id: number; content: string; done: number; area: string; sortOrder: number; }

export default function TodosPage() {
  const router = useRouter();
  const [area, setArea] = useState("together");
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/todos?area=${area}`);
    if (res.ok) { const d = await res.json(); setItems(d.todos); }
    setLoading(false);
  }, [area]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function handleAdd() {
    if (!newText.trim()) return;
    await fetch("/api/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: newText.trim(), area }) });
    setNewText("");
    load();
  }

  async function handleToggle(id: number) {
    await fetch("/api/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle", id }) });
    load();
  }

  async function handleEdit(id: number) {
    if (!editText.trim()) return;
    await fetch("/api/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "edit", id, content: editText.trim() }) });
    setEditingId(null); load();
  }

  async function handleArchive() {
    await fetch("/api/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "archive", area }) });
    load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    load();
  }

  function handleDragStart(id: number) { dragItem.current = id; }
  function handleDragOver(e: React.DragEvent, id: number) { e.preventDefault(); dragOver.current = id; }
  async function handleDrop() {
    const from = dragItem.current; const to = dragOver.current;
    if (from == null || to == null || from === to) return;
    const newItems = [...items];
    const fi = newItems.findIndex(i => i.id === from);
    const ti = newItems.findIndex(i => i.id === to);
    const [moved] = newItems.splice(fi, 1);
    newItems.splice(ti, 0, moved);
    setItems(newItems);
    await fetch("/api/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reorder", ids: newItems.map(i => i.id) }) });
    dragItem.current = null; dragOver.current = null;
  }

  const hasDone = items.some(i => i.done === 1);

  return (
    <>
      <TopBar title="待办" showBell={false} />

      <div className="px-4 pt-4 pb-4">
        {/* Tabs + Archive */}
        <div className="flex gap-1 mb-4">
          {[{k:"together",l:"👥 我们一起"},{k:"personal",l:"👤 我的计划"}].map(t => (
            <button key={t.k} onClick={() => setArea(t.k)}
              className={cn("flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", area===t.k ? "bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/70")}>
              {t.l}
            </button>
          ))}
          <button onClick={() => router.push("/todos/archive")} className="px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/50">
            <Archive className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />)}</div>
        ) : (
          <>
            {/* Add input */}
            <div className="flex gap-2 mb-3">
              <Input className="flex-1" placeholder="+ 添加待办..." value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }} />
              <Button size="sm" onClick={handleAdd} disabled={!newText.trim()}>添加</Button>
            </div>

            <div className="space-y-1">
              {items.map((todo) => (
                <div key={todo.id} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg group", todo.done ? "bg-muted/30" : "hover:bg-muted/30")}
                  draggable onDragStart={() => handleDragStart(todo.id)} onDragOver={(e) => handleDragOver(e, todo.id)} onDragEnd={handleDrop}>
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 cursor-grab shrink-0" />
                  <button onClick={() => handleToggle(todo.id)}
                    className={cn("w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                      todo.done ? "bg-primary border-primary text-white" : "border-muted-foreground/30 hover:border-primary")}>
                    {todo.done === 1 && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  {editingId === todo.id ? (
                    <Input className="flex-1 h-7 text-sm" value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => { if(e.key==="Enter") handleEdit(todo.id); if(e.key==="Escape") setEditingId(null); }} onBlur={() => setEditingId(null)} autoFocus />
                  ) : (
                    <span onClick={() => { setEditingId(todo.id); setEditText(todo.content); }}
                      className={cn("flex-1 text-sm cursor-text", todo.done && "line-through text-muted-foreground/50")}>
                      {todo.content}
                    </span>
                  )}
                  <button onClick={() => handleDelete(todo.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-red-500 transition-all"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">还没有待办</p>}
            </div>

            {hasDone && (
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-muted-foreground" onClick={handleArchive}>
                📦 归档已完成
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
}
