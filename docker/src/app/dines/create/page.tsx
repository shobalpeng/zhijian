"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export default function CreateDinePage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [people, setPeople] = useState("");
  const [dishes, setDishes] = useState("");
  const [cost, setCost] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant.trim() || !date) { toast.error("请填写餐厅和日期"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dines", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant: restaurant.trim(), date, people: people || null, dishes: dishes || null, cost: cost ? Number(cost) : null, rating, comment: comment || null, imageUrl }) });
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
        <div className="space-y-2"><Label>照片（可选）</Label>{imageUrl ? (<div className="relative rounded-lg overflow-hidden ring-1 ring-foreground/10"><img src={imageUrl} alt="" className="w-full h-48 object-cover" /><button type="button" onClick={() => setImageUrl(null)} className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-xs text-muted-foreground">移除</button></div>) : (<ImageUpload onUpload={url => setImageUrl(url)} />)}</div>
        <div className="space-y-2"><Label htmlFor="people">参与人</Label><Input id="people" value={people} onChange={e => setPeople(e.target.value)} placeholder="如：和Ta、小李" /></div>
        <div className="space-y-2"><Label htmlFor="dishes">菜品</Label><Input id="dishes" value={dishes} onChange={e => setDishes(e.target.value)} placeholder="如：烤鸭、酸菜鱼" /></div>
        <div className="space-y-2"><Label htmlFor="cost">人均花费（元）</Label><Input id="cost" type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="如：120" /></div>
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
        <div className="space-y-2"><Label htmlFor="comment">一句话点评</Label><Input id="comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="如：涮毛肚绝了" maxLength={100} /><p className="text-xs text-muted-foreground text-right">{comment.length}/100</p></div>
        <div className="mt-auto pt-4"><Button type="submit" disabled={submitting || !restaurant.trim() || !date} className="w-full">{submitting ? "添加中..." : "记录聚餐"}</Button></div>
      </form>
    </div>
  );
}
