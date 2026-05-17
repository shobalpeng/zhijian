import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { wishes, users } from "@/db/schema";

export async function GET() {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const allWishes = db.select().from(wishes).all();
  const userMap = new Map<number, string>();
  allWishes.forEach(w => { userMap.set(w.creatorId, ""); userMap.set(w.fulfillerId, ""); });
  db.select({ id: users.id, username: users.username }).from(users).all().forEach(u => userMap.set(u.id, u.username));
  return Response.json(allWishes.map(w => ({ ...w, creatorName: userMap.get(w.creatorId) || "未知", fulfillerName: userMap.get(w.fulfillerId) || "未知" })));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, points, status, creatorId, fulfillerId } = await request.json();
  if (!title || !points) return Response.json({ error: "title and points required" }, { status: 400 });

  const now = new Date().toISOString();
  const result = db.insert(wishes).values({
    title, description: description || null, points: Number(points),
    status: status || "pending", creatorId: Number(creatorId) || 0, fulfillerId: Number(fulfillerId) || 0,
    createdAt: now, updatedAt: now,
  }).returning().get();
  return Response.json(result);
}
