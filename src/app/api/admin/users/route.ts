import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users, userSettings } from "@/db/schema";
import { v4 as uuid } from "uuid";

export async function GET() {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json(db.select().from(users).all());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { username, inviteCode, pairedUserId } = await request.json();
  if (!username) return Response.json({ error: "Username required" }, { status: 400 });

  const now = new Date().toISOString();
  const result = db.insert(users).values({
    username,
    passwordHash: "",
    inviteCode: inviteCode || uuid().slice(0, 8),
    pairedUserId: pairedUserId || null,
    isAdmin: 0,
    createdAt: now,
  }).returning().get();

  db.insert(userSettings).values({ userId: result.id }).run();

  return Response.json(result);
}
