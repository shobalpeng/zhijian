"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    inviteCode: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("请输入用户名和密码");
      return;
    }

    if (username.trim().length < 2) {
      setError("用户名至少2个字符");
      return;
    }

    if (password.length < 4) {
      setError("密码至少4个字符");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, string> = {
        username: username.trim(),
        password,
      };
      if (inviteCode.trim()) {
        body.inviteCode = inviteCode.trim();
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "注册失败");
        setSubmitting(false);
        return;
      }

      // Show success with invite code, then redirect
      setSuccessInfo({ inviteCode: data.inviteCode });
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch {
      setError("网络错误");
      setSubmitting(false);
    }
  }

  // Success state
  if (successInfo) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">注册成功</h1>
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-6 space-y-3">
          <p className="text-sm text-muted-foreground">你的邀请码</p>
          <p className="text-2xl font-mono font-bold tracking-wider text-primary select-all">
            {successInfo.inviteCode}
          </p>
          <p className="text-xs text-muted-foreground">
            将此邀请码分享给伴侣以完成配对
          </p>
        </div>
        <p className="text-xs text-muted-foreground">即将跳转到首页...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">注册账号</h1>
        <p className="text-sm text-muted-foreground">创建你的空间</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            placeholder="至少2个字符"
            autoComplete="username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="至少4个字符"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inviteCode">
            邀请码
            <span className="text-xs text-muted-foreground ml-1">（可选）</span>
          </Label>
          <Input
            id="inviteCode"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value);
              setError(null);
            }}
            placeholder="输入伴侣的邀请码完成配对"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "注册中..." : "注册"}
        </Button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        已有账号？
        <Link
          href="/login"
          className="text-primary hover:underline ml-1 font-medium"
        >
          去登录
        </Link>
      </p>
    </div>
  );
}
