import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { recipes, users, cookHistory } from "@/db/schema";
import { getRecipeById, getCookHistoryForRecipe, addCookRecord } from "@/lib/db";
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
  const recipeId = parseInt(id, 10);
  if (isNaN(recipeId)) {
    return Response.json({ error: "Invalid recipe id" }, { status: 400 });
  }

  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    return Response.json({ error: "Recipe not found" }, { status: 404 });
  }

  const creator = db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, recipe.creatorId))
    .get();

  const history = getCookHistoryForRecipe(recipeId);

  return Response.json({
    recipe: {
      ...recipe,
      creatorName: creator?.username ?? "未知",
    },
    cookHistory: history,
  });
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
  const recipeId = parseInt(id, 10);
  if (isNaN(recipeId)) {
    return Response.json({ error: "Invalid recipe id" }, { status: 400 });
  }

  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    return Response.json({ error: "Recipe not found" }, { status: 404 });
  }

  const body = await request.json();
  const { action, title, imageUrl, ingredients, steps, rating } = body;
  const now = new Date().toISOString();

  // Cook action — record a cook event
  if (action === "cook") {
    addCookRecord({
      recipeId,
      userId: session.userId,
      rating: rating ?? null,
    });

    const updated = getRecipeById(recipeId);
    const history = getCookHistoryForRecipe(recipeId);
    return Response.json({ recipe: updated, cookHistory: history });
  }

  // Edit fields — both partners can edit
  const updates: Record<string, unknown> = { updatedAt: now };
  if (title !== undefined) {
    if (!title.trim()) {
      return Response.json({ error: "菜名不能为空" }, { status: 400 });
    }
    updates.title = title.trim();
  }
  if (ingredients !== undefined) updates.ingredients = ingredients;
  if (steps !== undefined) updates.steps = steps;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;

  db.update(recipes).set(updates).where(eq(recipes.id, recipeId)).run();

  const updated = getRecipeById(recipeId);
  return Response.json({ recipe: updated });
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
  const recipeId = parseInt(id, 10);
  if (isNaN(recipeId)) {
    return Response.json({ error: "Invalid recipe id" }, { status: 400 });
  }

  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    return Response.json({ error: "Recipe not found" }, { status: 404 });
  }

  // Delete cook history entries first, then the recipe
  db.delete(cookHistory).where(eq(cookHistory.recipeId, recipeId)).run();
  db.delete(recipes).where(eq(recipes.id, recipeId)).run();

  return Response.json({ success: true });
}
