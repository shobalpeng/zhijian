import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: number;
  username: string;
  pairedUserId: number | null;
  isAdmin: number;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  cookieName: "zhijian-session",
  cookieOptions: {
    secure: process.env.SESSION_SECURE === "true",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
