# 织间 Docker 部署指南

## 快速部署

将 `docker/` 文件夹复制到服务器，然后：

```bash
cd docker
docker compose up -d --build
```

访问 `http://<服务器IP>:3000`。

## 目录结构

```
docker/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── init-db.js            # 启动时自动建表
├── src/                  # 源码
├── db/                   # 数据库 Schema
├── data/                 # 数据库文件（挂载为 volume）
└── package.json 等       # 项目配置文件
```

## 环境变量

在 `docker-compose.yml` 中配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SESSION_SECRET` | 会话加密密钥（≥32字符） | 必须设置 |
| `SESSION_SECURE` | 是否启用 secure cookie | `false`（HTTP），`true`（HTTPS） |

## 端口

默认映射 `3000:3000`，修改 `docker-compose.yml` 中 `ports` 即可，如 `"9920:3000"`。

## 数据持久化

数据库和上传文件存储在 `./data/` 目录，通过 Docker volume 持久化。备份直接复制该文件夹。

## 更新部署

```bash
# 1. 本地重新生成 docker 文件夹
# 2. 复制到服务器覆盖
# 3. 服务器上重建容器
docker compose down
docker compose up -d --build
```

## 更新 docker 文件夹（本地维护）

本地修改源码后，需要重新生成 `docker/` 里的项目文件：

```bash
# 在项目根目录执行
cp -r src/ db/ package.json package-lock.json next.config.ts tsconfig.json \
      postcss.config.mjs components.json drizzle.config.ts eslint.config.mjs \
      docker/
```

或者直接复制整个项目文件，注意不要覆盖 `docker/` 自己的特有文件（Dockerfile、docker-compose.yml、init-db.js 等）。

> Docker 独有的文件：`Dockerfile`、`docker-compose.yml`、`init-db.js`、`next.config.ts`（含 `output: "standalone"`）。
