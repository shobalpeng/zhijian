import { getSession } from "@/lib/auth";
import { getTodos, addTodo, toggleTodo, updateTodoContent, archiveDone, restoreTodo, deleteTodo, reorderTodos } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") ?? "together";
  const archived = searchParams.get("archived") === "1" ? 1 : 0;
  const list = getTodos(area, session.userId, archived, session.pairedUserId);
  return Response.json({ todos: list });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const body = await request.json();
  const { content, area } = body;
  if (!content?.trim()) return Response.json({ error: "内容不能为空" }, { status: 400 });
  const todo = addTodo({ content: content.trim(), area: area ?? "together", userId: session.userId });
  return Response.json({ todo });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const body = await request.json();
  const { action, id, content, area, ids } = body;

  if (action === "toggle") {
    const todo = toggleTodo(id);
    return Response.json({ todo });
  }
  if (action === "edit") {
    if (!content?.trim()) return Response.json({ error: "内容不能为空" }, { status: 400 });
    updateTodoContent(id, content.trim());
    return Response.json({ success: true });
  }
  if (action === "archive") {
    archiveDone(area, session.userId, session.pairedUserId);
    return Response.json({ success: true });
  }
  if (action === "restore") {
    restoreTodo(id);
    return Response.json({ success: true });
  }
  if (action === "reorder") {
    reorderTodos(ids);
    return Response.json({ success: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") ?? "0");
  deleteTodo(id);
  return Response.json({ success: true });
}
