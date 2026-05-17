"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function EditAnniversaryPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [isLunar, setIsLunar] = useState(false);
  const [isTogether, setIsTogether] = useState(false);
  const [hasOtherTogether, setHasOtherTogether] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/anniversaries/${id}`).then((r) => r.json()),
      fetch("/api/anniversaries").then((r) => r.json()),
    ])
      .then(([item, listData]) => {
        if (!cancelled) {
          setName(item.name ?? "");
          setDate(item.date ?? "");
          setNote(item.note ?? "");
          setIsLunar(item.isLunar === 1);
          setIsTogether(item.isTogether === 1);
          // Check if another anniversary already has together flag
          const other = listData.anniversaries?.find(
            (a: { isTogether: number; id: number }) => a.isTogether === 1 && a.id !== id
          );
          setHasOtherTogether(!!other);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("加载失败");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) {
      toast.error("请填写名称和日期");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/anniversaries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          date,
          note: note.trim() || null,
          isLunar,
          isTogether,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "保存失败");
        setSubmitting(false);
        return;
      }
      router.replace("/anniversaries");
    } catch {
      toast.error("保存失败");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("确定要删除这个纪念日吗？")) return;
    try {
      const res = await fetch(`/api/anniversaries/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("删除失败");
        return;
      }
      router.replace("/anniversaries");
    } catch {
      toast.error("删除失败");
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="编辑纪念日" showBell={false} />
        <div className="px-4 py-6 space-y-4">
          <div className="h-10 rounded bg-muted/50 animate-pulse" />
          <div className="h-10 rounded bg-muted/50 animate-pulse" />
          <div className="h-16 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </>
    );
  }

  const showTogetherOption = isTogether || !hasOtherTogether;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="编辑纪念日" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        <div className="space-y-2">
          <Label htmlFor="name">名称 *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">日期 *</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <div>
            <Label htmlFor="lunar" className="text-sm font-medium">农历日期</Label>
            <p className="text-xs text-muted-foreground mt-0.5">日期为农历，提醒按农历计算</p>
          </div>
          <Switch id="lunar" checked={isLunar} onCheckedChange={setIsLunar} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">备注（可选）</Label>
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </div>

        {showTogetherOption && (
          <div className="flex items-center justify-between rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <div>
              <Label htmlFor="together" className="text-sm font-medium">设为在一起纪念日</Label>
              <p className="text-xs text-muted-foreground mt-0.5">首页将显示在一起的天数</p>
            </div>
            <Switch id="together" checked={isTogether} onCheckedChange={setIsTogether} />
          </div>
        )}

        <div className="mt-auto pt-4 space-y-3">
          <Button
            type="submit"
            disabled={submitting || !name.trim() || !date}
            className="w-full"
          >
            {submitting ? "保存中..." : "保存修改"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            删除纪念日
          </Button>
        </div>
      </form>
    </div>
  );
}
