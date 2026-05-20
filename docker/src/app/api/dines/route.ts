import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { dines } from "@/db/schema";
import { getDines, getDineStats } from "@/lib/db";

function parseImageUrls(item: any) {
  if (!item?.imageUrl) return { ...item, imageUrls: null };
  try {
    const parsed = JSON.parse(item.imageUrl);
    return { ...item, imageUrls: Array.isArray(parsed) ? parsed : [item.imageUrl], imageUrl: undefined };
  } catch {
    return { ...item, imageUrls: [item.imageUrl], imageUrl: undefined };
  }
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const list = getDines(search).map(parseImageUrls);
  const stats = getDineStats();
  return Response.json({ dines: list, stats });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const body = await request.json();
  const { restaurant, date, people, peopleCount, dishes, cost, rating, comment, imageUrls } = body;
  if (!restaurant?.trim() || !date) return Response.json({ error: "餐厅和日期不能为空" }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "日期格式错误" }, { status: 400 });
  const result = db.insert(dines).values({
    restaurant: restaurant.trim(), date, people: people || null, peopleCount: peopleCount ?? null, dishes: dishes || null,
    cost: cost ?? null, rating: rating ?? null, comment: comment || null,
    imageUrl: imageUrls && imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
    creatorId: session.userId, createdAt: new Date().toISOString(),
  }).returning().get();
  return Response.json({ dine: parseImageUrls(result) });
}
