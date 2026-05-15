import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { title, description, points, status, creatorId, assigneeId } = await request.json();
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (points !== undefined) updates.points = Number(points);
  if (status !== undefined) updates.status = status;
  if (creatorId !== undefined) updates.creatorId = Number(creatorId);
  if (assigneeId !== undefined) updates.assigneeId = Number(assigneeId);
  db.update(tasks).set(updates).where(eq(tasks.id, Number(id))).run();
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId || !session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  db.delete(tasks).where(eq(tasks.id, Number(id))).run();
  return Response.json({ ok: true });
}
