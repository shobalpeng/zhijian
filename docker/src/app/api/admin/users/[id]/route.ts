import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { username, inviteCode, pairedUserId } = await request.json();
  const updates: Record<string, unknown> = {};
  if (username !== undefined) updates.username = username;
  if (inviteCode !== undefined) updates.inviteCode = inviteCode;
  if (pairedUserId !== undefined) updates.pairedUserId = pairedUserId || null;
  db.update(users).set(updates).where(eq(users.id, Number(id))).run();
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  db.delete(users).where(eq(users.id, Number(id))).run();
  return Response.json({ ok: true });
}
