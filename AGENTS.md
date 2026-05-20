# 织间 — AI Agent 项目指南

> 读完这份文档，你应该可以在 5 分钟内上手这个项目的开发。

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router, Turbopack) |
| 语言 | TypeScript |
| ORM | Drizzle ORM |
| 数据库 | better-sqlite3 (本地 SQLite, 同步驱动) |
| 认证 | iron-session (加密 Cookie 会话) |
| UI | shadcn/ui + Tailwind CSS 4 |
| 图标 | lucide-react |

---

## 项目结构

```
zhijian/
├── data/                   # SQLite 数据库 + 上传图片 (zhijian.db)
├── db/
│   ├── schema.ts           # 所有 Drizzle 表定义
│   └── index.ts            # 数据库连接
├── src/
│   ├── app/                # Next.js App Router 页面
│   │   ├── page.tsx        # 首页
│   │   ├── layout.tsx      # 根布局 (ThemeProvider + AppShell)
│   │   ├── globals.css     # Tailwind + 主题 CSS 变量
│   │   ├── api/            # API 路由 (每个功能一个目录)
│   │   │   ├── tasks/      # 任务 API
│   │   │   ├── wishes/     # 心愿 API
│   │   │   ├── recipes/    # 菜谱 API
│   │   │   ├── travel/     # 旅游 API
│   │   │   ├── anniversaries/ # 纪念日 API
│   │   │   ├── wanders/    # 城市漫游 API
│   │   │   ├── dines/      # 聚餐 API
│   │   │   ├── items/      # 日均成本 API
│   │   │   ├── todos/      # 待办 API
│   │   │   ├── notifications/ # 通知 API (同时触发纪念日/生理期提醒)
│   │   │   ├── settings/   # 设置 API
│   │   │   └── auth/       # 认证 API (login/logout/register/me)
│   │   ├── tasks/          # 任务页面
│   │   ├── wishes/         # 心愿页面
│   │   ├── recipes/        # 菜谱页面
│   │   ├── travel/         # 旅游页面
│   │   ├── anniversaries/  # 纪念日页面
│   │   ├── wanders/        # 城市漫游页面
│   │   ├── dines/          # 聚餐页面
│   │   ├── items/          # 日均成本页面
│   │   ├── todos/          # 待办页面
│   │   ├── settings/       # 设置页面
│   │   ├── admin/          # 管理后台
│   │   ├── login/          # 登录
│   │   └── register/       # 注册
│   ├── components/         # 共享组件
│   │   ├── ui/             # shadcn/ui 组件 (button, input, textarea, select, switch 等)
│   │   ├── TopBar.tsx      # 顶部导航栏 (各页面统一使用)
│   │   ├── BottomNav.tsx   # 底部 Tab 导航 + 新建弹出
│   │   ├── AppShell.tsx     # 页面外壳 (max-w-lg + BottomNav)
│   │   ├── ThemeProvider.tsx # 双主题 (warm/dark)
│   │   ├── PullToRefresh.tsx # 下拉刷新 (支持触摸 + 鼠标)
│   │   ├── EmptyState.tsx   # 共享空状态组件 (icon + title + description)
│   │   ├── Skeleton.tsx     # 共享加载骨架屏 (count + className)
│   │   └── ... (各功能组件)
│   ├── lib/
│   │   ├── db.ts           # 所有数据库查询函数 (核心文件)
│   │   ├── auth.ts         # iron-session 配置 + getSession()
│   │   ├── utils.ts        # cn() 工具函数
│   │   └── api-fetch.ts    # API 包装 (错误处理 + toast 提示)
│   ├── data/
│   │   └── cities.ts       # 预设城市经纬度数据
│   └── types/              # 类型声明
├── DESIGN.md               # 产品设计文档 (需求/页面/数据模型)
└── README.md               # 快速开始
```

---

## 核心编码模式

### 1. API 路由模式

所有 API 路由都是 Next.js Route Handler：

```typescript
// src/app/api/xxx/route.ts  (集合路由)
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  // 查询逻辑...
  return Response.json({ data: list });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) { /* 401 */ }
  const body = await request.json();
  const { field1, field2 } = body;
  // 校验必填字段...
  // 插入数据库...
  return Response.json({ result });
}
```

### 2. 单条资源路由模式

```typescript
// src/app/api/xxx/[id]/route.ts  (单条路由)
// ⚠️ params 是 Promise，必须 await！
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← 必须 await
  const itemId = parseInt(id, 10);
  // ...
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // 常见做法：用 action 字段区分操作
  const body = await request.json();
  const { action, ...fields } = body;
  if (action === "some_action") { /* 特殊操作 */ }
  // 否则是字段编辑
  const updates: Record<string, unknown> = {};
  if (field1 !== undefined) updates.field1 = field1;
  // ...
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // 删除...
}
```

### 3. Drizzle 查询模式 (同步!)

```typescript
// 普通查询
db.select().from(table).where(eq(table.id, id)).get();   // 单条
db.select().from(table).where(...).all();                 // 多条
db.select().from(table).orderBy(desc(table.field)).all(); // 排序

// 带条件
db.select().from(table).where(and(eq(table.a, 1), eq(table.b, 2))).all();

// 聚合
db.select({ cnt: count() }).from(table).where(...).get();
db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(table).get();

// 插入 (⚠️ 必须 .run() 或 .returning().get())
db.insert(table).values({...}).run();                     // 执行但不返回
db.insert(table).values({...}).returning().get();         // 执行并返回插入行

// 更新
db.update(table).set({...}).where(eq(table.id, id)).run();

// 删除
db.delete(table).where(eq(table.id, id)).run();

// 动态查询 (条件可变)
let q = db.select().from(table).$dynamic();
if (search) q = q.where(like(table.field, `%${search}%`));
return q.orderBy(desc(table.field)).all();

// 联表
db.select({ a: tableA.field, b: tableB.field })
  .from(tableA)
  .leftJoin(tableB, eq(tableA.id, tableB.relatedId))
  .all();
```

### 4. DB Helper 函数模式

所有查询逻辑集中在 `src/lib/db.ts`，按功能分区：

```typescript
// ─── Feature Name ──────────────────────────────────────
export function getFeatureData(params) { ... }
export function getFeatureById(id: number) { ... }
```

### 5. 页面模式

所有页面都是 `"use client"` 组件：

```typescript
"use client";
import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { PullToRefresh } from "@/components/PullToRefresh";

export default function FeaturePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const load = useCallback(async () => {
    const res = await fetch("/api/feature");
    if (res.ok) setData((await res.json()).data);
    setLoading(false);
  }, []);
  
  useEffect(() => { load(); }, [load]);
  
  return (
    <>
      <TopBar title="功能名" showBell={false} />
      <PullToRefresh onRefresh={load}>
        <div className="px-4 py-4">
          {loading ? <Skeleton /> : <List />}
        </div>
      </PullToRefresh>
    </>
  );
}
```

---

## 命名约定 & 规则

### 数据库
- **JS 属性**: camelCase (`imageUrl`, `creatorId`, `createdAt`)
- **SQLite 列**: snake_case (`image_url`, `creator_id`, `created_at`)
- Drizzle 自动映射，不需要手动转换
- **时间戳**: 全部 ISO 字符串 (`new Date().toISOString()`)
- **布尔值**: integer 0/1 (SQLite 无真正布尔类型)

### 表单日期
- 日期格式: YYYY-MM-DD
- 前端用 `<input type="date">`，值格式自动为 YYYY-MM-DD
- API 校验: `/^\d{4}-\d{2}-\d{2}$/.test(date)`

### API 响应
- 成功: `Response.json({ feature: data })` 或 `Response.json({ success: true })`
- 错误: `Response.json({ error: "中文错误消息" }, { status: 400 })`
- 未认证: `{ status: 401 }`
- 无权限: `{ status: 403 }`
- 不存在: `{ status: 404 }`

### 认证
- 所有 API 必须 `const session = await getSession()`
- 用户信息: `session.userId`, `session.username`, `session.pairedUserId`, `session.isAdmin`
- 未配对: `session.pairedUserId` 为 null

---

## ⚠️ 常见坑

### 1. params 是 Promise (Next.js 15+)
```typescript
// ❌ 错误
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id; // 类型错误！
}

// ✅ 正确
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### 2. Drizzle INSERT 必须调用执行方法
```typescript
// ❌ 不会写入数据库 (没有 .run() 或 .get())
db.insert(table).values({...});

// ✅ 正确
db.insert(table).values({...}).run();                    // 执行
db.insert(table).values({...}).returning().get();        // 执行并返回
```

### 3. Drizzle SELECT 已自动执行
```typescript
// ✅ get()/all() 自动执行查询，不需要 .run()
db.select().from(table).where(...).get();
db.select().from(table).where(...).all();
```

### 4. TopBar 不支持 children
```typescript
// ❌ 错误
<TopBar title="标题">
  <button>...</button>
</TopBar>

// ✅ TopBar 只接受 title, showBell, showBack
<TopBar title="标题" showBell={false} />
```

### 5. CSS 变量在 SVG 中
```typescript
// ❌ SVG 属性不支持 var() 回退语法
<path fill="var(--muted, #f3f4f6)" />

// ✅ 用 style 属性，变量已在 ThemeProvider 中定义
<path style={{ fill: "hsl(var(--muted))" }} />
```
注意：CSS 变量 `--muted` 等存的是裸 HSL 值，需要 `hsl(var(--xxx))` 包裹。

### 6. Leaflet 需要 SSR 禁用
```typescript
// ❌ 直接 import 会导致服务端 500
import { TravelMap } from "@/components/TravelMap";

// ✅ 动态导入
const TravelMap = dynamic(
  () => import("@/components/TravelMap").then(m => ({ default: m.TravelMap })),
  { ssr: false }
);
```

### 7. useSearchParams 需要 Suspense
```typescript
// ❌ 直接使用会报错
export default function Page() {
  const params = useSearchParams();
  // ...
}

// ✅ 包在 Suspense 中
function Content() { const params = useSearchParams(); /* ... */ }
export default function Page() {
  return <Suspense><Content /></Suspense>;
}
```

### 8. 数据库迁移
- drizzle-kit push 在非 TTY 环境下可能报交互错误
- 新增表时可用 --force 或手动 SQL：`node -e "const D=require('better-sqlite3');const d=new D('data/zhijian.db');d.exec('CREATE TABLE IF NOT EXISTS ...');d.close()"`
- 新增列同理用 `ALTER TABLE`

### 9. 时区问题
- `new Date().toISOString()` 返回 UTC 时间
- 日期比较用 `todayStr = today.toISOString().split("T")[0]` 是 UTC 日期
- 中国时区 (UTC+8)：早8点前 UTC 日期比本地日期晚一天
- 需要本地日期时: `` `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}` ``

### 10. 页面导航
- 创建/编辑成功后用 `router.replace()` 而非 `router.push()`，避免中间页面留在浏览器历史中
- 缓存数据用 `useCallback` 包裹 fetch 函数，避免 useEffect 死循环

### 11. Docker 部署
- `iron-session` cookie 在 HTTP 环境下需设置 `secure: false`（生产环境 Docker 默认 `SESSION_SECURE` 为 `"true"` 才启用 secure）
- `next build` 会预渲染页面并访问数据库，多 worker 并发锁冲突 → `layout.tsx` 设置 `export const dynamic = "force-dynamic"` 跳过
- `db/index.ts` 模块初始化重试 `SQLITE_BUSY` 保护并发连接
- SESSION_SECRET 需要 ≥32 字符，在 `docker-compose.yml` 中显式设置

---

## 页面布局规范

所有页面使用统一的布局模式：
```
TopBar (标题 + 返回箭头 + 消息铃铛)
↓
内容区 (px-4 py-4)
↓  
底部导航 (AppShell 自动添加, pb-20 留白)
```

- 首页: `showBack={false}` (无返回箭头)
- 子页面: `showBack={true}` (默认，有返回箭头调用 `router.back()`)
- 创建/编辑页: `showBell={false}` (无消息铃铛)
- 搜索框: 列表页统一在筛选项上方，`px-4 pt-3` + `pl-9`（Seach 图标在左）。搜索模式见下文"搜索模式"。

---

## 搜索模式

5 个列表页（任务/心愿/旅游/漫游/聚餐）实现了搜索，以菜谱为模板。三层结构：

```
DB 层 (src/lib/db.ts)          →  API 层 (route.ts)          →  页面层 (page.tsx)
$dynamic() + like() + or()        searchParams.get("search")     Input + 300ms debounce + useCallback
```

### DB 层
```typescript
export function getXxx(search?: string | null) {
  let q = db.select().from(xxx).$dynamic();
  if (search) q = q.where(like(xxx.field, `%${search}%`));
  // 多字段搜索用 or():
  // if (search) q = q.where(or(like(xxx.a, `%${search}%`), like(xxx.b, `%${search}%`)));
  return q.orderBy(desc(xxx.createdAt)).all();
}
```

### API 层
```typescript
export async function GET(request: Request) {
  // ...
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const list = getXxx(search);
  return Response.json({ xxx: list });
}
```

### 页面层
```tsx
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t); }, [search]);

const load = useCallback(async () => {
  const p = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
  const res = await fetch(`/api/xxx${p}`);
  // ...
}, [debouncedSearch]);
```

UI：筛选区上方 `<Input className="pl-9" />` 嵌 `<Search>` 图标。空状态区分搜索失败 vs 无数据。

---

## 分页模式

所有列表页默认显示 10 条记录，点击底部"查看更多"展开更多。客户端分页，不涉及 API 改动。

### 实现

```tsx
const PAGE_SIZE = 10;
const [page, setPage] = useState(1);

const displayedItems = items.slice(0, page * PAGE_SIZE);
const hasMore = items.length > displayedItems.length;

// 筛选/排序/搜索变化时重置页码
useEffect(() => { setPage(1); }, [debouncedSearch, role, status]);
```

### 查看更多按钮

```tsx
{hasMore && (
  <div className="pt-4 pb-2 text-center">
    <button onClick={() => setPage(p => p + 1)}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      查看更多（{items.length - displayedItems.length}条）
    </button>
  </div>
)}
```

### 注意
- 列表和按钮需用 Fragment `<>...</>` 包裹（不能作为三元运算符的直接子节点）
- 带筛选器的页面（任务/心愿）还需修复 hydration：`role`/`status` 用 `useState` + `useEffect` 模式替代 `typeof window` 内联判断

---

## 功能模块一览

| 模块 | API 路由 | 页面路由 | 数据表 |
|------|---------|---------|--------|
| 任务 | /api/tasks | /tasks | tasks |
| 心愿 | /api/wishes | /wishes | wishes |
| 菜谱 | /api/recipes | /recipes | recipes, cook_history |
| 旅游 | /api/travel | /travel | destinations, expenses |
| 纪念日 | /api/anniversaries | /anniversaries | anniversaries |
| 城市漫游 | /api/wanders | /wanders | wanders |
| 聚餐 | /api/dines | /dines | dines |
| 日均成本 | /api/items | /items | items |
| 待办 | /api/todos | /todos | todos |
| 通知 | /api/notifications | /notifications | notifications |
| 设置 | /api/settings | /settings | user_settings |
| 认证 | /api/auth/* | /login, /register | users |

---

## 数据模型速查

详见 DESIGN.md。核心表：

- `users` — 用户系统 (配对/邀请码/管理员)
- `tasks` — 任务 (pending → submitted → confirmed, 积分奖励)
- `wishes` — 心愿 (同任务状态流, 积分扣除)
- `point_transactions` — 积分流水
- `notifications` — 消息通知
- `recipes` + `cook_history` — 菜谱 + 做菜记录
- `anniversaries` — 纪念日 (农历/isTogether)
- `destinations` + `expenses` — 旅游目的地 + 花费
- `wanders` — 城市漫游
- `dines` — 聚餐记录
- `items` — 日均成本物品
- `todos` — 待办 (area: together/personal)
- `user_settings` — 用户设置 (主题/积分上限)

---

## 首页导航卡片

首页使用 4 列正方形网格 (`grid-cols-4 gap-2 aspect-square`)：
任务 → 心愿 → 菜谱 → 纪念日 → 旅游 → 城市漫游 → 聚餐 → 待办 → 日均成本

新增功能时：加页面 + 加 API + 加 nav 卡片 + 加 BottomNav 入口。

---

## 当前状态 (v1.0)

### 已完成功能 (10 个模块)
- 任务/心愿：发布 → 提交 → 确认流程，积分系统，筛选 + 搜索
- 菜谱：菜谱库 + 做菜记录 + 评分 + 3 种排序 + 搜索
- 纪念日：农历支持 + 倒计时 + 在一起天数 + 7 天提醒
- 旅游：愿望清单 + Leaflet 足迹地图 + 花费记录 + 搜索
- 城市漫游：时间线卡片 + 地点统计 + 搜索
- 聚餐：时间线卡片 + 餐厅统计 + 搜索（餐厅名 + 参与人）
- 日均成本：购买日起日均计算 + 服役中/已退役筛选
- 待办：双区拖拽排序 + 划掉/归档
- 通知：任务/心愿状态 + 纪念日提醒
- 双主题（warm/dark）+ 渐变背景 + 微噪点纹理

### UI 特性
- 首页交错入场动画 + 积分数字跳动
- 5 种差异化卡片（左侧状态条/大图/心跳/分类色条）
- ZCOOL XiaoWei 标题字体
- 语义颜色 Token（success/warning/info）
- 共享 EmptyState / Skeleton / PullToRefresh / apiFetch

### 技术债务
- `db/index.ts` 模块初始化有 SQLITE_BUSY 重试，生产无问题
- 部分 API 路由未对参数做严格校验
- 无自动化测试

### 可探索方向
- 全站 i18n/英文支持
- 数据导出/导入
- 更多统计图表
- PWA 离线支持
- 第三方登录
