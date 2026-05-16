import { db } from "@/db";
import {
  tasks,
  wishes,
  notifications,
  userSettings,
  users,
  pointTransactions,
  recipes,
  cookHistory,
  anniversaries,
  destinations,
  expenses,
  wanders,
  dines,
  todos,
} from "@/db/schema";
import { eq, and, or, desc, sql, count, like, gte } from "drizzle-orm";
import { Lunar } from "lunar-javascript";

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

// ─── Travel ────────────────────────────────────────────────────────────

export function getDestinations() {
  return db.select().from(destinations).orderBy(desc(destinations.updatedAt)).all();
}

export function getDestinationById(id: number) {
  return db.select().from(destinations).where(eq(destinations.id, id)).get();
}

// ─── Wanders ──────────────────────────────────────────────────────────

export function getWanders() {
  return db.select().from(wanders).orderBy(desc(wanders.date)).all();
}

export function getWanderById(id: number) {
  return db.select().from(wanders).where(eq(wanders.id, id)).get();
}

export function getWanderStats(): { location: string; count: number }[] {
  return db
    .select({ location: wanders.location, cnt: count() })
    .from(wanders)
    .groupBy(wanders.location)
    .orderBy(desc(count()))
    .all()
    .map((r) => ({ location: r.location, count: r.cnt }));
}

export function getExpensesForDestination(destinationId: number) {
  return db
    .select()
    .from(expenses)
    .where(eq(expenses.destinationId, destinationId))
    .orderBy(desc(expenses.createdAt))
    .all();
}

export function getAllExpenses() {
  return db
    .select({
      id: expenses.id,
      destinationId: expenses.destinationId,
      category: expenses.category,
      amount: expenses.amount,
      payer: expenses.payer,
      note: expenses.note,
      createdAt: expenses.createdAt,
      destinationName: destinations.name,
    })
    .from(expenses)
    .leftJoin(destinations, eq(expenses.destinationId, destinations.id))
    .orderBy(desc(expenses.createdAt))
    .all();
}

export function getExpenseSummary() {
  const all = getAllExpenses();
  const total = all.reduce((s, e) => s + e.amount, 0);
  const myTotal = all.filter((e) => e.payer === "me").reduce((s, e) => s + e.amount, 0);
  const partnerTotal = all.filter((e) => e.payer === "partner").reduce((s, e) => s + e.amount, 0);
  const diff = Math.abs(myTotal - partnerTotal);
  const whoOwes = myTotal > partnerTotal ? "Ta" : "我";
  return {
    total,
    myTotal,
    partnerTotal,
    diff,
    whoOwes: diff === 0 ? null : `${whoOwes}多付了 ¥${diff}`,
  };
}

// ─── Todos ────────────────────────────────────────────────────────────

export function getTodos(area: string, userId: number, archived: number, _pairedUserId: number | null) {
  let q = db.select().from(todos).$dynamic();
  if (area === "together") {
    q = q.where(and(eq(todos.area, "together"), eq(todos.archived, archived)));
  } else {
    q = q.where(and(eq(todos.area, "personal"), eq(todos.userId, userId), eq(todos.archived, archived)));
  }
  return q.orderBy(todos.sortOrder).all();
}

export function addTodo(data: { content: string; area: string; userId?: number | null }) {
  const maxOrder = db.select({ m: sql<number>`COALESCE(MAX(sort_order), -1)` }).from(todos).where(and(eq(todos.area, data.area), eq(todos.archived, 0))).get();
  return db.insert(todos).values({
    content: data.content, area: data.area,
    userId: data.area === "personal" ? data.userId : null,
    sortOrder: (maxOrder?.m ?? -1) + 1,
    createdAt: new Date().toISOString(),
  }).returning().get();
}

export function toggleTodo(id: number) {
  const item = db.select().from(todos).where(eq(todos.id, id)).get();
  if (!item) return null;
  db.update(todos).set({ done: item.done ? 0 : 1 }).where(eq(todos.id, id)).run();
  return db.select().from(todos).where(eq(todos.id, id)).get();
}

export function updateTodoContent(id: number, content: string) {
  db.update(todos).set({ content }).where(eq(todos.id, id)).run();
}

export function archiveDone(area: string, userId: number, _pairedUserId: number | null) {
  let q = db.update(todos).set({ archived: 1 }).$dynamic();
  if (area === "together") {
    q = q.where(and(eq(todos.area, "together"), eq(todos.done, 1), eq(todos.archived, 0)));
  } else {
    q = q.where(and(eq(todos.area, "personal"), eq(todos.userId, userId), eq(todos.done, 1), eq(todos.archived, 0)));
  }
  q.run();
}

export function restoreTodo(id: number) {
  db.update(todos).set({ archived: 0 }).where(eq(todos.id, id)).run();
}

export function deleteTodo(id: number) {
  db.delete(todos).where(eq(todos.id, id)).run();
}

export function reorderTodos(ids: number[]) {
  ids.forEach((id, i) => {
    db.update(todos).set({ sortOrder: i }).where(eq(todos.id, id)).run();
  });
}

// ─── Dines ────────────────────────────────────────────────────────────

export function getDines() {
  return db.select().from(dines).orderBy(desc(dines.date)).all();
}

export function getDineById(id: number) {
  return db.select().from(dines).where(eq(dines.id, id)).get();
}

export function getDineStats() {
  const all = getDines();
  const total = all.reduce((s, d) => s + (d.cost ?? 0), 0);
  const withCost = all.filter((d) => d.cost != null);
  const avgCost = withCost.length > 0 ? Math.round(withCost.reduce((s, d) => s + d.cost!, 0) / withCost.length) : 0;
  const freq: Record<string, number> = {};
  for (const d of all) {
    freq[d.restaurant] = (freq[d.restaurant] ?? 0) + 1;
  }
  const topRestaurants = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  return { total, avgCost, topRestaurants, count: all.length };
}

// ─── Points Transactions ──────────────────────────────────────────────

// ─── Recipes ──────────────────────────────────────────────────────────

export function getRecipes(search?: string | null, sort?: string | null) {
  let q = db.select().from(recipes).$dynamic();
  if (search) {
    q = q.where(like(recipes.title, `%${search}%`));
  }
  switch (sort) {
    case "cookCount":
      q = q.orderBy(desc(recipes.cookCount));
      break;
    case "lastCooked":
      q = q.orderBy(desc(recipes.lastCookedAt));
      break;
    default:
      q = q.orderBy(desc(recipes.createdAt));
  }
  return q.all();
}

export function getRecipeById(recipeId: number) {
  return db.select().from(recipes).where(eq(recipes.id, recipeId)).get();
}

export function getCookHistoryForRecipe(recipeId: number) {
  return db
    .select({
      id: cookHistory.id,
      recipeId: cookHistory.recipeId,
      userId: cookHistory.userId,
      rating: cookHistory.rating,
      createdAt: cookHistory.createdAt,
      username: users.username,
    })
    .from(cookHistory)
    .leftJoin(users, eq(cookHistory.userId, users.id))
    .where(eq(cookHistory.recipeId, recipeId))
    .orderBy(desc(cookHistory.createdAt))
    .all();
}

export function addCookRecord(data: {
  recipeId: number;
  userId: number;
  rating?: number | null;
}) {
  // Insert cook history
  db.insert(cookHistory).values({
    recipeId: data.recipeId,
    userId: data.userId,
    rating: data.rating ?? null,
    createdAt: new Date().toISOString(),
  }).run();

  // Update recipe's cookCount, avgRating, lastCookedAt
  const recipe = getRecipeById(data.recipeId);
  if (!recipe) return;

  const histories = db
    .select()
    .from(cookHistory)
    .where(eq(cookHistory.recipeId, data.recipeId))
    .all();

  const newCount = histories.length;
  const ratings = histories.filter((h) => h.rating != null).map((h) => h.rating!);
  const newAvg = ratings.length > 0
    ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
    : null;

  const latest = histories[0];

  db.update(recipes)
    .set({
      cookCount: newCount,
      avgRating: newAvg,
      lastCookedAt: latest?.createdAt ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(recipes.id, data.recipeId))
    .run();
}

// ─── Anniversaries ─────────────────────────────────────────────────────

function toSolarDate(anniversary: { date: string; isLunar: number }): Date {
  const [y, m, d] = anniversary.date.split("-").map(Number);
  if (anniversary.isLunar) {
    try {
      const solar = Lunar.fromYmd(y, m, d).getSolar();
      return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
    } catch {
      return new Date(y, m - 1, d);
    }
  }
  return new Date(y, m - 1, d);
}

export function getAnniversaries() {
  // Order by upcoming solar occurrence (cannot sort in SQL due to lunar conversion)
  return db
    .select()
    .from(anniversaries)
    .orderBy(desc(anniversaries.createdAt))
    .all();
}

export function getAnniversaryById(id: number) {
  return db.select().from(anniversaries).where(eq(anniversaries.id, id)).get();
}

export function getTogetherAnniversary() {
  const row = db
    .select()
    .from(anniversaries)
    .where(eq(anniversaries.isTogether, 1))
    .get();
  return row ?? null;
}

export function getUpcomingAnniversary(): { name: string; date: string; daysUntil: number } | null {
  const all = db.select().from(anniversaries).all();
  if (all.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let closest: typeof all[0] | null = null;
  let closestDays = Infinity;

  for (const a of all) {
    const solarDate = toSolarDate(a);
    const thisYear = new Date(today.getFullYear(), solarDate.getMonth(), solarDate.getDate());
    if (thisYear < today) {
      thisYear.setFullYear(thisYear.getFullYear() + 1);
    }
    const diff = Math.floor((thisYear.getTime() - today.getTime()) / 86400000);
    if (diff < closestDays) {
      closestDays = diff;
      closest = a;
    }
  }

  if (!closest) return null;
  return { name: closest.name, date: closest.date, daysUntil: closestDays };
}

export function sendAnniversaryReminders() {
  const all = db.select().from(anniversaries).all();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = today.toISOString().split("T")[0];

  for (const a of all) {
    const solarDate = toSolarDate(a);
    const thisYear = new Date(today.getFullYear(), solarDate.getMonth(), solarDate.getDate());
    if (thisYear < today) {
      thisYear.setFullYear(thisYear.getFullYear() + 1);
    }
    const diff = Math.floor((thisYear.getTime() - today.getTime()) / 86400000);

    // Remind if 0-7 days away (including day-of)
    if (diff >= 0 && diff <= 7) {
      const alreadySent = db
        .select({ cnt: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.type, "anniversary_reminder"),
            eq(notifications.linkId, a.id),
            gte(notifications.createdAt, todayStr)
          )
        )
        .get();

      if (alreadySent && alreadySent.cnt > 0) continue;

      const label = diff === 0 ? "就是今天！" : `距离「${a.name}」还剩 ${diff} 天`;
      createNotification({
        userId: a.userId,
        type: "anniversary_reminder",
        title: "纪念日提醒",
        body: label,
        linkType: "anniversary",
        linkId: a.id,
      });
    }
  }
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
