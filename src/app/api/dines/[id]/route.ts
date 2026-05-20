import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { dines } from "@/db/schema";
import { getDineById } from "@/lib/db";
import { eq } from "drizzle-orm";

function parseImageUrls(item: any) {
  if (!item?.imageUrl) return { ...item, imageUrls: null };
  try {
    const parsed = JSON.parse(item.imageUrl);
    return { ...item, imageUrls: Array.isArray(parsed) ? parsed : [item.imageUrl], imageUrl: undefined };
  } catch {
    return { ...item, imageUrls: [item.imageUrl], imageUrl: undefined };
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const item = getDineById(parseInt(id, 10));
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(parseImageUrls(item));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const item = getDineById(parseInt(id, 10));
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const { restaurant, date, people, peopleCount, dishes, cost, rating, comment, imageUrls } = body;
  if (restaurant !== undefined && !restaurant.trim()) return Response.json({ error: "餐厅不能为空" }, { status: 400 });
  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "日期格式错误" }, { status: 400 });
  const updates: Record<string, unknown> = {};
  if (restaurant !== undefined) updates.restaurant = restaurant.trim();
  if (date !== undefined) updates.date = date;
  if (people !== undefined) updates.people = people || null;
  if (peopleCount !== undefined) updates.peopleCount = peopleCount ?? null;
  if (dishes !== undefined) updates.dishes = dishes || null;
  if (cost !== undefined) updates.cost = cost ?? null;
  if (rating !== undefined) updates.rating = rating ?? null;
  if (comment !== undefined) updates.comment = comment || null;
  if (imageUrls !== undefined) updates.imageUrl = imageUrls && imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
  if (Object.keys(updates).length > 0) db.update(dines).set(updates).where(eq(dines.id, item.id)).run();
  return Response.json({ dine: parseImageUrls(getDineById(item.id)) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  db.delete(dines).where(eq(dines.id, parseInt(id, 10))).run();
  return Response.json({ success: true });
}
