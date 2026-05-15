import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { anniversaries } from "@/db/schema";
import { getAnniversaryById, getTogetherAnniversary } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const anniversaryId = parseInt(id, 10);
  if (isNaN(anniversaryId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = getAnniversaryById(anniversaryId);
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(item);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const anniversaryId = parseInt(id, 10);
  if (isNaN(anniversaryId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = getAnniversaryById(anniversaryId);
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, date, note, isTogether, isLunar } = body;

  if (name !== undefined && !name.trim()) {
    return Response.json({ error: "名称不能为空" }, { status: 400 });
  }
  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "日期格式错误" }, { status: 400 });
  }

  // If setting as together, check no other anniversary already has it
  if (isTogether) {
    const existing = getTogetherAnniversary();
    if (existing && existing.id !== anniversaryId) {
      return Response.json({ error: "已有一个在一起纪念日" }, { status: 400 });
    }
  }

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (date !== undefined) updates.date = date;
  if (note !== undefined) updates.note = note || null;
  if (isTogether !== undefined) updates.isTogether = isTogether ? 1 : 0;
  if (isLunar !== undefined) updates.isLunar = isLunar ? 1 : 0;

  db.update(anniversaries).set(updates).where(eq(anniversaries.id, anniversaryId)).run();

  const updated = getAnniversaryById(anniversaryId);
  return Response.json({ anniversary: updated });
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
  const anniversaryId = parseInt(id, 10);
  if (isNaN(anniversaryId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = getAnniversaryById(anniversaryId);
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  db.delete(anniversaries).where(eq(anniversaries.id, anniversaryId)).run();
  return Response.json({ success: true });
}
