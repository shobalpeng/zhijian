# 织间

> 取"编织时间"与"我们之间"的双关。每一个功能，都在编织属于你们的时间。

织间是一个为情侣或家庭打造的生活互动平台，通过游戏化的积分系统增进双方互动。

## 当前功能

- **心动积分** — 发布任务 → 完成 → 确认 → 获得积分
- **心愿清单** — 发布心愿 → 实现 → 确认 → 消耗积分
- **共享菜谱** — 菜谱库 + 做菜记录 + 评分，支持搜索和三种排序
- **纪念日** — 农历支持 + 倒计时 + 在一起天数 + 提前7天提醒
- **旅游记录** — 愿望清单 + Leaflet 足迹地图 + 花费记录（分类/结算）
- **用户配对** — 邀请码制，安全的一对一匹配
- **消息中心** — 任务/心愿状态流转 + 纪念日提醒通知
- **双主题** — 温馨风（暖色调）/ 黑夜（冷色调）一键切换
- **管理员后台** — 数据增删查改管理

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装与运行

```bash
# 安装依赖
npm install

# 初始化数据库
npx drizzle-kit push

# 启动开发服务器
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 生产部署

```bash
npm run build
npm start
```

数据库文件和上传的图片都在 `data/` 目录下，备份只需复制该文件夹。

### 设置管理员

数据库初始化后，第一个注册的用户不会自动成为管理员。需要手动设置：

```bash
node -e "const D=require('better-sqlite3');const d=new D('data/zhijian.db');d.exec('UPDATE users SET is_admin=1 WHERE id=1');console.log('done');d.close()"
```

或使用现有管理员账号在"我的"→"管理后台"中设置其他用户。

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 | 全栈框架 |
| Drizzle ORM + better-sqlite3 | 数据库 |
| iron-session | 用户认证 |
| shadcn/ui + Tailwind CSS | UI 组件 |
| bcryptjs | 密码加密 |

## 项目结构

```
zhijian/
├── data/                  # SQLite 数据库 + 上传图片
├── db/                    # 数据库 Schema 与连接
├── src/
│   ├── app/               # 页面路由 (App Router)
│   │   ├── admin/         # 管理员后台
│   │   ├── api/           # API 接口
│   │   ├── login/         # 登录
│   │   ├── notifications/ # 消息中心
│   │   ├── pending/       # 待处理列表
│   │   ├── register/      # 注册
│   │   ├── recipes/       # 菜谱
│   │   ├── anniversaries/ # 纪念日
│   │   ├── travel/        # 旅游
│   │   ├── settings/      # 设置
│   │   ├── tasks/         # 任务
│   │   └── wishes/        # 心愿
│   ├── components/        # 通用组件
│   └── lib/               # 工具函数
├── DESIGN.md              # 详细设计文档
└── package.json
```

## 设计文档

详细的产品设计、数据模型、页面布局见 [DESIGN.md](DESIGN.md)。

## License

MIT
