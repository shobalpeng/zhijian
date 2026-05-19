"use client"; import { useState } from "react"; import { useRouter } from "next/navigation"; import { toast } from "sonner";
import { TopBar } from "@/components/TopBar"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { Textarea } from "@/components/ui/textarea"; import { Label } from "@/components/ui/label"; import { ImageUpload } from "@/components/ImageUpload"; import { cn } from "@/lib/utils";

const categories = ["电子","家居","户外","服饰","其他"];

export default function CreateItemPage() {
  const router = useRouter(); const [name, setName] = useState(""); const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [price, setPrice] = useState(""); const [cat, setCat] = useState(""); const [status, setStatus] = useState("active");
  const [imageUrl, setImageUrl] = useState<string|null>(null); const [note, setNote] = useState(""); const [sub, setSub] = useState(false);

  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); if (!name.trim()||!price) { toast.error("请填写物品名和价格"); return; } setSub(true);
    try { const r = await fetch("/api/items", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:name.trim(), date, price:Number(price), category:cat||null, status, imageUrl, note:note.trim()||null }) });
      if (!r.ok) { toast.error((await r.json()).error??"添加失败"); setSub(false); return; } router.replace("/items"); }
    catch { toast.error("添加失败"); setSub(false); } }

  return (<div className="flex flex-col min-h-full"><TopBar title="添加物品" showBell={false} />
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
      <div className="space-y-2"><Label htmlFor="n">物品名 *</Label><Input id="n" value={name} onChange={e=>setName(e.target.value)} placeholder="如：iPhone 17 Pro" required /></div>
      <div className="space-y-2"><Label htmlFor="d">购买日期 *</Label><Input id="d" type="date" value={date} onChange={e=>setDate(e.target.value)} required /></div>
      <div className="space-y-2"><Label htmlFor="p">价格（元）*</Label><Input id="p" type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="9000" required /></div>
      <div className="space-y-2"><Label>分类</Label><div className="flex flex-wrap gap-2">{categories.map(c=><button key={c} type="button" onClick={()=>setCat(cat===c?"":c)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",cat===c?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/70")}>{c}</button>)}</div></div>
      <div className="space-y-2"><Label>状态</Label><div className="flex gap-2">{[{k:"active",l:"服役中"},{k:"retired",l:"已退役"}].map(o=><button key={o.k} type="button" onClick={()=>setStatus(o.k)} className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",status===o.k?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/70")}>{o.l}</button>)}</div></div>
      <div className="space-y-2"><Label>照片（可选）</Label>{imageUrl?<div className="relative rounded-lg overflow-hidden ring-1 ring-foreground/10"><img src={imageUrl} alt="" className="w-full h-48 object-cover" /><button type="button" onClick={()=>setImageUrl(null)} className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-xs text-muted-foreground">移除</button></div>:<ImageUpload type="item" onUpload={url=>setImageUrl(url)} />}</div>
      <div className="space-y-2"><Label htmlFor="no">备注（可选）</Label><Textarea id="no" value={note} onChange={e=>setNote(e.target.value)} rows={2} /></div>
      <div className="mt-auto pt-4"><Button type="submit" disabled={sub||!name.trim()||!price} className="w-full">{sub?"添加中...":"添加物品"}</Button></div>
    </form></div>);
}
