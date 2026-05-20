const Database = require("better-sqlite3");
const { execSync } = require("child_process");

// Check for missing columns by running drizzle-kit push (idempotent — safe to run always)
let needsPush = false;
try {
  const db = new Database("/app/data/zhijian.db", { readonly: true });
  const row = db.prepare("SELECT count(*) AS cnt FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get();
  if (row.cnt === 0) needsPush = true;
  else {
    // Check if people_count column exists in dines table
    const col = db.prepare("SELECT count(*) AS cnt FROM pragma_table_info('dines') WHERE name='people_count'").get();
    if (col.cnt === 0) needsPush = true;
  }
  db.close();
} catch {
  needsPush = true;
}

if (needsPush) {
  console.log("[init-db] Running drizzle-kit push...");
  execSync("npx drizzle-kit push --force", { stdio: "inherit", cwd: "/app" });
  console.log("[init-db] Database initialized.");
} else {
  console.log("[init-db] Database up to date, skipping.");
}
