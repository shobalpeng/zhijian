import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getTasksForUser, getTasksCreatedByUser, createNotification } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "assigned";

  if (type === "created") {
    const list = getTasksCreatedByUser(session.userId);
    return Response.json({ tasks: list });
  }

  const list = getTasksForUser(session.userId);
  return Response.json({ tasks: list });
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
      { error: "No paired user to assign task to" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const result = db
    .insert(tasks)
    .values({
      title,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      points: Number(points),
      creatorId: session.userId,
      assigneeId: session.pairedUserId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  // Notify the assignee
  createNotification({
    userId: session.pairedUserId,
    type: "task_assigned",
    title: "新任务",
    body: `${session.username} 给你发布了任务: ${title}`,
    linkType: "task",
    linkId: result.id,
  });

  return Response.json({ task: result });
}
