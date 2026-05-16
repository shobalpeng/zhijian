import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { dines } from "@/db/schema";
import { getDineById } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const item = getDineById(parseInt(id, 10));
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const item = getDineById(parseInt(id, 10));
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const { restaurant, date, people, dishes, cost, rating, comment, imageUrl } = body;
  if (restaurant !== undefined && !restaurant.trim()) return Response.json({ error: "餐厅不能为空" }, { status: 400 });
  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "日期格式错误" }, { status: 400 });
  const updates: Record<string, unknown> = {};
  if (restaurant !== undefined) updates.restaurant = restaurant.trim();
  if (date !== undefined) updates.date = date;
  if (people !== undefined) updates.people = people || null;
  if (dishes !== undefined) updates.dishes = dishes || null;
  if (cost !== undefined) updates.cost = cost ?? null;
  if (rating !== undefined) updates.rating = rating ?? null;
  if (comment !== undefined) updates.comment = comment || null;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl || null;
  if (Object.keys(updates).length > 0) db.update(dines).set(updates).where(eq(dines.id, item.id)).run();
  return Response.json({ dine: getDineById(item.id) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  db.delete(dines).where(eq(dines.id, parseInt(id, 10))).run();
  return Response.json({ success: true });
}
