"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export default function CreateDinePage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [people, setPeople] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [dishes, setDishes] = useState("");
  const [cost, setCost] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant.trim() || !date) { toast.error("请填写餐厅和日期"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dines", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant: restaurant.trim(), date, people: people || null, peopleCount: peopleCount ? Number(peopleCount) : null, dishes: dishes || null, cost: cost ? Number(cost) : null, rating, comment: comment || null, imageUrls: imageUrls.length > 0 ? imageUrls : undefined }) });
      if (!res.ok) { toast.error((await res.json()).error ?? "添加失败"); setSubmitting(false); return; }
      router.replace("/dines");
    } catch { toast.error("添加失败"); setSubmitting(false); }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="记录聚餐" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        <div className="space-y-2"><Label htmlFor="restaurant">餐厅名 *</Label><Input id="restaurant" value={restaurant} onChange={e => setRestaurant(e.target.value)} placeholder="如：海底捞" required /></div>
        <div className="space-y-2"><Label htmlFor="date">聚餐日期 *</Label><Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
        <div className="space-y-2"><Label>照片</Label><MultiImageUpload urls={imageUrls} onChange={setImageUrls} type="dine" /></div>
        <div className="space-y-2"><Label htmlFor="people">参与人</Label><Input id="people" value={people} onChange={e => setPeople(e.target.value)} placeholder="如：和Ta、小李" /></div>
        <div className="space-y-2"><Label htmlFor="dishes">菜品</Label><Input id="dishes" value={dishes} onChange={e => setDishes(e.target.value)} placeholder="如：烤鸭、酸菜鱼" /></div>
<div className="flex items-center justify-between"><span className="flex items-center gap-1"><span className="text-sm font-medium shrink-0">总价</span><Input id="cost" type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0" className="h-7 text-xs w-16" /><span className="text-xs text-muted-foreground">元</span></span><span className="flex items-center gap-1"><span className="text-sm font-medium shrink-0">人数</span><Input id="peopleCount" type="number" value={peopleCount} onChange={e => setPeopleCount(e.target.value)} placeholder="0" min="1" className="h-7 text-xs w-16" /><span className="text-xs text-muted-foreground">人</span></span><span className="flex items-center gap-1"><span className="text-sm font-medium shrink-0">人均</span><span className="text-sm font-medium text-primary tabular-nums">{cost && peopleCount && Number(cost) > 0 && Number(peopleCount) > 0 ? `¥${(Number(cost) / Number(peopleCount)).toFixed(1)}元` : "—"}</span></span></div>
        <div className="space-y-2">
          <Label>味道评分</Label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button" onClick={() => setRating(rating === s ? null : s)}
                className={cn("p-1", s <= (rating ?? 0) ? "text-amber-400" : "text-muted-foreground/30")}>
                <Star className={cn("h-6 w-6", s <= (rating ?? 0) && "fill-amber-400")} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2"><Label htmlFor="comment">点评</Label><textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="如：涮毛肚绝了" rows={1} className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground resize-none overflow-hidden [field-sizing:content]" style={{ minHeight: '2.5rem' }} /></div>
        <div className="mt-auto pt-4"><Button type="submit" disabled={submitting || !restaurant.trim() || !date} className="w-full">{submitting ? "添加中..." : "记录聚餐"}</Button></div>
      </form>
    </div>
  );
}
