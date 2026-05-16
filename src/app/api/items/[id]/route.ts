import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { items } from "@/db/schema";
import { getItemById } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(); if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const p = getItemById(parseInt((await params).id)); if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(p);
}
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(); if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const p = getItemById(parseInt((await params).id)); if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  const b = await req.json(); const { name, date, price, category, status, imageUrl, note } = b;
  if (name !== undefined && !name.trim()) return Response.json({ error: "物品名不能为空" }, { status: 400 });
  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "日期格式错误" }, { status: 400 });
  const u: Record<string, unknown> = {};
  if (name !== undefined) u.name = name.trim(); if (date !== undefined) u.date = date;
  if (price !== undefined) u.price = Number(price); if (category !== undefined) u.category = category || null;
  if (status !== undefined) {
    u.status = status;
    u.retiredDate = status === "retired" ? new Date().toISOString().split("T")[0] : null;
  }
  if (imageUrl !== undefined) u.imageUrl = imageUrl || null;
  if (note !== undefined) u.note = note || null;
  if (Object.keys(u).length > 0) db.update(items).set(u).where(eq(items.id, p.id)).run();
  return Response.json({ item: getItemById(p.id) });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(); if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  db.delete(items).where(eq(items.id, parseInt((await params).id))).run();
  return Response.json({ success: true });
}
