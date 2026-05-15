import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

const DATA_DIR = process.cwd() + "/data";
mkdirSync(DATA_DIR, { recursive: true });
export const sqlite = new Database(DATA_DIR + "/zhijian.db");
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
