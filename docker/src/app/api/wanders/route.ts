import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { wanders } from "@/db/schema";
import { getWanders, getWanderStats } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const list = getWanders(search);
  const stats = getWanderStats();
  return Response.json({ wanders: list, stats });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { location, date, imageUrl, mood } = body;

  if (!location || !location.trim() || !date) {
    return Response.json({ error: "地点和日期不能为空" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "日期格式错误" }, { status: 400 });
  }

  const result = db
    .insert(wanders)
    .values({
      location: location.trim(),
      date,
      imageUrl: imageUrl || null,
      mood: mood || null,
      creatorId: session.userId,
      createdAt: new Date().toISOString(),
    })
    .returning()
    .get();

  return Response.json({ wander: result });
}
