"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Wish {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  points: number;
  creatorId: number;
  fulfillerId: number;
  creatorName?: string;
  fulfillerName?: string;
  status: "pending" | "submitted" | "confirmed";
  createdAt: string;
  submittedAt: string | null;
  confirmedAt: string | null;
  updatedAt: string;
}

interface CurrentUser {
  userId: number;
  username: string;
  pairedUserId: number;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "待完成", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  submitted: { label: "待确认", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  confirmed: { label: "已完成", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export default function WishDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [wish, setWish] = useState<Wish | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmBody, setConfirmBody] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmText, setConfirmText] = useState("确认");
  const [confirmVariant, setConfirmVariant] = useState<"default" | "destructive">("default");
  const [statusPulse, setStatusPulse] = useState(false);

  const fetchWish = useCallback(async () => {
    if (!id || isNaN(id)) { setError("无效的心愿 ID"); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/wishes/${id}`);
      if (!res.ok) {
        if (res.status === 404) setError("心愿不存在");
        else if (res.status === 403) setError("无权访问此心愿");
        else if (res.status === 401) setError("请先登录");
        else setError("加载失败");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setWish(data.wish);
      setError(null);
    } catch { setError("加载失败"); }
    finally { setLoading(false); }
  }, [id]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) { const data = await res.json(); setUser(data); }
    } catch {}
  }, []);

  useEffect(() => { fetchWish(); fetchUser(); }, [fetchWish, fetchUser]);

  const isCreator = user && wish ? user.userId === wish.creatorId : false;
  const isFulfiller = user && wish ? user.userId === wish.fulfillerId : false;
  const isPending = wish?.status === "pending";
  const isSubmitted = wish?.status === "submitted";
  const isConfirmed = wish?.status === "confirmed";

  function showConfirm(title: string, body: string, action: () => void, text = "确认", variant: "default" | "destructive" = "default") {
    setConfirmTitle(title); setConfirmBody(body); setConfirmAction(() => action);
    setConfirmText(text); setConfirmVariant(variant); setConfirmOpen(true);
  }

  async function handleSubmit() {
    try {
      const res = await fetch(`/api/wishes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submit" }) });
      if (!res.ok) { const err = await res.json(); toast.error(err.error ?? "操作失败"); return; }
      toast.success("已提交完成，等待对方确认");
      setStatusPulse(true); setTimeout(() => setStatusPulse(false), 600);
      fetchWish();
    } catch { toast.error("操作失败"); }
  }

  async function handleConfirm() {
    try {
      const res = await fetch(`/api/wishes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "confirm" }) });
      if (!res.ok) { const err = await res.json(); toast.error(err.error ?? "操作失败"); return; }
      toast.success("已确认完成");
      setStatusPulse(true); setTimeout(() => setStatusPulse(false), 600);
      fetchWish();
    } catch { toast.error("操作失败"); }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/wishes/${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); toast.error(err.error ?? "删除失败"); return; }
      router.replace("/wishes");
    } catch { toast.error("删除失败"); }
  }

  function promptDelete() { showConfirm("删除心愿", "确定要删除此心愿吗？", handleDelete, "删除", "destructive"); }

  function startEditing() {
    if (!wish) return;
    setEditTitle(wish.title); setEditDescription(wish.description ?? ""); setEditPoints(String(wish.points));
    setEditing(true);
  }

  function cancelEditing() { setEditing(false); }

  async function saveEditing() {
    if (!editTitle.trim() || !wish) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/wishes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editTitle.trim(), description: editDescription.trim() || null, points: Number(editPoints) }) });
      if (!res.ok) { const err = await res.json(); toast.error(err.error ?? "保存失败"); setSaving(false); return; }
      setEditing(false); fetchWish();
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  }

  if (loading) return <><TopBar title="心愿详情" showBell={false} /><div className="px-4 py-6 space-y-4"><div className="h-8 w-3/4 rounded bg-muted/50 animate-pulse" /><div className="h-4 w-full rounded bg-muted/50 animate-pulse" /></div></>;
  if (error || !wish) return <><TopBar title="心愿详情" showBell={false} /><div className="flex flex-col items-center justify-center flex-1 gap-3 px-4 py-16"><p className="text-sm text-muted-foreground">{error ?? "心愿不存在"}</p><Button variant="outline" onClick={() => router.push("/wishes")}>返回心愿列表</Button></div></>;

  const config = statusConfig[wish.status] ?? statusConfig.pending;
  const canEdit = isCreator && isPending;
  const canDelete = isCreator && isPending;
  const canSubmit = isFulfiller && isPending;
  const canConfirm = isCreator && isSubmitted;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="心愿详情" showBell={false} />

      <div className="px-4 py-6 space-y-5">
        {wish.imageUrl && (<div className="rounded-xl overflow-hidden ring-1 ring-foreground/10"><img src={wish.imageUrl} alt={wish.title} className="w-full h-56 object-cover" /></div>)}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-primary tabular-nums">{wish.points} 分</span>
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.className, statusPulse && "animate-status-pulse")}>{config.label}</span>
        </div>

        {editing ? (
          <div className="space-y-3">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="心愿标题" />
            <Input type="number" value={editPoints} onChange={e => setEditPoints(e.target.value)} placeholder="积分" />
            <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="描述（可选）" rows={4} />
            <div className="flex gap-2">
              <Button variant="default" onClick={saveEditing} disabled={saving || !editTitle.trim()} size="sm">{saving ? "保存中..." : "保存"}</Button>
              <Button variant="outline" onClick={cancelEditing} size="sm">取消</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{wish.title}</h2>
            {wish.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{wish.description}</p>}
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground border-t pt-4">
          <div className="flex justify-between"><span>发布者</span><span className="text-foreground">{wish.creatorName ?? `用户${wish.creatorId}`}</span></div>
          <div className="flex justify-between"><span>实现者</span><span className="text-foreground">{wish.fulfillerName ?? `用户${wish.fulfillerId}`}</span></div>

          <div className="mt-2 pt-2 border-t border-dashed border-foreground/10">
            <div className="flex justify-between"><span>创建时间</span><span className="text-foreground">{formatTime(wish.createdAt)}</span></div>
            {wish.submittedAt && <div className="flex justify-between"><span>提交时间</span><span className="text-foreground">{formatTime(wish.submittedAt)}</span></div>}
            {wish.confirmedAt && <div className="flex justify-between"><span>确认时间</span><span className="text-foreground">{formatTime(wish.confirmedAt)}</span></div>}
            {wish.updatedAt !== wish.createdAt && wish.updatedAt !== wish.submittedAt && wish.updatedAt !== wish.confirmedAt && (
              <div className="flex justify-between"><span>最近编辑</span><span className="text-foreground">{formatTime(wish.updatedAt)}</span></div>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {canSubmit && (<Button className="w-full" onClick={() => showConfirm("完成心愿", "确定已完成此心愿？确认后将通知对方进行审核。", handleSubmit, "确认完成")}>完成心愿</Button>)}
          {canConfirm && (<Button className="w-full" onClick={() => showConfirm("确认完成", `确认后将扣除你 ${wish.points} 积分。`, handleConfirm, "确认完成")}>确认完成</Button>)}

          {(canEdit || canDelete) && !editing && (
            <div className="flex gap-2">
              {canEdit && <Button variant="outline" className="flex-1" onClick={startEditing}>编辑</Button>}
              {canDelete && <Button variant="destructive" className="flex-1" onClick={promptDelete}>删除</Button>}
            </div>
          )}

          {isConfirmed && <p className="text-center text-xs text-muted-foreground">心愿已完成，已锁定</p>}
        </div>
      </div>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title={confirmTitle} body={confirmBody} onConfirm={confirmAction} confirmText={confirmText} variant={confirmVariant} />
    </div>
  );
}
