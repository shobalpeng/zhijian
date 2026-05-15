import { sqliteTable, text, integer, type SQLiteColumn } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  pairedUserId: integer("paired_user_id").references((): SQLiteColumn => users.id),
  isAdmin: integer("is_admin").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  points: integer("points").notNull(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  assigneeId: integer("assignee_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending | submitted | confirmed
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  submittedAt: text("submitted_at"),
  confirmedAt: text("confirmed_at"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const wishes = sqliteTable("wishes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  points: integer("points").notNull(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  fulfillerId: integer("fulfiller_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending | submitted | confirmed
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  submittedAt: text("submitted_at"),
  confirmedAt: text("confirmed_at"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const wishNegotiations = sqliteTable("wish_negotiations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  wishId: integer("wish_id").notNull().references(() => wishes.id),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  price: integer("price").notNull(),
  action: text("action").notNull(), // offer | counter | accept | reject | cancel
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  linkType: text("link_type"), // task | wish
  linkId: integer("link_id"),
  isRead: integer("is_read").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const userSettings = sqliteTable("user_settings", {
  userId: integer("user_id").primaryKey().references(() => users.id),
  monthlyPointCap: integer("monthly_point_cap"), // null = unlimited
  theme: text("theme").notNull().default("warm"), // warm | minimal
});

export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  ingredients: text("ingredients"),
  steps: text("steps"),
  cookCount: integer("cook_count").notNull().default(0),
  avgRating: integer("avg_rating"),
  lastCookedAt: text("last_cooked_at"),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const cookHistory = sqliteTable("cook_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating"), // 1-5, nullable
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const anniversaries = sqliteTable("anniversaries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  note: text("note"),
  isLunar: integer("is_lunar").notNull().default(0),
  isTogether: integer("is_together").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const pointTransactions = sqliteTable("point_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // positive=earned, negative=spent
  type: text("type").notNull(), // earned | spent | frozen | unfrozen
  sourceType: text("source_type").notNull(), // task | wish
  sourceId: integer("source_id").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});
