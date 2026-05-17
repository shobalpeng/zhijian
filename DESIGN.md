# 织间 — 设计文档

## 项目背景

"织间"——取"编织时间"与"我们之间"的双关。为情侣或家庭打造一个生活互动平台。MVP 以"心动积分 + 心愿清单"为核心循环，通过游戏化方式增进双方互动。后续可扩展纪念日、账本、菜谱等模块。

---

## 技术栈

| 层面 | 选型 | 理由 |
|------|------|------|
| 框架 | Next.js 16 (React) | App Router, 全栈一体 |
| ORM | Drizzle ORM | 类型安全，零运行时 |
| 数据库 | better-sqlite3 (本地 SQLite) | 本地部署，零运维，单文件 |
| 认证 | iron-session | 加密 Cookie 会话 |
| UI | shadcn/ui + Tailwind CSS 4 | 代码自有、按需取用、风格现代 |
| 部署 | 本地 `next start` | 个人使用，SQLite 文件 + 图片在 `data/` 目录 |

---

## 产品范围

### 当前功能
- 用户系统（邀请码配对，1v1）
- 心动积分（任务赚积分）
- 心愿清单（心愿花积分）
- 共享菜谱（菜谱库 + 做菜记录 + 评分）
- 纪念日（农历支持 + 倒计时 + 在一起天数 + 提前提醒）
- 旅游记录（愿望清单 + 足迹地图 + 花费记录，Leaflet 真实地图）
- 城市漫游（时间线卡片流 + 地点聚合统计，轻量级城市漫步记录）
- 聚餐记录（时间线卡片流 + 餐厅统计 + 星级评分）
- 待办（共享便利贴，划掉/归档/拖拽排序，无指派无截止日期）
- 日均成本（大件物品购买日起日均计算，服役中/已退役状态，退役后冻结计算）
- 消息中心（应用内通知，已读/未读追踪）
- 双主题（温馨 / 黑夜，CSS 变量一键切换）
- 管理员后台（数据增删查改、分页）
- 关于织间页面

### 后续迭代候选
生理期、大件物品成本、共享账本、体重记录

---

## App 名称

**织间** — 取"编织时间"和"我们之间"的双关。每一个功能，都在编织属于你们的时间。

---

## 核心业务规则

### 积分规则

任务和心愿共享同一套积分体系，初始双方积分均为 0。

**任务 — B 赚积分：**
1. A 发布任务（标题必填 + 描述可选 + 可选图片 + 积分值）→ 状态：待完成
2. B 完成任务，提交确认 → 状态：待确认
3. A 确认完成 → 积分生成，进入 B 的账户 → 状态：已完成
4. A 不满意 → 不确认即可，双方线下沟通

**心愿 — A 花积分：**
1. A 发布心愿（标题必填 + 描述可选 + 可选图片 + 积分值）→ 状态：待完成
2. B 实现心愿，提交确认 → 状态：待确认
3. A 确认完成 → 积分从 A 账户扣除 → 状态：已完成
4. A 不满意 → 不确认即可

**关键规则：**
- 双方角色完全对称——都可发布任务/心愿、完成任务/心愿
- 任务给执行者加分，心愿从发布者扣分
- 积分只有"生成"和"消耗"两个出口

### 编辑与删除权限

| 状态 | 发布者可编辑/删除 |
|------|----------|
| 待完成（任务/心愿） | ✅ |
| 待确认 | ❌ |
| 已完成 | ❌ 锁定归档 |

---

## 导航结构

**底部 Tab（所有屏幕尺寸）：**
- 🏠 首页
- ＋ 创建（上下文感知：任务页直接跳创建任务，心愿页直接跳创建心愿，其他页面弹出 iOS 风格选择卡片）
- 👤 我的

**筛选栏：**
- 任务/心愿列表页使用双下拉筛选（角色 + 状态），筛选值保存在 URL 参数中，页面返回不丢失
- 任务/心愿/旅游/漫游/聚餐 列表页均支持关键词搜索（300ms 防抖），搜索框位于筛选区上方

---

## 页面设计

### 1. 首页

```
┌──────────────────────┐
│  🧵 织间          🔔2 │  ← 顶部栏 + 消息铃铛(未读数)
├──────────────────────┤
│  ┌ 积分概览 ─────────┐ │
│  │  我: 320  Ta: 280 │ │
│  │  💕 在一起 520 天 │ │  ← 仅当设置了在一起纪念日
│  └───────────────────┘ │
│  ┌ 待处理 (3) ────────┐ │  ← 只显示数量，点击进待办列表
│  └───────────────────┘ │
│  ┌ 最近动态 ──────────┐ │
│  │ 距离Ta生日还剩6天  │ │  ← 最近即将到来的纪念日
│  │ X确认了任务...     │ │
│  └───────────────────┘ │
│  ┌───┐┌───┐┌───┐┌───┐ │  ← 2x2 导航卡片
│  │任务││心愿││菜谱││纪念│ │
│  └───┘└───┘└───┘└───┘ │
│  ┌ 更多功能 ──────────┐ │  ← 后续功能占位
│  └───────────────────┘ │
├──────────────────────┤
│  🏠      ＋      👤  │
└──────────────────────┘
```

### 2. ＋ 创建弹出（iOS 风格）

首页点 +：底部滑出半透明遮罩 + 圆角卡片网格，每格一个小卡片：
- ✏️ 任务 → `/tasks/create`
- 💝 心愿 → `/wishes/create`
- 🍳 菜谱 → `/recipes/create`
- 📅 纪念日 → `/anniversaries/create`

取消按钮独立分离在下方。在特定功能页点 + 直接跳对应创建页。

### 3. 任务列表

```
┌──────────────────────┐
│  ← 任务               │
├──────────────────────┤
│  [指派给我的 ▼] [全部状态 ▼] │  ← 双下拉筛选，URL参数持久化
├──────────────────────┤
│  任务卡片列表           │
│  - 标题 + 积分 + 来源标签 │
│  - 状态标签(待完成/待确认/已完成) │
└──────────────────────┘
```

### 4. 创建任务 / 编辑任务

```
┌──────────────────────┐
│  ← 发布任务/编辑任务   │
├──────────────────────┤
│  任务标题 *            │
│  描述（可选）  📷      │
│  积分                  │
│  [ 发布任务 / 保存修改 ]│
└──────────────────────┘
```

编辑任务为独立页面 `/tasks/[id]/edit`，布局与创建页一致，预填现有数据。

### 5. 任务详情 & 状态流转

```
待完成 ──B提交→ 待确认 ──A确认→ 已完成

页面显示：
- 发布者/执行者 用户名
- 时间线：创建时间 · 提交时间 · 确认时间 · 最近编辑（精确到分钟）
- 待完成：执行者可见"完成任务"，发布者可见"编辑/删除"
- 待确认：发布者可见"确认完成"
- 已完成：锁定
```

### 6. 心愿列表

与任务列表结构一致，双下拉筛选（全部/我的/Ta的心愿 × 全部/待完成/待确认/已完成）。卡片显示来源标签"发布者：我"或"来自：Ta"。

### 7. 心愿详情 & 状态流转

```
待完成 ──B提交→ 待确认 ──A确认→ 已完成（扣除A积分）

与任务详情结构一致：
- 发布者/实现者 用户名
- 时间线：创建时间 · 提交时间 · 确认时间 · 最近编辑
- 待完成：实现者可见"完成心愿"，发布者可见"编辑/删除"
- 待确认：发布者可见"确认完成"
- 已完成：锁定
```

### 8. 消息中心

消息列表（按时间倒序），类型图标 + 内容摘要 + 相对时间 + 未读红点。点击跳转对应任务/心愿详情。

消息类型：任务已发布、任务已提交、任务已确认、任务已编辑、任务已删除、心愿已发布、心愿已提交、心愿已确认、心愿已编辑、心愿已删除

### 9. 我的（设置）

```
┌──────────────────────┐
│  ← 我的              │
├──────────────────────┤
│  用户名 + 配对状态    │
├──────────────────────┤
│  配对管理         →  │
│  主题切换（温馨/极简） │
│  关于织间         →  │
├──────────────────────┤
│  管理后台  → (管理员可见) │
├──────────────────────┤
│  退出登录             │
└──────────────────────┘
```

### 10. 注册 & 登录

- 注册：用户名 + 密码 → 获得 8 位邀请码
- 配对：分享邀请码给伴侣 → 伴侣注册时输入 → 双向配对
- 登录：用户名 + 密码 → 会话有效期 30 天

### 11. 管理员后台

管理员登录后在"我的"页面看到入口。可对用户/任务/心愿进行增删查改，每类数据默认显示 10 条，支持"加载更多"分页。可在页面内设置/取消其他用户的管理员权限。

---

## 数据模型

### users
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| username | text | 唯一 |
| password_hash | text | bcrypt |
| invite_code | text | 唯一，注册自动生成 |
| paired_user_id | integer? | 配对的用户 ID |
| is_admin | integer | 0/1，是否管理员 |
| created_at | text | ISO 时间戳 |

### tasks
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| title | text | 必填 |
| description | text? | 可选 |
| image_url | text? | 可选 |
| points | integer | 积分奖励 |
| creator_id | integer | 发布者 |
| assignee_id | integer | 执行者 |
| status | text | pending / submitted / confirmed |
| created_at | text | |
| submitted_at | text? | 提交时间 |
| confirmed_at | text? | 确认时间 |
| updated_at | text | 最后更新时间 |

### wishes
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| title | text | 必填 |
| description | text? | |
| image_url | text? | |
| points | integer | 心愿分值 |
| creator_id | integer | 发布者 |
| fulfiller_id | integer | 实现者 |
| status | text | pending / submitted / confirmed |
| created_at | text | |
| submitted_at | text? | |
| confirmed_at | text? | |
| updated_at | text | |

### notifications
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| user_id | integer | 接收者 |
| type | text | 消息类型 |
| title | text | |
| body | text | |
| link_type | text | task / wish |
| link_id | integer | 关联 ID |
| is_read | integer | 0/1 |
| created_at | text | |

### user_settings
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | integer | 主键 |
| theme | text | warm / dark |

### point_transactions
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| user_id | integer | 用户 |
| amount | integer | 正=赚，负=花 |
| type | text | earned / spent |
| source_type | text | task / wish |
| source_id | integer | |
| created_at | text | |

### recipes
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| title | text | 菜名 |
| image_url | text? | 封面图片 |
| ingredients | text? | 食材清单（自由文本） |
| steps | text? | 烹饪步骤（自由文本） |
| cook_count | integer | 做菜次数（冗余，便于排序） |
| avg_rating | integer? | 平均评分，定时计算 |
| last_cooked_at | text? | 最近做菜时间 |
| creator_id | integer | 添加者 |
| created_at | text | |
| updated_at | text | |

### cook_history
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| recipe_id | integer | 关联菜谱 |
| user_id | integer | 烹饪者 |
| rating | integer? | 1-5 评分 |
| created_at | text | |

### anniversaries
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| user_id | integer | 创建者 |
| name | text | 纪念日名称 |
| date | text | YYYY-MM-DD，若是农历则为农历日期 |
| note | text? | 备注 |
| is_lunar | integer | 0/1，是否农历 |
| is_together | integer | 0/1，是否在一起纪念日，全局唯一 |
| created_at | text | |
| updated_at | text | |

### destinations
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| name | text | 目的地名 |
| cover_image | text? | 封面图 |
| tagline | text? | 标语 |
| status | text | wishlist / visited |
| city | text? | 城市名 |
| lat | real? | 纬度 |
| lng | real? | 经度 |
| places_to_visit | text? | 想去的地点 |
| itinerary_draft | text? | 行程草稿 |
| budget_estimate | real? | 预算估算 |
| notes | text? | 备注 |
| visited_at | text? | 去过时间 |
| creator_id | integer | 创建者 |
| created_at | text | |
| updated_at | text | |

### expenses
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| destination_id | integer | 关联目的地 |
| category | text | transport/accommodation/dining/tickets/shopping/other |
| amount | real | 金额 |
| payer | text | me / partner |
| note | text? | 备注 |
| created_at | text | |

### wanders
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| location | text | 地点 |
| date | text | 去过日期 YYYY-MM-DD |
| image_url | text? | 照片 |
| mood | text? | 一句话心情 |
| creator_id | integer | 创建者 |
| created_at | text | |

### items
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| name | text | 物品名 |
| date | text | 购买日期 |
| price | real | 价格 |
| category | text? | 电子/家居/户外/服饰/其他 |
| status | text | active/retired |
| retired_date | text? | 退役日期 |
| image_url | text? | 照片 |
| note | text? | 备注 |
| creator_id | integer | 创建者 |
| created_at | text | |

### dines
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| restaurant | text | 餐厅名 |
| date | text | 聚餐日期 YYYY-MM-DD |
| people | text? | 参与人 |
| dishes | text? | 菜品 |
| cost | real? | 人均花费 |
| rating | integer? | 1-5 评分 |
| comment | text? | 点评 |
| image_url | text? | 照片 |
| creator_id | integer | 创建者 |
| created_at | text | |

### todos
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| content | text | 待办内容 |
| done | integer | 0/1 |
| archived | integer | 0/1 |
| area | text | together / personal |
| user_id | integer? | 个人备忘所属用户 |
| sort_order | integer | 拖拽排序序号 |
| created_at | text | |

---

## 菜谱功能（2026-05）

### 业务规则
- 双方共同维护菜谱库，均可查看、编辑、删除
- 不支持积分联动，纯信息记录
- 做菜记录：详情页点击"做了一次"按钮，可选评分 1-5
- 评分影响平均评分和做菜次数统计

### 页面
- `/recipes` — 列表页：搜索框 + 排序切换（最新/常做/最近做过）
- `/recipes/create` — 创建页：菜名、图片、食材清单、烹饪步骤
- `/recipes/[id]` — 详情页：统计面板 + 做菜按钮 + 评分弹窗 + 做菜历史
- `/recipes/[id]/edit` — 编辑页

---

## 纪念日功能（2026-05）

### 业务规则
- 双方各自维护纪念日，互相可见
- 支持农历日期（lunar-javascript 转换公历计算）
- 在一起纪念日全局唯一，首页显示"和Ta在一起已经XX天"
- 首页动态区显示最近即将到来的纪念日倒计时
- 提前 7 天每日通知提醒，只发给创建者，同一天不重复

### 页面
- `/anniversaries` — 列表页：名称 + 日期 + 相对天数标签
- `/anniversaries/create` — 创建页：名称、日期、农历开关、备注、（在一起开关，仅当无现有在一起纪念日）
- `/anniversaries/[id]/edit` — 编辑 + 删除

---

## 旅游功能（2026-05）

### 业务规则
- 愿望清单：灵感画布卡片，详情页是共享攻略笔记本
- 足迹地图：Leaflet 真实地图，已去过/想去标记，中国/世界切换
- 花费记录：分类（交通/住宿/餐饮/门票/购物/其他），标记支付方
- 城市通过 Nominatim API 搜索定位，自动填入经纬度
- 标记去过：一键从愿望清单移到足迹地图
- 花费记录在 Tab 页按目的地分组 + 目的地详情页直接管理

### 数据模型
- **destinations**：name, coverImage, tagline, status(wishlist/visited), city, lat, lng, placesToVisit, itineraryDraft, budgetEstimate, notes, visitedAt
- **expenses**：destinationId, category, amount, payer(me/partner), note

### 页面
- `/travel` — 三 Tab 主页：愿望清单卡片 / 足迹地图 / 花费记录
- `/travel/create` — 添加目的地：城市搜索定位 + 经纬度
- `/travel/[id]` — 攻略笔记本 + 标记去过 + 花费管理
- `/travel/[id]/edit` — 编辑目的地

---

## 城市漫游功能（2026-05）

### 业务规则
- 轻量级城市漫步记录，时间线卡片流展示
- 地点聚合：自动统计每个地点去过几次，排名展示
- 双方共享所有记录，均可编辑/删除

### 数据模型
- **wanders**：location, date, imageUrl, mood, creatorId

### 页面
- `/wanders` — 时间线卡片流 + 🏆 最爱去的地点统计
- `/wanders/create` — 创建记录：地点、日期、照片、一句话心情
- `/wanders/[id]/edit` — 编辑 + 删除

---

## 聚餐记录功能（2026-05）

### 业务规则
- 记录跟家人朋友的聚餐：餐厅、日期、参与人、菜品、人均花费、星级评分、点评、照片
- 时间线卡片流展示，左侧圆点+竖线样式
- 统计：聚餐次数、总花费、人均花费、最常去餐厅排名

### 数据模型
- **dines**：restaurant, date, people, dishes, cost, rating(1-5), comment, imageUrl

### 页面
- `/dines` — 时间线卡片流 + 统计卡片
- `/dines/create` — 创建页
- `/dines/[id]/edit` — 编辑 + 删除

---

## 待办功能（2026-05）

### 业务规则
- 极简共享便利贴设计
- 两个区域：👥 我们一起（共享）、👤 我的计划（私有）
- 无指派、无截止日期、无提醒、无完成通知
- 支持拖拽排序、内联编辑、划掉/恢复、归档/恢复

### 数据模型
- **todos**：content, done(0/1), archived(0/1), area(together/personal), sortOrder

### 页面
- `/todos` — 主列表：Tab切换 + 输入框 + 列表 + 归档按钮
- `/todos/archive` — 归档页：Tab切换 + 恢复按钮

---

## 日均成本功能（2026-05）

### 业务规则
- 记录大件物品，购买日起至今（或退役日）日均成本
- 状态：服役中 / 已退役，退役后自动记录退役日期，冻结日均计算
- 筛选：全部 / 服役中 / 已退役

### 数据模型
- **items**：name, date, price, category(电子/家居/户外/服饰/其他), status(active/retired), retiredDate, imageUrl, note

### 页面
- `/items` — 卡片列表（日均排序 + 状态筛选Tab）
- `/items/create` — 创建页
- `/items/[id]/edit` — 编辑 + 删除

---

## 主题设计

| 维度 | 温馨风（warm） | 黑夜（dark） |
|------|-------------|----------------|
| 主色调 | 暖粉/珊瑚色系 | 中性灰/冷调 |
| 辅色 | 奶油黄、桃色 | 石板灰、冰蓝 |
| 圆角 | 大圆角 (0.875rem) | 大圆角 (0.875rem) |
| 字体 | 系统无衬线 | 系统无衬线 |
| 阴影 | 柔和弥散阴影 | 锐利/无边 |

通过 CSS 变量 + `data-theme` 属性实现一键切换。

### CSS 变量体系

所有颜色以裸 HSL 值存储在 CSS 变量中，使用时需 `hsl(var(--xxx))` 包裹。

| Token | 用途 |
|-------|------|
| `--background` / `--foreground` | 页面背景 / 正文文字 |
| `--primary` / `--primary-foreground` | 品牌色（粉 350 70% 58%） / 按钮文字 |
| `--card` / `--card-foreground` | 卡片背景 / 卡片文字 |
| `--muted` / `--muted-foreground` | 次要背景 / 次要文字 |
| `--secondary` / `--secondary-foreground` | 辅助背景 / 辅助文字 |
| `--accent` / `--accent-foreground` | 强调背景 / 强调文字 |
| `--destructive` / `--destructive-foreground` | 危险操作（红） / 危险操作文字 |
| `--success` / `--success-foreground` | 成功/完成状态（绿 142 76% 36%） |
| `--warning` / `--warning-foreground` | 警告/提醒状态（橙 38 92% 50%） |
| `--info` / `--info-foreground` | 信息/进行中状态（蓝 221 83% 53%） |
| `--border` / `--input` / `--ring` | 边框 / 输入框 / 焦点环 |

### 共享 UI 模式

| 模式 | 组件 | 说明 |
|------|------|------|
| 空状态 | `EmptyState` | 统一 icon + title + description + action，所有列表页复用 |
| 加载状态 | `Skeleton` | 统一骨架屏，配置 count + className |
| 下拉刷新 | `PullToRefresh` | 支持触摸拖拽 + 鼠标拖拽 |
| Toast 通知 | `sonner` | `toast.success()` / `toast.error()`，`<Toaster>` 在根布局 |
| API 调用 | `fetchWithToast` | `src/lib/api-fetch.ts` 封装，自动拦截错误并弹出 toast |

---

## 图片存储

图片上传至 `data/uploads/` 目录，通过 `/api/uploads/[filename]` 接口读取。与 SQLite 数据库文件同目录，备份只需复制 `data/` 文件夹。

---

## 验证方式

1. `npm run dev` 启动开发服务器
2. 浏览器打开两个窗口（普通 + 隐私模式）模拟 A/B 两个用户
3. 注册 → 配对 → 发布任务 → 完成/确认任务（验证积分增加）
4. 发布心愿 → 完成/确认心愿（验证积分扣除）
5. 验证消息通知触发和跳转
6. 验证编辑/删除权限（仅待完成状态可操作）
7. 验证主题切换
8. 验证筛选栏 URL 参数持久化
9. 管理员后台增删查改
10. 验证菜谱：添加、搜索、排序、做菜记录 + 评分
11. 验证纪念日：添加、农历转换、在一起天数、倒计时、提醒通知
12. `npm run build` 无报错
