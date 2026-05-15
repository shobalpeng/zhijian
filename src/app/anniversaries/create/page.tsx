"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function CreateAnniversaryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [isLunar, setIsLunar] = useState(false);
  const [isTogether, setIsTogether] = useState(false);
  const [hasTogether, setHasTogether] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/anniversaries")
      .then((res) => res.json())
      .then((data) => {
        setHasTogether(data.hasTogether ?? false);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) {
      toast.error("请填写名称和日期");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/anniversaries", {
        method: "POST",
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
        toast.error(err.error ?? "添加失败");
        setSubmitting(false);
        return;
      }
      router.replace("/anniversaries");
    } catch {
      toast.error("添加失败");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="添加纪念日" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        <div className="space-y-2">
          <Label htmlFor="name">名称 *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：Ta的生日"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">日期 *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <div>
            <Label htmlFor="lunar" className="text-sm font-medium">农历日期</Label>
            <p className="text-xs text-muted-foreground mt-0.5">日期为农历，提醒按农历计算</p>
          </div>
          <Switch
            id="lunar"
            checked={isLunar}
            onCheckedChange={setIsLunar}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">备注（可选）</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>

        {!hasTogether && (
          <div className="flex items-center justify-between rounded-xl bg-card ring-1 ring-foreground/10 p-4">
            <div>
              <Label htmlFor="together" className="text-sm font-medium">设为在一起纪念日</Label>
              <p className="text-xs text-muted-foreground mt-0.5">首页将显示在一起的天数</p>
            </div>
            <Switch
              id="together"
              checked={isTogether}
              onCheckedChange={setIsTogether}
            />
          </div>
        )}

        <div className="mt-auto pt-4">
          <Button
            type="submit"
            disabled={submitting || !name.trim() || !date}
            className="w-full"
          >
            {submitting ? "添加中..." : "添加纪念日"}
          </Button>
        </div>
      </form>
    </div>
  );
}
