import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tasks, users } from "@/db/schema";

export async function GET() {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const allTasks = db.select().from(tasks).all();
  const userMap = new Map<number, string>();
  allTasks.forEach(t => { userMap.set(t.creatorId, ""); userMap.set(t.assigneeId, ""); });
  db.select({ id: users.id, username: users.username }).from(users).all().forEach(u => userMap.set(u.id, u.username));
  return Response.json(allTasks.map(t => ({ ...t, creatorName: userMap.get(t.creatorId) || "未知", assigneeName: userMap.get(t.assigneeId) || "未知" })));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, points, status, creatorId, assigneeId } = await request.json();
  if (!title || !points) return Response.json({ error: "title and points required" }, { status: 400 });

  const now = new Date().toISOString();
  const result = db.insert(tasks).values({
    title, description: description || null, points: Number(points),
    status: status || "pending", creatorId: Number(creatorId) || 0, assigneeId: Number(assigneeId) || 0,
    createdAt: now, updatedAt: now,
  }).returning().get();
  return Response.json(result);
}
