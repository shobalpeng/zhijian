"use client"; import { useEffect, useState } from "react"; import { useParams, useRouter } from "next/navigation"; import { toast } from "sonner";
import { TopBar } from "@/components/TopBar"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { Textarea } from "@/components/ui/textarea"; import { Label } from "@/components/ui/label"; import { ImageUpload } from "@/components/ImageUpload"; import { cn } from "@/lib/utils";

const categories = ["电子","家居","户外","服饰","其他"];

export default function EditItemPage() {
  const params = useParams(); const router = useRouter(); const id = Number(params.id);
  const [name,setName]=useState("");const [date,setDate]=useState("");const [price,setPrice]=useState("");const [cat,setCat]=useState("");
  const [status,setStatus]=useState("active");const [imageUrl,setImageUrl]=useState<string|null>(null);const [note,setNote]=useState("");
  const [loading,setLoading]=useState(true);const [sub,setSub]=useState(false);

  useEffect(()=>{let c=false;fetch(`/api/items/${id}`).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(d=>{if(c)return;setName(d.name??"");setDate(d.date??"");setPrice(d.price!=null?String(d.price):"");setCat(d.category??"");setStatus(d.status??"active");setImageUrl(d.imageUrl);setNote(d.note??"");setLoading(false)}).catch(()=>{if(!c){toast.error("加载失败");setLoading(false)}});return()=>{c=true}}, [id]);

  async function handleSubmit(e:React.FormEvent){e.preventDefault();if(!name.trim()||!price){toast.error("请填写物品名和价格");return;}setSub(true);
    try{const r=await fetch(`/api/items/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),date,price:Number(price),category:cat||null,status,imageUrl,note:note.trim()||null})});
      if(!r.ok){toast.error((await r.json()).error??"保存失败");setSub(false);return;}router.replace("/items")}catch{toast.error("保存失败");setSub(false)}}

  async function handleDelete(){if(!confirm("确定删除？"))return;await fetch(`/api/items/${id}`,{method:"DELETE"});router.replace("/items")}

  if(loading)return <><TopBar title="编辑物品" showBell={false}/><div className="px-4 py-6 space-y-4">{Array.from({length:3}).map((_,i)=><div key={i} className="h-10 rounded bg-muted/50 animate-pulse"/>)}</div></>;

  return (<div className="flex flex-col min-h-full"><TopBar title="编辑物品" showBell={false}/>
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
      <div className="space-y-2"><Label htmlFor="n">物品名 *</Label><Input id="n" value={name} onChange={e=>setName(e.target.value)} required/></div>
      <div className="space-y-2"><Label htmlFor="d">购买日期 *</Label><Input id="d" type="date" value={date} onChange={e=>setDate(e.target.value)} required/></div>
      <div className="space-y-2"><Label htmlFor="p">价格（元）*</Label><Input id="p" type="number" value={price} onChange={e=>setPrice(e.target.value)} required/></div>
      <div className="space-y-2"><Label>分类</Label><div className="flex flex-wrap gap-2">{categories.map(c=><button key={c} type="button" onClick={()=>setCat(cat===c?"":c)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",cat===c?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/70")}>{c}</button>)}</div></div>
      <div className="space-y-2"><Label>状态</Label><div className="flex gap-2">{[{k:"active",l:"服役中"},{k:"retired",l:"已退役"}].map(o=><button key={o.k} type="button" onClick={()=>setStatus(o.k)} className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",status===o.k?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/70")}>{o.l}</button>)}</div></div>
      <div className="space-y-2"><Label>照片（可选）</Label>{imageUrl?<div className="relative rounded-lg overflow-hidden ring-1 ring-foreground/10"><img src={imageUrl} alt="" className="w-full h-48 object-cover"/><button type="button" onClick={()=>setImageUrl(null)} className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-xs text-muted-foreground">移除</button></div>:<ImageUpload onUpload={url=>setImageUrl(url)}/>}</div>
      <div className="space-y-2"><Label htmlFor="no">备注（可选）</Label><Textarea id="no" value={note} onChange={e=>setNote(e.target.value)} rows={2}/></div>
      <div className="mt-auto pt-4 space-y-3"><Button type="submit" disabled={sub||!name.trim()||!price} className="w-full">{sub?"保存中...":"保存修改"}</Button><Button type="button" variant="destructive" className="w-full" onClick={handleDelete}>删除物品</Button></div>
    </form></div>);
}
