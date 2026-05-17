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
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = join(UPLOADS_DIR, filename);

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = readFileSync(filePath);
  const ext = filename.substring(filename.lastIndexOf("."));
  const mimeType = EXT_TO_MIME[ext] ?? "application/octet-stream";

  return new Response(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
