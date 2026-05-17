import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { wishes, users } from "@/db/schema";
import { createNotification, createPointTransaction } from "@/lib/db";
import { eq } from "drizzle-orm";

function getWishById(wishId: number) {
  return db.select().from(wishes).where(eq(wishes.id, wishId)).get();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const wishId = parseInt(id, 10);
  if (isNaN(wishId)) {
    return Response.json({ error: "Invalid wish id" }, { status: 400 });
  }

  const wish = getWishById(wishId);
  if (!wish) {
    return Response.json({ error: "Wish not found" }, { status: 404 });
  }

  if (wish.creatorId !== session.userId && wish.fulfillerId !== session.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const creator = db.select({ username: users.username }).from(users).where(eq(users.id, wish.creatorId)).get();
  const fulfiller = db.select({ username: users.username }).from(users).where(eq(users.id, wish.fulfillerId)).get();

  return Response.json({
    wish: {
      ...wish,
      creatorName: creator?.username ?? "未知",
      fulfillerName: fulfiller?.username ?? "未知",
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
  const wishId = parseInt(id, 10);
  if (isNaN(wishId)) {
    return Response.json({ error: "Invalid wish id" }, { status: 400 });
  }

  const wish = getWishById(wishId);
  if (!wish) {
    return Response.json({ error: "Wish not found" }, { status: 404 });
  }

  const body = await request.json();
  const { action, title, description, points, imageUrl } = body;

  const isCreator = wish.creatorId === session.userId;
  const isFulfiller = wish.fulfillerId === session.userId;

  if (!isCreator && !isFulfiller) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date().toISOString();

  // Submit: fulfiller marks as done (pending → submitted)
  if (action === "submit") {
    if (!isFulfiller) {
      return Response.json({ error: "Only the fulfiller can submit" }, { status: 403 });
    }
    if (wish.status !== "pending") {
      return Response.json({ error: "心愿不是待完成状态" }, { status: 400 });
    }

    db.update(wishes)
      .set({ status: "submitted", submittedAt: now, updatedAt: now })
      .where(eq(wishes.id, wishId))
      .run();

    createNotification({
      userId: wish.creatorId,
      type: "wish_submitted",
      title: "心愿待确认",
      body: `${session.username} 已完成心愿: ${wish.title}`,
      linkType: "wish",
      linkId: wishId,
    });

    const updated = getWishById(wishId)!;
    return Response.json({ wish: updated });
  }

  // Confirm: creator confirms (submitted → confirmed, grant points)
  if (action === "confirm") {
    if (!isCreator) {
      return Response.json({ error: "Only the creator can confirm" }, { status: 403 });
    }
    if (wish.status !== "submitted") {
      return Response.json({ error: "心愿不是待确认状态" }, { status: 400 });
    }

    db.update(wishes)
      .set({ status: "confirmed", confirmedAt: now, updatedAt: now })
      .where(eq(wishes.id, wishId))
      .run();

    createPointTransaction({
      userId: wish.creatorId,
      amount: -wish.points,
      type: "spent",
      sourceType: "wish",
      sourceId: wishId,
    });

    createNotification({
      userId: wish.fulfillerId,
      type: "wish_confirmed",
      title: "心愿已完成",
      body: `${session.username} 确认了心愿: ${wish.title}`,
      linkType: "wish",
      linkId: wishId,
    });

    const updated = getWishById(wishId)!;
    return Response.json({ wish: updated });
  }

  // Edit fields — only in pending status
  if (!isCreator) {
    return Response.json({ error: "Only the creator can edit" }, { status: 403 });
  }
  if (wish.status !== "pending") {
    return Response.json({ error: "当前状态不可编辑" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: now };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (points !== undefined) updates.points = Number(points);
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;

  db.update(wishes).set(updates).where(eq(wishes.id, wishId)).run();

  // Notify fulfiller about edit
  createNotification({
    userId: wish.fulfillerId,
    type: "wish_edited",
    title: "心愿已更新",
    body: `${session.username} 编辑了心愿: ${title || wish.title}`,
    linkType: "wish",
    linkId: wishId,
  });

  const updated = getWishById(wishId)!;
  return Response.json({ wish: updated });
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
  const wishId = parseInt(id, 10);
  if (isNaN(wishId)) {
    return Response.json({ error: "Invalid wish id" }, { status: 400 });
  }

  const wish = getWishById(wishId);
  if (!wish) {
    return Response.json({ error: "Wish not found" }, { status: 404 });
  }

  if (wish.creatorId !== session.userId) {
    return Response.json({ error: "Only the creator can delete" }, { status: 403 });
  }
  if (wish.status !== "pending") {
    return Response.json({ error: "当前状态不可删除" }, { status: 400 });
  }

  createNotification({
    userId: wish.fulfillerId,
    type: "wish_deleted",
    title: "心愿已删除",
    body: `${session.username} 删除了心愿: ${wish.title}`,
    linkType: "wish",
    linkId: wishId,
  });

  db.delete(wishes).where(eq(wishes.id, wishId)).run();

  return Response.json({ success: true });
}
