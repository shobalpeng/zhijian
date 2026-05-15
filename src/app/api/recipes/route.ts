import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { getRecipes } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const sort = searchParams.get("sort");

  const list = getRecipes(search, sort);
  return Response.json({ recipes: list });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, imageUrl, ingredients, steps } = body;

  if (!title || !title.trim()) {
    return Response.json({ error: "菜名不能为空" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const result = db
    .insert(recipes)
    .values({
      title: title.trim(),
      imageUrl: imageUrl ?? null,
      ingredients: ingredients ?? null,
      steps: steps ?? null,
      cookCount: 0,
      creatorId: session.userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  return Response.json({ recipe: result });
}
