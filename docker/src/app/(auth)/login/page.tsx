"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("请输入用户名和密码");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "登录失败");
        setSubmitting(false);
        return;
      }

      router.push(redirect);
    } catch {
      setError("网络错误");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">我们的空间</h1>
        <p className="text-sm text-muted-foreground">登录你的账号</p>
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
            placeholder="请输入用户名"
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
            placeholder="请输入密码"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "登录中..." : "登录"}
        </Button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground">
        没有账号？
        <Link
          href="/register"
          className="text-primary hover:underline ml-1 font-medium"
        >
          去注册
        </Link>
      </p>
    </div>
  );
}
