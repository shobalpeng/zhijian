import { db } from "@/db";
import {
  tasks,
  wishes,
  notifications,
  userSettings,
  users,
  pointTransactions,
} from "@/db/schema";
import { eq, and, or, desc, sql, count } from "drizzle-orm";

// ─── Points ───────────────────────────────────────────────────────────

export function getMyPoints(userId: number): number {
  const result = db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, userId))
    .get();
  return result?.total ?? 0;
}

export function getMonthlyEarned(userId: number): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const result = db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(pointTransactions)
    .where(
      and(
        eq(pointTransactions.userId, userId),
        eq(pointTransactions.type, "earned"),
        sql`${pointTransactions.createdAt} >= ${startOfMonth}`
      )
    )
    .get();
  return result?.total ?? 0;
}

export function getPartnerPoints(pairedUserId: number): number {
  return getMyPoints(pairedUserId);
}

// ─── User Settings ────────────────────────────────────────────────────

export function getUserSettings(userId: number) {
  return db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .get();
}

// ─── Tasks ────────────────────────────────────────────────────────────

export function getTasksForUser(userId: number) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.assigneeId, userId))
    .orderBy(desc(tasks.updatedAt))
    .all();
}

export function getTasksCreatedByUser(userId: number) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.creatorId, userId))
    .orderBy(desc(tasks.updatedAt))
    .all();
}

export function getTaskById(taskId: number) {
  return db.select().from(tasks).where(eq(tasks.id, taskId)).get();
}

// ─── Wishes ───────────────────────────────────────────────────────────

export function getWishesForUser(userId: number) {
  return db
    .select()
    .from(wishes)
    .where(eq(wishes.creatorId, userId))
    .orderBy(desc(wishes.updatedAt))
    .all();
}

export function getWishById(wishId: number) {
  return db.select().from(wishes).where(eq(wishes.id, wishId)).get();
}

// ─── Notifications ────────────────────────────────────────────────────

export function getUnreadCount(userId: number): number {
  const result = db
    .select({ cnt: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)))
    .get();
  return result?.cnt ?? 0;
}

export function getNotificationsForUser(userId: number) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .all();
}

// ─── Pending Count ────────────────────────────────────────────────────

export function getPendingCount(userId: number): number {
  // Pending tasks: status=pending where I'm assignee OR status=submitted where I'm creator
  const pendingTaskCount = db
    .select({ cnt: count() })
    .from(tasks)
    .where(
      or(
        and(eq(tasks.assigneeId, userId), eq(tasks.status, "pending")),
        and(eq(tasks.creatorId, userId), eq(tasks.status, "submitted"))
      )
    )
    .get();

  // Pending wishes: status=pending where I'm fulfiller OR status=submitted where I'm creator
  const pendingWishCount = db
    .select({ cnt: count() })
    .from(wishes)
    .where(
      or(
        and(eq(wishes.fulfillerId, userId), eq(wishes.status, "pending")),
        and(eq(wishes.creatorId, userId), eq(wishes.status, "submitted"))
      )
    )
    .get();

  return (pendingTaskCount?.cnt ?? 0) + (pendingWishCount?.cnt ?? 0);
}

// ─── Notifications ────────────────────────────────────────────────────

export function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  body: string;
  linkType?: string;
  linkId?: number;
}) {
  return db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    body: data.body,
    linkType: data.linkType ?? null,
    linkId: data.linkId ?? null,
    isRead: 0,
    createdAt: new Date().toISOString(),
  }).run();
}

// ─── Points Transactions ──────────────────────────────────────────────

export function createPointTransaction(data: {
  userId: number;
  amount: number;
  type: string;
  sourceType: string;
  sourceId: number;
}) {
  return db.insert(pointTransactions).values({
    userId: data.userId,
    amount: data.amount,
    type: data.type,
    sourceType: data.sourceType,
    sourceId: data.sourceId,
    createdAt: new Date().toISOString(),
  }).run();
}
