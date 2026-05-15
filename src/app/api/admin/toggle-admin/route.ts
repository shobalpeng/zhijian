import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { userId } = await request.json();
  const user = db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, userId)).get();
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  db.update(users).set({ isAdmin: user.isAdmin ? 0 : 1 }).where(eq(users.id, userId)).run();
  return Response.json({ ok: true });
}
