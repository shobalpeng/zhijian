import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import {
  getTaskById,
  createNotification,
  createPointTransaction,
} from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return Response.json({ error: "Invalid task id" }, { status: 400 });
  }

  const task = getTaskById(taskId);
  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.creatorId !== session.userId && task.assigneeId !== session.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const creator = db.select({ username: users.username }).from(users).where(eq(users.id, task.creatorId)).get();
  const assignee = db.select({ username: users.username }).from(users).where(eq(users.id, task.assigneeId)).get();

  return Response.json({
    task: {
      ...task,
      creatorName: creator?.username ?? "未知",
      assigneeName: assignee?.username ?? "未知",
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return Response.json({ error: "Invalid task id" }, { status: 400 });
  }

  const task = getTaskById(taskId);
  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await request.json();
  const { action, title, description, points, imageUrl } = body;

  const now = new Date().toISOString();

  // Submit action (assignee: pending -> submitted)
  if (action === "submit") {
    if (task.assigneeId !== session.userId) {
      return Response.json({ error: "Only the assignee can submit" }, { status: 403 });
    }
    if (task.status !== "pending") {
      return Response.json({ error: "Task is not in pending status" }, { status: 400 });
    }

    db.update(tasks)
      .set({ status: "submitted", submittedAt: now, updatedAt: now })
      .where(eq(tasks.id, taskId))
      .run();

    createNotification({
      userId: task.creatorId,
      type: "task_submitted",
      title: "任务待确认",
      body: `${session.username} 已完成任务: ${task.title}`,
      linkType: "task",
      linkId: taskId,
    });

    const updated = getTaskById(taskId);
    return Response.json({ task: updated });
  }

  // Confirm action (creator: submitted -> confirmed, grant points)
  if (action === "confirm") {
    if (task.creatorId !== session.userId) {
      return Response.json({ error: "Only the creator can confirm" }, { status: 403 });
    }
    if (task.status !== "submitted") {
      return Response.json({ error: "Task is not in submitted status" }, { status: 400 });
    }

    db.update(tasks)
      .set({ status: "confirmed", confirmedAt: now, updatedAt: now })
      .where(eq(tasks.id, taskId))
      .run();

    createPointTransaction({
      userId: task.assigneeId,
      amount: task.points,
      type: "earned",
      sourceType: "task",
      sourceId: taskId,
    });

    createNotification({
      userId: task.assigneeId,
      type: "task_confirmed",
      title: "任务已完成",
      body: `${session.username} 确认了任务: ${task.title}，你获得了 ${task.points} 积分！`,
      linkType: "task",
      linkId: taskId,
    });

    const updated = getTaskById(taskId);
    return Response.json({ task: updated });
  }

  // Edit fields — only in pending status
  if (task.creatorId !== session.userId) {
    return Response.json({ error: "Only the creator can edit" }, { status: 403 });
  }
  if (task.status !== "pending") {
    return Response.json({ error: "当前状态不可编辑" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: now };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (points !== undefined) updates.points = Number(points);
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;

  db.update(tasks).set(updates).where(eq(tasks.id, taskId)).run();

  createNotification({
    userId: task.assigneeId,
    type: "task_edited",
    title: "任务已编辑",
    body: `${session.username} 编辑了任务: ${title || task.title}`,
    linkType: "task",
    linkId: taskId,
  });

  const updated = getTaskById(taskId);
  return Response.json({ task: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return Response.json({ error: "Invalid task id" }, { status: 400 });
  }

  const task = getTaskById(taskId);
  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.creatorId !== session.userId) {
    return Response.json({ error: "Only the creator can delete" }, { status: 403 });
  }
  if (task.status !== "pending") {
    return Response.json({ error: "当前状态不可删除" }, { status: 400 });
  }

  createNotification({
    userId: task.assigneeId,
    type: "task_deleted",
    title: "任务已删除",
    body: `${session.username} 删除了任务: ${task.title}`,
    linkType: "task",
    linkId: taskId,
  });

  db.delete(tasks).where(eq(tasks.id, taskId)).run();

  return Response.json({ success: true });
}
