import { getSession } from "@/lib/auth";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = join(process.cwd(), "data", "uploads");

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "misc";

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type] ?? ".bin";
  const filename = uuidv4() + ext;
  const dir = join(UPLOADS_DIR, type);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return Response.json({ url: "/api/uploads/" + type + "/" + filename });
}
