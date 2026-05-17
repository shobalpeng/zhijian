import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tasks, wishes } from "@/db/schema";
import { or, eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.userId || !session.pairedUserId) {
    return Response.json({ activities: [] });
  }

  const bothIds = [session.userId, session.pairedUserId];

  const confirmedTasks = db.select({
    id: tasks.id,
    title: tasks.title,
    points: tasks.points,
    type: sql`'task'`,
    creatorId: tasks.creatorId,
    assigneeId: tasks.assigneeId,
    time: tasks.confirmedAt,
  }).from(tasks)
    .where(
      or(
        eq(tasks.creatorId, session.userId),
        eq(tasks.creatorId, session.pairedUserId),
        eq(tasks.assigneeId, session.userId),
        eq(tasks.assigneeId, session.pairedUserId),
      )
    )
    .orderBy(desc(tasks.confirmedAt))
    .limit(3).all()
    .filter(t => t.time && t.creatorId && t.assigneeId && bothIds.includes(t.creatorId as number) && bothIds.includes(t.assigneeId as number));

  const confirmedWishes = db.select({
    id: wishes.id,
    title: wishes.title,
    points: wishes.points,
    type: sql`'wish'`,
    creatorId: wishes.creatorId,
    assigneeId: wishes.fulfillerId,
    time: wishes.confirmedAt,
  }).from(wishes)
    .where(
      or(
        eq(wishes.creatorId, session.userId),
        eq(wishes.creatorId, session.pairedUserId),
        eq(wishes.fulfillerId, session.userId),
        eq(wishes.fulfillerId, session.pairedUserId),
      )
    )
    .orderBy(desc(wishes.confirmedAt))
    .limit(3).all()
    .filter(w => w.time && w.creatorId && w.assigneeId && bothIds.includes(w.creatorId as number) && bothIds.includes(w.assigneeId as number));

  const activities = [...confirmedTasks, ...confirmedWishes]
    .sort((a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime())
    .slice(0, 3)
    .map(a => {
      const isCreator = a.creatorId === session.userId;
      const isTask = (a.type as string) === "task";
      return {
        id: a.id,
        type: a.type as string,
        title: a.title,
        points: a.points,
        time: a.time,
        isCreator,
        label: isTask
          ? (isCreator ? `你确认了Ta完成了你的任务「${a.title}」，` : `Ta确认了你完成了Ta的任务「${a.title}」，`)
          : (isCreator ? `你确认了Ta完成了你的心愿「${a.title}」，` : `Ta确认了你完成了Ta的心愿「${a.title}」，`),
        pointLabel: isTask
          ? (isCreator ? `Ta的积分+${a.points}` : `你的积分+${a.points}`)
          : (isCreator ? `你的积分−${a.points}` : `Ta的积分−${a.points}`),
      };
    });

  return Response.json({ activities });
}
