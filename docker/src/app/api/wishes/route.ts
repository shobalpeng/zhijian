import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { wishes } from "@/db/schema";
import { getWishesForUser, createNotification } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const myWishes = getWishesForUser(session.userId);

  const partnerWishes = session.pairedUserId
    ? getWishesForUser(session.pairedUserId)
    : [];

  return Response.json({ myWishes, partnerWishes });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, points, imageUrl } = body;

  if (!title || points === undefined || points === null) {
    return Response.json(
      { error: "Title and points are required" },
      { status: 400 }
    );
  }

  if (!session.pairedUserId) {
    return Response.json(
      { error: "No paired user to assign wish to" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const result = db
    .insert(wishes)
    .values({
      title,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      points: Number(points),
      creatorId: session.userId,
      fulfillerId: session.pairedUserId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  // Notify the fulfiller (partner)
  createNotification({
    userId: session.pairedUserId,
    type: "wish_created",
    title: "新心愿",
    body: `${session.username} 发布了心愿: ${title}`,
    linkType: "wish",
    linkId: result.id,
  });

  return Response.json({ wish: result });
}
