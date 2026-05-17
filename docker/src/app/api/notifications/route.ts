import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getUnreadCount, getNotificationsForUser } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  if (searchParams.get("unread") === "true") {
    const count = getUnreadCount(session.userId);
    return Response.json({ count });
  }

  const list = getNotificationsForUser(session.userId);
  return Response.json({ notifications: list });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  if (body.id !== undefined && body.id !== null) {
    // Mark single notification as read
    db.update(notifications)
      .set({ isRead: 1 })
      .where(
        and(
          eq(notifications.id, body.id),
          eq(notifications.userId, session.userId)
        )
      )
      .run();
  } else {
    // Mark all as read
    db.update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.userId, session.userId))
      .run();
  }

  return Response.json({ success: true });
}
