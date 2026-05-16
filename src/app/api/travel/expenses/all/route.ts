import { getSession } from "@/lib/auth";
import { getAllExpenses, getExpenseSummary } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const expenses = getAllExpenses();
  const summary = getExpenseSummary();
  return Response.json({ expenses, summary });
}
