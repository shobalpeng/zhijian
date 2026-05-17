"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsData {
  pairedUserId: number | null;
  inviteCode: string | null;
  pairedUsername: string | null;
}

export default function PairingPage() {
  const router = useRouter();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerCode, setPartnerCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleCopyInviteCode() {
    if (!data?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(data.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }

  async function handlePair() {
    if (!partnerCode.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: partnerCode.trim() }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "配对失败");
        setSubmitting(false);
        return;
      }
      // Refresh data
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        setData(d);
      }
      setPartnerCode("");
    } catch {
      setError("配对失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="配对管理" showBell={false} />
        <div className="px-4 py-6 space-y-4">
          <div className="h-16 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-16 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </div>
    );
  }

  const isPaired = data?.pairedUserId != null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <TopBar title="配对管理" showBell={false} />

      <div className="px-4 py-6 space-y-6">
        {/* My invite code */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">我的邀请码</h2>
          <p className="text-xs text-muted-foreground">
            将邀请码分享给伴侣，让对方输入以完成配对
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-muted px-4 py-3 text-center font-mono text-lg tracking-wider select-all">
              {data?.inviteCode ?? "-"}
            </div>
            <button
              onClick={handleCopyInviteCode}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-card ring-1 ring-foreground/10 hover:bg-muted transition-colors shrink-0"
              aria-label="复制邀请码"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Pairing status / input */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            {isPaired ? "已配对" : "配对伴侣"}
          </h2>

          {isPaired ? (
            <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
              <p className="text-sm">
                已与{" "}
                <span className="font-semibold text-primary">
                  {data?.pairedUsername ?? "伴侣"}
                </span>{" "}
                配对
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                输入伴侣的邀请码来完成配对
              </p>
              <Input
                value={partnerCode}
                onChange={(e) => {
                  setPartnerCode(e.target.value);
                  setError(null);
                }}
                placeholder="输入伴侣的邀请码"
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
              <Button
                className="w-full"
                disabled={submitting || !partnerCode.trim()}
                onClick={handlePair}
              >
                {submitting ? "配对中..." : "确认配对"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
