import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const UPLOADS_DIR = join(process.cwd(), "data", "uploads");

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  // Prevent path traversal
  for (const seg of path) {
    if (seg.includes("..") || seg.includes("\\")) {
      return new Response("Not found", { status: 404 });
    }
  }

  const relativePath = path.join("/");
  const filePath = join(UPLOADS_DIR, relativePath);

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = readFileSync(filePath);
  const ext = path[path.length - 1].substring(path[path.length - 1].lastIndexOf("."));
  const mimeType = EXT_TO_MIME[ext] ?? "application/octet-stream";

  return new Response(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
