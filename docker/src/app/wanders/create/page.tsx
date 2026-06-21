"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";

export default function CreateWanderPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location.trim() || !date) {
      toast.error("请填写地点和日期");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/wanders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location.trim(),
          date,
          imageUrls,
          mood: mood.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "记录失败");
        setSubmitting(false);
        return;
      }
      router.replace("/wanders");
    } catch {
      toast.error("记录失败");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="记录漫游" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        <div className="space-y-2">
          <Label htmlFor="location">地点 *</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="如：西湖"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">日期 *</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>照片（可选）</Label>
          <MultiImageUpload urls={imageUrls} onChange={setImageUrls} type="wander" max={9} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mood">心情</Label>
          <textarea
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="今天天气真好"
            rows={1}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground resize-none overflow-hidden [field-sizing:content]"
            style={{ minHeight: '2.5rem' }}
          />
        </div>

        <div className="mt-auto pt-4">
          <Button type="submit" disabled={submitting || !location.trim() || !date} className="w-full">
            {submitting ? "记录中..." : "记录"}
          </Button>
        </div>
      </form>
    </div>
  );
}
