const Database = require("better-sqlite3");
let db;
try {
  db = new Database("/app/data/zhijian.db", { readonly: true });
  const row = db.prepare(
    "SELECT count(*) AS cnt FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).get();
  if (row.cnt === 0) throw new Error("empty");
  console.log("[init-db] Tables exist, skipping.");
} catch {
  console.log("[init-db] No tables found, running drizzle-kit push...");
  const { execSync } = require("child_process");
  execSync("npx drizzle-kit push --force", { stdio: "inherit", cwd: "/app" });
  console.log("[init-db] Database initialized.");
} finally {
  if (db) db.close();
}
