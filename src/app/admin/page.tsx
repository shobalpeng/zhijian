"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User { id: number; username: string; inviteCode: string; pairedUserId: number | null; isAdmin: number; createdAt: string; }
interface Task { id: number; title: string; description?: string; points: number; status: string; creatorId: number; assigneeId: number; creatorName?: string; assigneeName?: string; createdAt: string; }
interface Wish { id: number; title: string; description?: string; points: number; status: string; creatorId: number; fulfillerId: number; creatorName?: string; fulfillerName?: string; createdAt: string; }

const statusLabels: Record<string, string> = { pending: "待完成", submitted: "待确认", confirmed: "已完成" };
const PAGE_SIZE = 10;

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const [wishPage, setWishPage] = useState(1);

  // Admin setup
  const [adminUser, setAdminUser] = useState("");

  // Create/Edit form state
  const [editing, setEditing] = useState<{ type: string; data: any } | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const me = await fetch("/api/auth/me").then(r => r.json());
        if (!me.isAdmin) { router.replace("/"); return; }
        await refreshAll();
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [router]);

  async function refreshAll() {
    const [u, t, w] = await Promise.all([
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/tasks").then(r => r.json()),
      fetch("/api/admin/wishes").then(r => r.json()),
    ]);
    setUsers(u); setTasks(t); setWishes(w);
  }

  function resetPages() {
    setUserPage(1); setTaskPage(1); setWishPage(1);
  }

  async function setAdmin() {
    if (!adminUser.trim()) return;
    await fetch("/api/admin/set-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: adminUser.trim() }) });
    setAdminUser("");
    refreshAll();
  }

  async function toggleAdmin(id: number) {
    await fetch("/api/admin/toggle-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    refreshAll();
  }

  async function deleteEntity(type: string, id: number) {
    if (!confirm(`确定删除此${type}？`)) return;
    await fetch(`/api/admin/${type}s/${id}`, { method: "DELETE" });
    refreshAll();
  }

  function startCreate(type: string) {
    setEditing({ type, data: null });
    setForm({});
  }

  function startEdit(type: string, data: any) {
    setEditing({ type, data });
    const f: Record<string, string> = {};
    if (type === "user") { f.username = data.username || ""; f.inviteCode = data.inviteCode || ""; f.pairedUserId = data.pairedUserId?.toString() || ""; }
    if (type === "task" || type === "wish") {
      f.title = data.title || ""; f.description = data.description || ""; f.points = data.points?.toString() || ""; f.status = data.status || "";
      if (type === "task") { f.creatorId = data.creatorId?.toString() || ""; f.assigneeId = data.assigneeId?.toString() || ""; }
      if (type === "wish") { f.creatorId = data.creatorId?.toString() || ""; f.fulfillerId = data.fulfillerId?.toString() || ""; }
    }
    setForm(f);
  }

  async function saveEntity() {
    if (!editing) return;
    const { type, data } = editing;
    const isNew = !data;
    const url = isNew ? `/api/admin/${type}s` : `/api/admin/${type}s/${data.id}`;
    const method = isNew ? "POST" : "PUT";
    const body: any = {};
    if (type === "user") { body.username = form.username; if (form.inviteCode) body.inviteCode = form.inviteCode; if (form.pairedUserId) body.pairedUserId = Number(form.pairedUserId); }
    if (type === "task" || type === "wish") {
      body.title = form.title; body.description = form.description || null; body.points = Number(form.points); body.status = form.status;
      if (type === "task") { body.creatorId = Number(form.creatorId); body.assigneeId = Number(form.assigneeId); }
      if (type === "wish") { body.creatorId = Number(form.creatorId); body.fulfillerId = Number(form.fulfillerId); }
    }
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setEditing(null);
    refreshAll();
  }

  const visibleUsers = users.slice(0, userPage * PAGE_SIZE);
  const visibleTasks = tasks.slice(0, taskPage * PAGE_SIZE);
  const visibleWishes = wishes.slice(0, wishPage * PAGE_SIZE);

  if (loading) return <><TopBar title="管理后台" showBell={false} /><div className="p-4 text-sm text-muted-foreground">加载中...</div></>;

  return (
    <>
      <TopBar title="管理后台" showBell={false} />

      <div className="px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-sm font-medium">设置管理员</h3>
            <div className="flex gap-2">
              <Input placeholder="输入用户名" value={adminUser} onChange={e => setAdminUser(e.target.value)} className="h-8 text-sm" />
              <Button size="sm" onClick={setAdmin}>设为管理员</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setEditing(null); }}>
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1">用户 ({users.length})</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">任务 ({tasks.length})</TabsTrigger>
            <TabsTrigger value="wishes" className="flex-1">心愿 ({wishes.length})</TabsTrigger>
          </TabsList>

          {/* --- Users Tab --- */}
          <TabsContent value="users" className="mt-3 space-y-2">
            <Button size="sm" variant="outline" onClick={() => startCreate("user")}>+ 新建用户</Button>
            {visibleUsers.map(u => editing?.type === "user" && editing?.data?.id === u.id ? null : (
              <Card key={u.id}>
                <CardContent className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <span className="font-medium">{u.username}</span>
                    <span className="text-muted-foreground ml-2">{u.isAdmin ? "[管理员]" : ""} {u.pairedUserId ? "已配对" : "未配对"}</span>
                    <div className="text-xs text-muted-foreground">邀请码: {u.inviteCode} | 创建: {u.createdAt?.slice(0,10)}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => startEdit("user", u)}>编辑</Button>
                    <Button variant="outline" size="sm" onClick={() => toggleAdmin(u.id)}>{u.isAdmin ? "取消管理员" : "设为管理员"}</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteEntity("user", u.id)}>删除</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.length > userPage * PAGE_SIZE && (
              <Button variant="ghost" className="w-full" size="sm" onClick={() => setUserPage(p => p + 1)}>加载更多（{users.length - visibleUsers.length}条）</Button>
            )}
          </TabsContent>

          {/* --- Tasks Tab --- */}
          <TabsContent value="tasks" className="mt-3 space-y-2">
            <Button size="sm" variant="outline" onClick={() => startCreate("task")}>+ 新建任务</Button>
            {visibleTasks.map(t => editing?.type === "task" && editing?.data?.id === t.id ? null : (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <span className="font-medium">{t.title}</span>
                    <span className="text-primary ml-2">+{t.points}分</span>
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-muted">{statusLabels[t.status] || t.status}</span>
                    <div className="text-xs text-muted-foreground">发布者: {t.creatorName || t.creatorId} | 执行者: {t.assigneeName || t.assigneeId} | {t.createdAt?.slice(0,10)}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => startEdit("task", t)}>编辑</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteEntity("task", t.id)}>删除</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tasks.length > taskPage * PAGE_SIZE && (
              <Button variant="ghost" className="w-full" size="sm" onClick={() => setTaskPage(p => p + 1)}>加载更多（{tasks.length - visibleTasks.length}条）</Button>
            )}
          </TabsContent>

          {/* --- Wishes Tab --- */}
          <TabsContent value="wishes" className="mt-3 space-y-2">
            <Button size="sm" variant="outline" onClick={() => startCreate("wish")}>+ 新建心愿</Button>
            {visibleWishes.map(w => editing?.type === "wish" && editing?.data?.id === w.id ? null : (
              <Card key={w.id}>
                <CardContent className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <span className="font-medium">{w.title}</span>
                    <span className="text-primary ml-2">{w.points}分</span>
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-muted">{statusLabels[w.status] || w.status}</span>
                    <div className="text-xs text-muted-foreground">发布者: {w.creatorName || w.creatorId} | 实现者: {w.fulfillerName || w.fulfillerId} | {w.createdAt?.slice(0,10)}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => startEdit("wish", w)}>编辑</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteEntity("wish", w.id)}>删除</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {wishes.length > wishPage * PAGE_SIZE && (
              <Button variant="ghost" className="w-full" size="sm" onClick={() => setWishPage(p => p + 1)}>加载更多（{wishes.length - visibleWishes.length}条）</Button>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit/Create Form */}
        {editing && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium">{editing.data ? `编辑${editing.type === "user" ? "用户" : editing.type === "task" ? "任务" : "心愿"}` : `新建${editing.type === "user" ? "用户" : editing.type === "task" ? "任务" : "心愿"}`}</h3>

              {editing.type === "user" && (<>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">用户名</label><Input value={form.username || ""} onChange={e => setForm({...form, username: e.target.value})} className="h-8 text-sm" /></div>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">邀请码</label><Input value={form.inviteCode || ""} onChange={e => setForm({...form, inviteCode: e.target.value})} className="h-8 text-sm" /></div>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">配对用户ID（留空为未配对）</label><Input type="number" value={form.pairedUserId || ""} onChange={e => setForm({...form, pairedUserId: e.target.value})} className="h-8 text-sm" /></div>
              </>)}

              {(editing.type === "task" || editing.type === "wish") && (<>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">标题</label><Input value={form.title || ""} onChange={e => setForm({...form, title: e.target.value})} className="h-8 text-sm" /></div>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">描述（可选）</label><Input value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} className="h-8 text-sm" /></div>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">积分</label><Input type="number" value={form.points || ""} onChange={e => setForm({...form, points: e.target.value})} className="h-8 text-sm" /></div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">状态</label>
                  <Select value={form.status || "pending"} onValueChange={v => v && setForm({...form, status: v})}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1"><label className="text-xs text-muted-foreground">发布者ID</label><Input type="number" value={form.creatorId || ""} onChange={e => setForm({...form, creatorId: e.target.value})} className="h-8 text-sm" /></div>
                  {editing.type === "task" && <div className="flex-1 space-y-1"><label className="text-xs text-muted-foreground">执行者ID</label><Input type="number" value={form.assigneeId || ""} onChange={e => setForm({...form, assigneeId: e.target.value})} className="h-8 text-sm" /></div>}
                  {editing.type === "wish" && <div className="flex-1 space-y-1"><label className="text-xs text-muted-foreground">实现者ID</label><Input type="number" value={form.fulfillerId || ""} onChange={e => setForm({...form, fulfillerId: e.target.value})} className="h-8 text-sm" /></div>}
                </div>
              </>)}

              <div className="flex gap-2">
                <Button size="sm" onClick={saveEntity}>保存</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>取消</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
