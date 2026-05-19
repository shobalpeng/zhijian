"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current || !newPw) { setError("请填写所有字段"); return; }
    if (newPw.length < 4) { setError("新密码至少 4 个字符"); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "修改失败"); setSaving(false); return; }
      toast.success("密码已修改");
      setCurrent("");
      setNewPw("");
      router.replace("/settings");
    } catch { toast.error("修改失败"); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="修改密码" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        <div className="space-y-2">
          <label htmlFor="current" className="text-sm font-medium">当前密码</label>
          <Input id="current" type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="输入当前密码" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="new" className="text-sm font-medium">新密码</label>
          <Input id="new" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="至少 4 个字符" required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="mt-auto pt-4">
          <Button type="submit" disabled={saving || !current || !newPw || newPw.length < 4} className="w-full">
            {saving ? "修改中..." : "确认修改"}
          </Button>
        </div>
      </form>
    </div>
  );
}
