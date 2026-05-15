import { getSession } from "@/lib/auth";
import { db, sqlite } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { inviteCode } = body;

  if (!inviteCode || typeof inviteCode !== "string") {
    return Response.json({ error: "Invite code is required" }, { status: 400 });
  }

  // Check self isn't already paired
  const me = db
    .select({ pairedUserId: users.pairedUserId })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (me?.pairedUserId !== null) {
    return Response.json(
      { error: "You are already paired with someone" },
      { status: 400 }
    );
  }

  // Wrap in transaction to avoid races
  try {
    const result = sqlite.transaction(() => {
      const partner = db
        .select({
          id: users.id,
          pairedUserId: users.pairedUserId,
          username: users.username,
        })
        .from(users)
        .where(eq(users.inviteCode, inviteCode))
        .get();

      if (!partner) {
        throw new Error("无效的邀请码");
      }

      if (partner.id === session.userId) {
        throw new Error("不能与自己配对");
      }

      if (partner.pairedUserId !== null) {
        throw new Error("该用户已与他人配对");
      }

      // Re-check I'm still not paired (avoid TOCTOU)
      const meRecheck = db
        .select({ pairedUserId: users.pairedUserId })
        .from(users)
        .where(eq(users.id, session.userId))
        .get();

      if (meRecheck?.pairedUserId !== null) {
        throw new Error("你已配对");
      }

      // Update both users
      db.update(users)
        .set({ pairedUserId: partner.id })
        .where(eq(users.id, session.userId))
        .run();

      db.update(users)
        .set({ pairedUserId: session.userId })
        .where(eq(users.id, partner.id))
        .run();

      return partner;
    })();

    // Update session
    session.pairedUserId = result.id;
    await session.save();

    return Response.json({
      success: true,
      pairedUsername: result.username,
    });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
