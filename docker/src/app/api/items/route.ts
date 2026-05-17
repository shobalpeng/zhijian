import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { items } from "@/db/schema";
import { getItems } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  return Response.json({ items: getItems(status) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const body = await request.json();
  const { name, date, price, category, status, imageUrl, note } = body;
  if (!name?.trim() || !date || price == null) return Response.json({ error: "物品名、日期和价格不能为空" }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "日期格式错误" }, { status: 400 });
  const result = db.insert(items).values({
    name: name.trim(), date, price: Number(price), category: category || null, status: status || "active",
    imageUrl: imageUrl || null, note: note || null,
    creatorId: session.userId, createdAt: new Date().toISOString(),
  }).returning().get();
  return Response.json({ item: result });
}
