import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { userSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getMyPoints,
  getMonthlyEarned,
  getPendingCount,
  getUserSettings,
} from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  if (searchParams.get("points") === "true") {
    const myPoints = getMyPoints(session.userId);
    let partnerPoints = 0;
    if (session.pairedUserId) {
      partnerPoints = getMyPoints(session.pairedUserId);
    }
    return Response.json({ myPoints, partnerPoints });
  }

  if (searchParams.get("pending") === "true") {
    const count = getPendingCount(session.userId);
    return Response.json({ count });
  }

  // Full settings (for the settings page)
  const settings = getUserSettings(session.userId);
  const user = db
    .select({
      inviteCode: users.inviteCode,
      pairedUserId: users.pairedUserId,
      isAdmin: users.isAdmin,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  let pairedUsername: string | null = null;
  if (user?.pairedUserId) {
    const partner = db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, user.pairedUserId))
      .get();
    pairedUsername = partner?.username ?? null;
  }

  return Response.json({
    theme: settings?.theme ?? "warm",
    monthlyPointCap: settings?.monthlyPointCap ?? null,
    inviteCode: user?.inviteCode ?? null,
    pairedUserId: user?.pairedUserId ?? null,
    username: session.username,
    pairedUsername,
    isAdmin: user?.isAdmin ?? session.isAdmin ?? 0,
  });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const existing = getUserSettings(session.userId);

  const updates: Record<string, unknown> = {};

  if (body.theme !== undefined) {
    updates.theme = body.theme;
  }

  if (body.monthlyPointCap !== undefined) {
    updates.monthlyPointCap =
      body.monthlyPointCap === null ? null : Number(body.monthlyPointCap);
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  if (existing) {
    db.update(userSettings)
      .set({ ...existing, ...updates })
      .where(eq(userSettings.userId, session.userId))
      .run();
  } else {
    db.insert(userSettings)
      .values({
        userId: session.userId,
        theme: (updates.theme as string) ?? "warm",
        ...(updates.monthlyPointCap !== undefined
          ? { monthlyPointCap: updates.monthlyPointCap as number | null }
          : {}),
      })
      .run();
  }

  return Response.json({ success: true });
}
