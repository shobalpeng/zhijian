import { getSession } from "@/lib/auth";
import { getUpcomingAnniversary, sendAnniversaryReminders } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Trigger reminder check (idempotent — won't double-send)
  sendAnniversaryReminders();

  const upcoming = getUpcomingAnniversary();
  return Response.json({ anniversary: upcoming });
}
