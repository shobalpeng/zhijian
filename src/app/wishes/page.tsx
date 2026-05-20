"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { WishCard } from "@/components/WishCard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Wish {
  id: number;
  title: string;
  points: number;
  status: string;
  creatorId: number;
  fulfillerId: number;
  creatorName?: string;
  fulfillerName?: string;
}

const PAGE_SIZE = 10;

const roleOptions = [
  { value: "all", label: "全部心愿" },
  { value: "mine", label: "我的心愿" },
  { value: "partner", label: "Ta的心愿" },
];

const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "待完成" },
  { value: "submitted", label: "待确认" },
  { value: "confirmed", label: "已完成" },
];

function WishesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [myWishes, setMyWishes] = useState<Wish[]>([]);
  const [partnerWishes, setPartnerWishes] = useState<Wish[]>([]);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState(searchParams.get("role") || "mine");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    if (!searchParams.get("role")) {
      const stored = localStorage.getItem("wishes-role");
      if (stored) setRole(stored);
    }
    if (!searchParams.get("status")) {
      const stored = localStorage.getItem("wishes-status");
      if (stored) setStatus(stored);
    }
  }, [mounted]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filters — URL params first, then localStorage fallback (after hydration)

  function setRoleValue(v: string) { localStorage.setItem("wishes-role", v); setRole(v); const p = new URLSearchParams(searchParams.toString()); p.set("role", v); router.replace(`/wishes?${p.toString()}`, { scroll: false }); }
  function setStatusValue(v: string) { localStorage.setItem("wishes-status", v); setStatus(v); const p = new URLSearchParams(searchParams.toString()); p.set("status", v); router.replace(`/wishes?${p.toString()}`, { scroll: false }); }

  async function loadWishes() {
    setLoading(true);
    const searchParam = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    try {
      const [meRes, wishesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/wishes${searchParam}`),
      ]);
      const me = await meRes.json();
      setUserId(me.userId);
      if (!wishesRes.ok) throw new Error("Failed to fetch");
      const data = await wishesRes.json();
      setMyWishes(data.myWishes ?? []);
      setPartnerWishes(data.partnerWishes ?? []);
    } catch {
      setMyWishes([]);
      setPartnerWishes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadWishes(); }, [debouncedSearch]);

  const filtered = useMemo(() => {
    const source = role === "all" ? [...myWishes, ...partnerWishes] : role === "mine" ? myWishes : partnerWishes;
    return source.filter((w) => status === "all" || w.status === status);
  }, [myWishes, partnerWishes, role, status]);

  const displayedWishes = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > displayedWishes.length;

  useEffect(() => { setPage(1); }, [debouncedSearch, role, status]);

  return (
    <>
      <TopBar title="心愿" />

      <PullToRefresh onRefresh={loadWishes}>
      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索心愿..." className="pl-9" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-3">
        <Select value={role} onValueChange={(v) => v && setRoleValue(v)}>
          <SelectTrigger className="flex-1 h-9 text-sm">
            <SelectValue>
              {roleOptions.find((o) => o.value === role)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => v && setStatusValue(v)}>
          <SelectTrigger className="flex-1 h-9 text-sm">
            <SelectValue>
              {statusOptions.find((o) => o.value === status)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Wish list */}
      <div className="px-4">
        {loading ? (
          <Skeleton className="h-[72px]" count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="💝" title={debouncedSearch ? "没有找到匹配的心愿" : "还没有心愿"} description={debouncedSearch ? "换个关键词试试" : "发布一个心愿，让Ta来实现吧"} />
        ) : (
          <><div className="space-y-3">
            {displayedWishes.map((wish) => (
              <WishCard
                key={wish.id}
                id={wish.id}
                title={wish.title}
                points={wish.points}
                status={wish.status}
                createdAt={(wish as any).createdAt}
                submittedAt={(wish as any).submittedAt}
                creatorLabel={
                  wish.creatorId === userId
                    ? "发布者：我"
                    : wish.fulfillerId === userId
                    ? "来自：Ta"
                    : undefined
                }
              />
            ))}
          </div>
          {hasMore && (
            <div className="pt-4 pb-2 text-center">
              <button onClick={() => setPage(p => p + 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                查看更多（{filtered.length - displayedWishes.length}条）
              </button>
            </div>
          )}</>
        )}
      </div>
      </PullToRefresh>
    </>
  );
}

export default function WishesPage() {
  return <Suspense><WishesContent /></Suspense>;
}
