import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { getDestinations } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const list = getDestinations(search);
  return Response.json({ destinations: list });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { name, coverImage, tagline, city, lat, lng, placesToVisit, itineraryDraft, budgetEstimate, notes } = body;

  if (!name || !name.trim()) {
    return Response.json({ error: "目的地名不能为空" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const result = db
    .insert(destinations)
    .values({
      name: name.trim(),
      coverImage: coverImage || null,
      tagline: tagline || null,
      status: "wishlist",
      city: city || null,
      lat: lat || null,
      lng: lng || null,
      placesToVisit: placesToVisit || null,
      itineraryDraft: itineraryDraft || null,
      budgetEstimate: budgetEstimate || null,
      notes: notes || null,
      creatorId: session.userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  return Response.json({ destination: result });
}
