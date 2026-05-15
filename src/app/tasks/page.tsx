"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { TaskCard } from "@/components/TaskCard";
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

  // Filters — read from URL params
  const [role, setRoleState] = useState(searchParams.get("role") || "assigned");
  const [status, setStatusState] = useState(searchParams.get("status") || "all");

  function setRole(v: string) {
    setRoleState(v);
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", v);
    router.replace(`/tasks?${params.toString()}`, { scroll: false });
  }
  function setStatus(v: string) {
    setStatusState(v);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", v);
    router.replace(`/tasks?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [meRes, assignedRes, createdRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/tasks?type=assigned"),
          fetch("/api/tasks?type=created"),
        ]);
        const me = await meRes.json();
        setUserId(me.userId);

        const assigned = ((await assignedRes.json()).tasks ?? []) as Task[];
        const created = ((await createdRes.json()).tasks ?? []) as Task[];
        // Merge and deduplicate
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
    load();
  }, []);

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

  return (
    <>
      <TopBar title="任务" />

      {/* Filters */}
      <div className="flex gap-2 px-4 py-3">
        <Select value={role} onValueChange={(v) => v && setRole(v)}>
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

        <Select value={status} onValueChange={(v) => v && setStatus(v)}>
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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[72px] rounded-xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            暂无任务
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                points={task.points}
                status={task.status}
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
        )}
      </div>
    </>
  );
}

export default function TasksPage() {
  return <Suspense><TasksContent /></Suspense>;
}
