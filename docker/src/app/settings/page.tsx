"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";

interface SettingsData {
  theme: string;
  monthlyPointCap: number | null;
  inviteCode: string | null;
  pairedUserId: number | null;
  username: string;
  pairedUsername: string | null;
  isAdmin: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCap, setEditingCap] = useState(false);
  const [capValue, setCapValue] = useState("");
  const [savingCap, setSavingCap] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setCapValue(d.monthlyPointCap?.toString() ?? "");
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveCap() {
    setSavingCap(true);
    try {
      const value = capValue.trim() ? Number(capValue) : null;
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyPointCap: value }),
      });
      if (!res.ok) {
        toast.error("保存失败");
        setSavingCap(false);
        return;
      }
      setData((prev) => (prev ? { ...prev, monthlyPointCap: value } : prev));
      setEditingCap(false);
    } catch {
      toast.error("保存失败");
    } finally {
      setSavingCap(false);
    }
  }

  function startEditCap() {
    setCapValue(data?.monthlyPointCap?.toString() ?? "");
    setEditingCap(true);
  }

  function cancelEditCap() {
    setCapValue(data?.monthlyPointCap?.toString() ?? "");
    setEditingCap(false);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      toast.error("退出失败");
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="我的" showBell={false} />
        <div className="px-4 py-6 space-y-4">
          <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-12 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-12 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-12 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="我的" showBell={false} />
      <div className="px-4 py-6 space-y-4">
        {/* User info card */}
        <Link href="/settings/profile" className="block rounded-xl bg-card ring-1 ring-foreground/10 p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary text-xl font-bold">
              {data?.username?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold">{data?.username ?? "-"}</h2>
              <p className="text-sm text-muted-foreground">
                {data?.pairedUserId ? "已配对" : "未配对"}
                {data?.pairedUsername ? ` - ${data.pairedUsername}` : ""}
              </p>
            </div>
            <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>

        {/* Pairing management */}
        <Link
          href="/settings/pairing"
          className="block rounded-xl bg-card ring-1 ring-foreground/10 p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">配对管理</span>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* About */}
        <Link
          href="/settings/about"
          className="block rounded-xl bg-card ring-1 ring-foreground/10 p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">关于织间</span>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Theme toggle */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">主题切换</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme("warm")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                  theme === "warm"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                温馨
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                  theme === "dark"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                黑夜
              </button>
            </div>
          </div>
        </div>

        {/* Admin */}
        {data?.isAdmin === 1 && (
          <Link
            href="/admin"
            className="block rounded-xl bg-card ring-1 ring-foreground/10 p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">管理后台</span>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </div>
    </>
  );
}
