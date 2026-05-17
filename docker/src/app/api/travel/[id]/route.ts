import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { destinations, expenses } from "@/db/schema";
import { getDestinationById } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const destId = parseInt(id, 10);
  if (isNaN(destId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = getDestinationById(destId);
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(item);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const destId = parseInt(id, 10);
  if (isNaN(destId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = getDestinationById(destId);
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, coverImage, tagline, city, lat, lng, placesToVisit, itineraryDraft, budgetEstimate, notes, action } = body;

  // Mark as visited
  if (action === "visit") {
    if (item.status === "visited") {
      return Response.json({ error: "已经标记为去过" }, { status: 400 });
    }
    const now = new Date().toISOString();
    db.update(destinations)
      .set({ status: "visited", visitedAt: now, updatedAt: now })
      .where(eq(destinations.id, destId))
      .run();
    const updated = getDestinationById(destId);
    return Response.json({ destination: updated });
  }

  // Edit fields
  if (name !== undefined && !name.trim()) {
    return Response.json({ error: "目的地名不能为空" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (coverImage !== undefined) updates.coverImage = coverImage || null;
  if (tagline !== undefined) updates.tagline = tagline || null;
  if (city !== undefined) updates.city = city || null;
  if (lat !== undefined) updates.lat = lat || null;
  if (lng !== undefined) updates.lng = lng || null;
  if (placesToVisit !== undefined) updates.placesToVisit = placesToVisit || null;
  if (itineraryDraft !== undefined) updates.itineraryDraft = itineraryDraft || null;
  if (budgetEstimate !== undefined) updates.budgetEstimate = budgetEstimate || null;
  if (notes !== undefined) updates.notes = notes || null;

  db.update(destinations).set(updates).where(eq(destinations.id, destId)).run();

  const updated = getDestinationById(destId);
  return Response.json({ destination: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const destId = parseInt(id, 10);
  if (isNaN(destId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = getDestinationById(destId);
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Delete expenses first
  db.delete(expenses).where(eq(expenses.destinationId, destId)).run();
  db.delete(destinations).where(eq(destinations.id, destId)).run();

  return Response.json({ success: true });
}
