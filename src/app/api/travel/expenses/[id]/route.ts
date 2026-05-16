import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const expenseId = parseInt(id, 10);
  if (isNaN(expenseId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = db.select().from(expenses).where(eq(expenses.id, expenseId)).get();
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { category, amount, payer, note } = body;

  const updates: Record<string, unknown> = {};
  if (category !== undefined) updates.category = category;
  if (amount !== undefined) updates.amount = Number(amount);
  if (payer !== undefined) updates.payer = payer;
  if (note !== undefined) updates.note = note || null;

  if (Object.keys(updates).length > 0) {
    db.update(expenses).set(updates).where(eq(expenses.id, expenseId)).run();
  }

  const updated = db.select().from(expenses).where(eq(expenses.id, expenseId)).get();
  return Response.json({ expense: updated });
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
  const expenseId = parseInt(id, 10);
  if (isNaN(expenseId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  db.delete(expenses).where(eq(expenses.id, expenseId)).run();
  return Response.json({ success: true });
}
