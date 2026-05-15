import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validate required fields
    if (!username || !password) {
      return Response.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user by username
    const user = db
      .select({
        id: users.id,
        username: users.username,
        passwordHash: users.passwordHash,
        pairedUserId: users.pairedUserId,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Set session
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    session.pairedUserId = user.pairedUserId;
    session.isAdmin = user.isAdmin;
    await session.save();

    return Response.json({
      userId: user.id,
      pairedUserId: user.pairedUserId,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
