import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { username } = await request.json();
  db.update(users).set({ isAdmin: 1 }).where(eq(users.username, username)).run();
  return Response.json({ ok: true });
}
