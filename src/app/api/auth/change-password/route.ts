import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return Response.json({ error: "请填写当前密码和新密码" }, { status: 400 });
  }

  if (newPassword.length < 4) {
    return Response.json({ error: "新密码至少 4 个字符" }, { status: 400 });
  }

  // Get current user's password hash
  const user = db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!user) {
    return Response.json({ error: "用户不存在" }, { status: 404 });
  }

  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return Response.json({ error: "当前密码错误" }, { status: 403 });
  }

  // Hash and update
  const newHash = await bcrypt.hash(newPassword, 10);
  db.update(users).set({ passwordHash: newHash }).where(eq(users.id, session.userId)).run();

  return Response.json({ success: true });
}
