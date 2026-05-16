import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { getExpensesForDestination } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const destId = parseInt(id, 10);
  if (isNaN(destId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const list = getExpensesForDestination(destId);
  return Response.json({ expenses: list });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const destId = parseInt(id, 10);
  if (isNaN(destId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const { category, amount, payer, note } = body;

  if (!category || !amount || !payer) {
    return Response.json({ error: "分类、金额和支付方不能为空" }, { status: 400 });
  }

  const validCategories = ["transport", "accommodation", "dining", "tickets", "shopping", "other"];
  if (!validCategories.includes(category)) {
    return Response.json({ error: "无效的分类" }, { status: 400 });
  }

  if (!["me", "partner"].includes(payer)) {
    return Response.json({ error: "无效的支付方" }, { status: 400 });
  }

  const result = db
    .insert(expenses)
    .values({
      destinationId: destId,
      category,
      amount: Number(amount),
      payer,
      note: note || null,
      createdAt: new Date().toISOString(),
    })
    .returning()
    .get();

  return Response.json({ expense: result });
}
