import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();

  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Always fetch isAdmin from DB (not just session, for backward compat)
  let isAdmin = session.isAdmin ?? 0;
  if (!isAdmin) {
    const user = db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, session.userId)).get();
    isAdmin = user?.isAdmin ?? 0;
    if (isAdmin) { session.isAdmin = 1; await session.save(); }
  }

  return Response.json({
    userId: session.userId,
    username: session.username,
    pairedUserId: session.pairedUserId,
    isAdmin,
  });
}
