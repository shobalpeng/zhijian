import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

const DATA_DIR = process.cwd() + "/data";
mkdirSync(DATA_DIR, { recursive: true });

// Retry on SQLITE_BUSY — prevents race conditions when
// multiple Next.js build workers open the database simultaneously
let retries = 10;
let sqlite: Database.Database;
while (true) {
  try {
    sqlite = new Database(DATA_DIR + "/zhijian.db");
    break;
  } catch (e: any) {
    if (--retries > 0 && e?.code === "SQLITE_BUSY") {
      const wait = Date.now() + 100 + Math.random() * 300;
      while (Date.now() < wait) {}
      continue;
    }
    throw e;
  }
}

sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export { sqlite };
export const db = drizzle(sqlite, { schema });
