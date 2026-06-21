import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { wanders } from "@/db/schema";
import { getWanderById } from "@/lib/db";
import { eq } from "drizzle-orm";

function parseImageUrls(item: any) {
  if (!item?.imageUrl) return { ...item, imageUrls: null, imageUrl: undefined };
  try {
    const parsed = JSON.parse(item.imageUrl);
    return { ...item, imageUrls: Array.isArray(parsed) ? parsed : [item.imageUrl], imageUrl: undefined };
  } catch {
    return { ...item, imageUrls: [item.imageUrl], imageUrl: undefined };
  }
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
  const wanderId = parseInt(id, 10);
  if (isNaN(wanderId)) return Response.json({ error: "Invalid id" }, { status: 400 });

  const item = getWanderById(wanderId);
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(parseImageUrls(item));
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
  const wanderId = parseInt(id, 10);
  if (isNaN(wanderId)) return Response.json({ error: "Invalid id" }, { status: 400 });

  const item = getWanderById(wanderId);
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { location, date, imageUrls, mood } = body;

  if (location !== undefined && !location.trim()) {
    return Response.json({ error: "地点不能为空" }, { status: 400 });
  }
  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "日期格式错误" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (location !== undefined) updates.location = location.trim();
  if (date !== undefined) updates.date = date;
  if (imageUrls !== undefined) updates.imageUrl = imageUrls?.length ? JSON.stringify(imageUrls) : null;
  if (mood !== undefined) updates.mood = mood || null;

  if (Object.keys(updates).length > 0) {
    db.update(wanders).set(updates).where(eq(wanders.id, wanderId)).run();
  }

  return Response.json({ wander: parseImageUrls(getWanderById(wanderId)) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const wanderId = parseInt(id, 10);
  if (isNaN(wanderId)) return Response.json({ error: "Invalid id" }, { status: 400 });

  db.delete(wanders).where(eq(wanders.id, wanderId)).run();
  return Response.json({ success: true });
}
