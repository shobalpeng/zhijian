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

interface Task {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  points: number;
  creatorId: number;
  assigneeId: number;
  creatorName?: string;
  assigneeName?: string;
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "待完成",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  submitted: {
    label: "待确认",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  confirmed: {
    label: "已完成",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmBody, setConfirmBody] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmText, setConfirmText] = useState("确认");
  const [confirmVariant, setConfirmVariant] = useState<"default" | "destructive">("default");
  const [statusPulse, setStatusPulse] = useState(false);

  const fetchTask = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError("无效的任务 ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("任务不存在");
        } else if (res.status === 403) {
          setError("无权访问此任务");
        } else if (res.status === 401) {
          setError("请先登录");
        } else {
          setError("加载失败");
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTask(data.task);
      setError(null);
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchTask();
    fetchUser();
  }, [fetchTask, fetchUser]);

  const isCreator = user && task ? user.userId === task.creatorId : false;
  const isAssignee = user && task ? user.userId === task.assigneeId : false;
  const isConfirmed = task?.status === "confirmed";
  const isPending = task?.status === "pending";
  const isSubmitted = task?.status === "submitted";

  function showConfirm(
    title: string,
    body: string,
    action: () => void,
    text = "确认",
    variant: "default" | "destructive" = "default"
  ) {
    setConfirmTitle(title);
    setConfirmBody(body);
    setConfirmAction(() => action);
    setConfirmText(text);
    setConfirmVariant(variant);
    setConfirmOpen(true);
  }

  async function handleSubmit() {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "操作失败");
        return;
      }
      toast.success("已提交完成，等待对方确认");
      setStatusPulse(true); setTimeout(() => setStatusPulse(false), 600);
      fetchTask();
    } catch {
      toast.error("操作失败");
    }
  }

  async function handleConfirm() {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "操作失败");
        return;
      }
      toast.success("确认完成，积分已发放");
      setStatusPulse(true); setTimeout(() => setStatusPulse(false), 600);
      fetchTask();
    } catch {
      toast.error("操作失败");
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "删除失败");
        return;
      }
      router.replace("/tasks");
    } catch {
      toast.error("删除失败");
    }
  }

  function promptDelete() {
    showConfirm(
      "删除任务",
      "确定要删除此任务吗？",
      handleDelete,
      "删除",
      "destructive"
    );
  }

  // ─── Render states ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="任务详情" showBell={false} />
        <div className="px-4 py-6 space-y-4">
          <div className="h-8 w-3/4 rounded bg-muted/50 animate-pulse" />
          <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-muted/50 animate-pulse" />
          <div className="h-48 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="任务详情" showBell={false} />
        <div className="flex flex-col items-center justify-center flex-1 gap-3 px-4 py-16">
          <p className="text-sm text-muted-foreground">
            {error ?? "任务不存在"}
          </p>
          <Button variant="outline" onClick={() => router.push("/tasks")}>
            返回任务列表
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────

  const config = statusConfig[task.status] ?? statusConfig.pending;
  const canEdit = isCreator && isPending;
  const canDelete = isCreator && isPending;
  const canSubmit =
    isAssignee && isPending;
  const canConfirm =
    isCreator && isSubmitted;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <TopBar title="任务详情" showBell={false} />

      <div className="px-4 py-6 space-y-5">
        {/* Image */}
        {task.imageUrl && (
          <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={task.imageUrl}
              alt={task.title}
              className="w-full h-56 object-cover"
            />
          </div>
        )}

        {/* Points + Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-primary tabular-nums">
            {task.points} 分
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              config.className,
              statusPulse && "animate-status-pulse"
            )}
          >
            {config.label}
          </span>
        </div>

        {/* Title + Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold leading-snug">{task.title}</h2>
          {task.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          )}
        </div>

        {/* Creator / Assignee / Timeline */}
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground border-t pt-4">
          <div className="flex justify-between">
            <span>发布者</span>
            <span className="text-foreground">{task.creatorName ?? `用户${task.creatorId}`}</span>
          </div>
          <div className="flex justify-between">
            <span>执行者</span>
            <span className="text-foreground">{task.assigneeName ?? `用户${task.assigneeId}`}</span>
          </div>

          {/* Timeline */}
          <div className="mt-2 pt-2 border-t border-dashed border-foreground/10">
            <div className="flex justify-between">
              <span>创建时间</span>
              <span className="text-foreground">{formatTime(task.createdAt)}</span>
            </div>
            {task.submittedAt && (
              <div className="flex justify-between">
                <span>提交时间</span>
                <span className="text-foreground">{formatTime(task.submittedAt)}</span>
              </div>
            )}
            {task.confirmedAt && (
              <div className="flex justify-between">
                <span>确认时间</span>
                <span className="text-foreground">{formatTime(task.confirmedAt)}</span>
              </div>
            )}
            {task.updatedAt !== task.createdAt && task.updatedAt !== task.submittedAt && task.updatedAt !== task.confirmedAt && (
              <div className="flex justify-between">
                <span>最近编辑</span>
                <span className="text-foreground">{formatTime(task.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          {/* Assignee: submit task */}
          {canSubmit && (
            <Button
              className="w-full"
              onClick={() =>
                showConfirm(
                  "完成任务",
                  "确定已完成此任务？确认后将通知对方进行审核。",
                  handleSubmit,
                  "确认完成"
                )
              }
            >
              完成任务
            </Button>
          )}

          {/* Creator: confirm */}
          {canConfirm && (
            <Button
              className="w-full"
              onClick={() =>
                showConfirm(
                  "确认完成",
                  `确认后将为对方发放 ${task.points} 积分。`,
                  handleConfirm,
                  "确认完成"
                )
              }
            >
              确认完成
            </Button>
          )}

          {/* Creator: edit + delete (only in pending status) */}
          {(canEdit || canDelete) && (
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/tasks/${id}/edit`)}
                >
                  编辑
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={promptDelete}
                >
                  删除
                </Button>
              )}
            </div>
          )}

          {/* Confirmed locked message */}
          {isConfirmed && (
            <p className="text-center text-xs text-muted-foreground">
              任务已完成，已锁定
            </p>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        body={confirmBody}
        onConfirm={confirmAction}
        confirmText={confirmText}
        variant={confirmVariant}
      />
    </div>
  );
}
