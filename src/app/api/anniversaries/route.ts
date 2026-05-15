import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { anniversaries } from "@/db/schema";
import { getAnniversaries, getTogetherAnniversary } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const list = getAnniversaries();
  const hasTogether = getTogetherAnniversary() !== null;
  return Response.json({ anniversaries: list, hasTogether });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { name, date, note, isTogether, isLunar } = body;

  if (!name || !name.trim() || !date) {
    return Response.json({ error: "名称和日期不能为空" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "日期格式错误" }, { status: 400 });
  }

  // Only one together anniversary allowed
  if (isTogether) {
    const existing = getTogetherAnniversary();
    if (existing) {
      return Response.json({ error: "已有一个在一起纪念日" }, { status: 400 });
    }
  }

  const now = new Date().toISOString();
  const result = db
    .insert(anniversaries)
    .values({
      userId: session.userId,
      name: name.trim(),
      date,
      note: note || null,
      isLunar: isLunar ? 1 : 0,
      isTogether: isTogether ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  return Response.json({ anniversary: result });
}
