"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { TaskCard } from "@/components/TaskCard";
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

interface Task {
  id: number;
  title: string;
  points: number;
  status: string;
  creatorId: number;
  assigneeId: number;
}

const PAGE_SIZE = 10;

const roleOptions = [
  { value: "all", label: "全部任务" },
  { value: "assigned", label: "指派给我的" },
  { value: "created", label: "我发布的" },
];

const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "待完成" },
  { value: "submitted", label: "待确认" },
  { value: "confirmed", label: "已完成" },
];

function TasksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState(searchParams.get("role") || "assigned");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  useEffect(() => { setMounted(true); }, []);
  // After hydration, apply localStorage fallback if no URL param
  useEffect(() => {
    if (!mounted) return;
    if (!searchParams.get("role")) {
      const stored = localStorage.getItem("tasks-role");
      if (stored) setRole(stored);
    }
    if (!searchParams.get("status")) {
      const stored = localStorage.getItem("tasks-status");
      if (stored) setStatus(stored);
    }
  }, [mounted]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filters — URL params first, then localStorage fallback (after hydration)

  function setRoleValue(v: string) {
    localStorage.setItem("tasks-role", v);
    setRole(v);
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", v);
    router.replace(`/tasks?${params.toString()}`, { scroll: false });
  }
  function setStatusValue(v: string) {
    localStorage.setItem("tasks-status", v);
    setStatus(v);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", v);
    router.replace(`/tasks?${params.toString()}`, { scroll: false });
  }

  async function loadTasks() {
    setLoading(true);
    const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
    try {
      const [meRes, assignedRes, createdRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/tasks?type=assigned${searchParam}`),
        fetch(`/api/tasks?type=created${searchParam}`),
      ]);
      const me = await meRes.json();
      setUserId(me.userId);

      const assigned = ((await assignedRes.json()).tasks ?? []) as Task[];
      const created = ((await createdRes.json()).tasks ?? []) as Task[];
      const map = new Map<number, Task>();
      assigned.forEach((t) => map.set(t.id, t));
      created.forEach((t) => map.set(t.id, t));
      setTasks(Array.from(map.values()));
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, [debouncedSearch]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchRole =
        role === "all"
          ? true
          : role === "assigned"
          ? t.assigneeId === userId
          : t.creatorId === userId;
      const matchStatus = status === "all" || t.status === status;
      return matchRole && matchStatus;
    });
  }, [tasks, role, status, userId]);

  const displayedTasks = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > displayedTasks.length;

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, role, status]);

  return (
    <>
      <TopBar title="任务" />

      <PullToRefresh onRefresh={loadTasks}>
      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索任务..." className="pl-9" />
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

      {/* Task list */}
      <div className="px-4">
        {loading ? (
          <Skeleton className="h-[72px]" count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🏃" title={debouncedSearch ? "没有找到匹配的任务" : "还没有任务"} description={debouncedSearch ? "换个关键词试试" : "发布第一个任务，开始攒积分吧"} />
        ) : (
          <><div className="space-y-3">
            {displayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                points={task.points}
                status={task.status}
                createdAt={(task as any).createdAt}
                submittedAt={(task as any).submittedAt}
                creatorLabel={
                  task.creatorId === userId
                    ? "发布者：我"
                    : task.assigneeId === userId
                    ? "来自：Ta"
                    : undefined
                }
              />
            ))}
          </div>
          {hasMore && (
            <div className="pt-4 pb-2 text-center">
              <button onClick={() => setPage(p => p + 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                查看更多（{filtered.length - displayedTasks.length}条）
              </button>
            </div>
          )}</>
        )}
      </div>
      </PullToRefresh>
    </>
  );
}

export default function TasksPage() {
  return <Suspense><TasksContent /></Suspense>;
}
