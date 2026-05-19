"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export default function EditDinePage() {
  const params = useParams(); const router = useRouter(); const id = Number(params.id);
  const [restaurant, setRestaurant] = useState(""); const [date, setDate] = useState("");
  const [people, setPeople] = useState(""); const [dishes, setDishes] = useState("");
  const [cost, setCost] = useState(""); const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState(""); const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let c = false;
    fetch(`/api/dines/${id}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(d => {
      if (c) return; setRestaurant(d.restaurant ?? ""); setDate(d.date ?? ""); setPeople(d.people ?? "");
      setDishes(d.dishes ?? ""); setCost(d.cost != null ? String(d.cost) : ""); setRating(d.rating);
      setComment(d.comment ?? ""); setImageUrl(d.imageUrl); setLoading(false);
    }).catch(() => { if (!c) { toast.error("加载失败"); setLoading(false); } });
    return () => { c = true; };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!restaurant.trim() || !date) { toast.error("请填写餐厅和日期"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/dines/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant: restaurant.trim(), date, people: people || null, dishes: dishes || null, cost: cost ? Number(cost) : null, rating, comment: comment || null, imageUrl }) });
      if (!res.ok) { toast.error((await res.json()).error ?? "保存失败"); setSubmitting(false); return; }
      router.replace("/dines");
    } catch { toast.error("保存失败"); setSubmitting(false); }
  }

  async function handleDelete() { if (!confirm("确定删除？")) return; await fetch(`/api/dines/${id}`, { method: "DELETE" }); router.replace("/dines"); }

  if (loading) return <><TopBar title="编辑聚餐" showBell={false} /><div className="px-4 py-6 space-y-4">{Array.from({length:3}).map((_,i)=><div key={i} className="h-10 rounded bg-muted/50 animate-pulse" />)}</div></>;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="编辑聚餐" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        <div className="space-y-2"><Label htmlFor="r">餐厅名 *</Label><Input id="r" value={restaurant} onChange={e => setRestaurant(e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="d">聚餐日期 *</Label><Input id="d" type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
        <div className="space-y-2"><Label>照片（可选）</Label>{imageUrl ? (<div className="relative rounded-lg overflow-hidden ring-1 ring-foreground/10"><img src={imageUrl} alt="" className="w-full h-48 object-cover" /><button type="button" onClick={() => setImageUrl(null)} className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-xs text-muted-foreground">移除</button></div>) : (<ImageUpload type="dine" onUpload={url => setImageUrl(url)} />)}</div>
        <div className="space-y-2"><Label htmlFor="p">参与人</Label><Input id="p" value={people} onChange={e => setPeople(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="di">菜品</Label><Input id="di" value={dishes} onChange={e => setDishes(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="c">人均花费（元）</Label><Input id="c" type="number" value={cost} onChange={e => setCost(e.target.value)} /></div>
        <div className="space-y-2"><Label>味道评分</Label><div className="flex gap-1">{[1,2,3,4,5].map(s => (<button key={s} type="button" onClick={() => setRating(rating===s?null:s)} className={cn("p-1", s<=(rating??0)?"text-amber-400":"text-muted-foreground/30")}><Star className={cn("h-6 w-6", s<=(rating??0)&&"fill-amber-400")} /></button>))}</div></div>
        <div className="space-y-2"><Label htmlFor="co">点评</Label><textarea id="co" value={comment} onChange={e => setComment(e.target.value)} rows={1} className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground resize-none overflow-hidden [field-sizing:content]" style={{ minHeight: '2.5rem' }} /></div>
        <div className="mt-auto pt-4 space-y-3"><Button type="submit" disabled={submitting||!restaurant.trim()||!date} className="w-full">{submitting?"保存中...":"保存修改"}</Button><Button type="button" variant="destructive" className="w-full" onClick={handleDelete}>删除记录</Button></div>
      </form>
    </div>
  );
}
