# Heart Points MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a couple/family interaction web app MVP with heart points, wish list, user pairing, notifications, and dual themes.

**Architecture:** Next.js App Router SPA with API Routes as backend, Drizzle ORM + better-sqlite3 for data, iron-session for cookie-based auth, shadcn/ui + Tailwind for UI. Mobile-first responsive design. Images stored in `data/uploads/`, served via API route.

**Tech Stack:** Next.js 16, React 19, TypeScript, Drizzle ORM, better-sqlite3, iron-session, shadcn/ui, Tailwind CSS 4, bcryptjs

---

## File Structure

```
zhijian/
├── data/
│   └── uploads/                   # User uploaded images
├── db/
│   ├── index.ts                   # DB connection singleton
│   └── schema.ts                  # All Drizzle table definitions
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout: ThemeProvider + html
│   │   ├── page.tsx               # Home dashboard
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx           # Task list
│   │   │   ├── create/page.tsx    # Create task
│   │   │   └── [id]/page.tsx      # Task detail
│   │   ├── wishes/
│   │   │   ├── page.tsx           # Wish list
│   │   │   ├── create/page.tsx    # Create wish
│   │   │   └── [id]/page.tsx      # Wish detail + negotiation
│   │   ├── notifications/page.tsx
│   │   ├── settings/page.tsx      # My page + settings
│   │   ├── pending/page.tsx       # Aggregated pending items
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── logout/route.ts
│   │       ├── auth/me/route.ts
│   │       ├── tasks/
│   │       │   ├── route.ts       # GET list + POST create
│   │       │   └── [id]/route.ts  # GET/PUT/DELETE single
│   │       ├── wishes/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── notifications/route.ts
│   │       ├── settings/route.ts
│   │       ├── upload/route.ts
│   │       └── uploads/[filename]/route.ts
│   ├── components/
│   │   ├── BottomNav.tsx
│   │   ├── TopBar.tsx
│   │   ├── PointsOverview.tsx
│   │   ├── PendingCard.tsx
│   │   ├── FeatureCards.tsx
│   │   ├── CreateSheet.tsx (via BottomNav Sheet)
│   │   ├── TaskCard.tsx
│   │   ├── WishCard.tsx
│   │   ├── NotificationItem.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ImageUpload.tsx
│   ├── lib/
│   │   ├── auth.ts               # Session helpers + iron-session config
│   │   ├── db.ts                  # Server-side DB query helpers
│   │   └── utils.ts              # cn() helper, date formatting
│   └── middleware.ts              # Route protection
├── public/
├── DESIGN.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
└── .env.local
```

---

### Task 1: Project Scaffolding

**Create:** `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `components.json`, `.env.local`

1. `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm`
2. `npm install drizzle-orm better-sqlite3 iron-session bcryptjs uuid`
3. `npm install -D drizzle-kit @types/better-sqlite3 @types/bcryptjs @types/uuid`
4. `npx shadcn@latest init -d --force`
5. `npx shadcn@latest add button input card dialog sheet badge tabs toggle switch textarea label avatar sonner scroll-area --yes`
6. Create `.env.local` with `SESSION_SECRET=...`
7. `mkdir -p data/uploads`

**Status:** ✅ DONE

---

### Task 2: Database Schema & Connection

**Create:** `db/schema.ts`, `db/index.ts`, `drizzle.config.ts`

7 tables: users, tasks, wishes, wishNegotiations, notifications, userSettings, pointTransactions

- Schema with all columns, foreign keys, default functions
- better-sqlite3 connection with WAL mode
- `npx drizzle-kit push` to create tables

**Status:** ✅ DONE — needs FK fix (add .references()), date $defaultFn, and mkdirSync in db/index.ts

---

### Task 3: Auth System

**Create:** `src/lib/auth.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/me/route.ts`, `src/middleware.ts`

- iron-session config with sealed cookie
- Register: username + password hash + invite code generation + pairing logic
- Login: verify credentials, set session
- Logout: destroy session
- /me: return current user info
- Middleware: protect all routes except /login, /register, /api/auth/*

---

### Task 4: Layout Shell

**Create:** `src/components/ThemeProvider.tsx`, `src/components/BottomNav.tsx`, `src/components/TopBar.tsx`
**Modify:** `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`

- ThemeProvider with warm/minimal themes via CSS data-theme attribute
- BottomNav: 3 tabs (Home · + · My), plus Sheet for create popup
- TopBar: sticky header with title + bell icon with unread badge
- Root layout: ThemeProvider + max-w-lg centered + pb-20 for mobile nav

---

### Task 5: Home Page Dashboard

**Create:** `src/components/PointsOverview.tsx`, `src/components/PendingCard.tsx`, `src/components/FeatureCards.tsx`
**Modify:** `src/app/page.tsx`

- PointsOverview: fetch /api/settings?points=true, show both users' points + optional progress bar
- PendingCard: fetch /api/settings?pending=true, show count badge
- FeatureCards: grayed-out placeholder cards for future features

---

### Task 6: DB Query Helpers

**Create:** `src/lib/db.ts`

- getMyPoints, getMonthlyEarned, getUserSettings
- getTasksForUser, getTasksCreatedByUser
- getWishesForUser
- getNotificationsForUser, getUnreadCount
- getPendingCount (pending tasks + frozen wishes)
- createNotification helper

---

### Task 7: Tasks API + Create & List Pages

**Create:** `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`, `src/app/api/upload/route.ts`, `src/app/api/uploads/[filename]/route.ts`, `src/app/tasks/page.tsx`, `src/app/tasks/create/page.tsx`, `src/components/TaskCard.tsx`, `src/components/ImageUpload.tsx`

- Tasks API: GET list (filter by assigned/created), POST create (notifies partner)
- Tasks [id] API: GET detail, PUT (submit/confirm + edit), DELETE (with confirm for submitted status)
- Image upload API: save to data/uploads/, serve via API
- Task list page: tabs for "assigned to me" / "I created"
- Create task page: title (required) + description (optional, with image upload icon) + points

---

### Task 8: Task Detail Page

**Create:** `src/app/tasks/[id]/page.tsx`, `src/components/ConfirmDialog.tsx`

- Show task details with status badge
- Submit button (assignee, pending status)
- Confirm button (creator, submitted status)
- Edit/Delete buttons (creator, not confirmed — need partner confirm for submitted)
- ConfirmDialog for confirmation actions

---

### Task 9: Wishes API + Create & List Pages

**Create:** `src/app/api/wishes/route.ts`, `src/app/api/wishes/[id]/route.ts`, `src/app/wishes/page.tsx`, `src/app/wishes/create/page.tsx`, `src/components/WishCard.tsx`

- Wishes API: GET (my + partner wishes), POST create
- Wishes [id] API: GET (wish + negotiations), PUT (exchange/implement/negotiate), DELETE
- Wish list page: tabs "my wishes" / "Ta's wishes"
- Create wish page: same structure as create task

---

### Task 10: Wish Detail & Negotiation

**Create:** `src/app/wishes/[id]/page.tsx`, `src/components/NegotiationPanel.tsx`

- Show wish details + negotiation history
- Exchange: confirm dialog → freeze points
- Negotiation: offer/counter/accept/reject/cancel buttons
- Implement: fulfiller marks as done
- Confirm implement: creator confirms, points deducted

---

### Task 11: Notifications

**Create:** `src/app/api/notifications/route.ts`, `src/app/notifications/page.tsx`, `src/components/NotificationItem.tsx`

- GET list, GET unread count, PUT mark read (single or all)
- Notification list page with read/unread styling
- Click to navigate to linked task/wish

---

### Task 12: Settings Page

**Create:** `src/app/api/settings/route.ts`, `src/app/settings/page.tsx`, `src/app/settings/pairing/page.tsx`

- Settings API: GET (theme, cap, invite code, paired status), PUT (theme, monthlyPointCap)
- Settings page: username, pairing status, point cap editor, theme toggle, logout

---

### Task 13: Pending Items Page

**Create:** `src/app/pending/page.tsx`

- Aggregated list: pending tasks I need to complete + submitted tasks I need to confirm + frozen wishes
- Grouped by category, each item links to detail page

---

### Task 14: Login & Register Pages

**Create:** `src/app/login/page.tsx`, `src/app/register/page.tsx`

- Login: username + password → POST /api/auth/login → redirect /
- Register: username + password + optional invite code → POST /api/auth/register → redirect /

---

### Task 15: Polish & Build Verification

- Full flow testing with two browser windows
- Edge case fixes
- `npm run build` must pass
- Mobile viewport check

---

## Key Business Rules (from DESIGN.md)

1. Both users are symmetric — either can create tasks, complete tasks, create wishes, fulfill wishes
2. Points only have "generate" (task confirmed) and "consume" (wish implemented) exits
3. Tasks/wishes in "pending/unclaimed" status: creator can edit/delete freely
4. Tasks/wishes in "submitted/frozen" status: editing/deleting requires partner confirmation
5. Tasks/wishes in "confirmed/implemented" status: locked, no edit/delete
6. Wish cancellation (when frozen) requires both users' consent
7. Monthly point cap is optional (null = unlimited), exceeding shows warning but doesn't block
