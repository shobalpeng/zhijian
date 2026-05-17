import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { db, sqlite } from "@/db";
import { users, userSettings } from "@/db/schema";
import { getSession } from "@/lib/auth";

/** Custom error for invite-code validation problems (400-level). */
class InviteCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InviteCodeError";
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, inviteCode } = await request.json();

    // Validate required fields
    if (!username || !password) {
      return Response.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Validate username length
    if (typeof username !== "string" || username.trim().length < 2) {
      return Response.json(
        { error: "Username must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate password length
    if (typeof password !== "string" || password.length < 4) {
      return Response.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    // Hash password (async, done outside the synchronous transaction)
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate invite code
    const generatedInviteCode = uuidv4().slice(0, 8);

    // Wrap all reads + writes in a single better-sqlite3 transaction.
    // This eliminates the TOCTOU race between the username check and insert,
    // and ensures user + settings + partner update are atomic.
    const result = sqlite.transaction(() => {
      // Handle pairing via invite code
      let pairedUserId: number | null = null;
      if (inviteCode && typeof inviteCode === "string") {
        const partner = db
          .select({
            id: users.id,
            pairedUserId: users.pairedUserId,
          })
          .from(users)
          .where(eq(users.inviteCode, inviteCode))
          .get();

        if (!partner) {
          throw new InviteCodeError("Invalid invite code");
        }

        if (partner.pairedUserId !== null) {
          throw new InviteCodeError(
            "This user is already paired with someone else"
          );
        }

        pairedUserId = partner.id;
      }

      // Insert user — UNIQUE constraints on username + invite_code
      // catch any concurrent registration at the DB level.
      const now = new Date().toISOString();
      const newUser = db
        .insert(users)
        .values({
          username: username.trim(),
          passwordHash,
          inviteCode: generatedInviteCode,
          pairedUserId,
          createdAt: now,
        })
        .returning()
        .get();

      // Create default userSettings row
      db.insert(userSettings)
        .values({
          userId: newUser.id,
          theme: "warm",
        })
        .run();

      // If paired, update partner's pairedUserId
      if (pairedUserId !== null) {
        db.update(users)
          .set({ pairedUserId: newUser.id })
          .where(eq(users.id, pairedUserId))
          .run();
      }

      return { newUser, pairedUserId };
    })();

    // Set session (outside transaction — session is cookie-based, not DB)
    const session = await getSession();
    session.userId = result.newUser.id;
    session.username = result.newUser.username;
    session.pairedUserId = result.pairedUserId;
    await session.save();

    return Response.json({
      userId: result.newUser.id,
      inviteCode: generatedInviteCode,
      pairedUserId: result.pairedUserId,
    });
  } catch (error) {
    // Catch invite-code validation errors (400)
    if (error instanceof InviteCodeError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    // Catch SQLite UNIQUE constraint violations → 409 Conflict
    if (error && typeof error === "object" && "code" in error) {
      const sqliteError = error as { code: string; message?: string };
      if (
        sqliteError.code === "SQLITE_CONSTRAINT_UNIQUE" ||
        sqliteError.code === "SQLITE_CONSTRAINT"
      ) {
        const msg = sqliteError.message || "";
        if (msg.includes("username")) {
          return Response.json(
            { error: "Username already taken" },
            { status: 409 }
          );
        }
        if (msg.includes("invite_code")) {
          return Response.json(
            { error: "Invite code conflict" },
            { status: 409 }
          );
        }
        return Response.json(
          { error: "A conflict occurred" },
          { status: 409 }
        );
      }
    }

    console.error("Register error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
