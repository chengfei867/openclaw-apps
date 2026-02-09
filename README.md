# Todo App - 开发文档

一个简洁的 Todo 管理应用，包含前后端，使用 SQLite 数据库。

## 技术栈

- **后端**: Node.js + Express.js
- **数据库**: SQLite（better-sqlite3）
- **前端**: 原生 HTML5 + CSS3 + JavaScript

## 项目结构

```
todo-app/
├── backend/
│   ├── package.json        # 后端依赖
│   ├── server.js           # Express 入口（端口、中间件、静态文件）
│   ├── db.js               # SQLite 初始化 + 建表
│   └── routes/
│       └── todos.js        # Todo CRUD 路由
├── frontend/
│   ├── index.html          # 主页面
│   ├── css/style.css       # 样式
│   └── js/app.js           # 前端交互逻辑
├── package.json            # 根 package.json（启动脚本）
├── AGENTS.md               # AI Agent 开发规范
├── README.md               # 本文件
└── USER_GUIDE.md           # 用户手册
```

## 快速开始

```bash
git clone git@github.com:chengfei867/openclaw-apps.git
cd openclaw-apps
git checkout apps/todo-app
npm install
npm start
# 访问 http://localhost:3000
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/todos | 获取所有 todo（支持 ?completed=0\|1） |
| POST | /api/todos | 创建 todo（body: {title, description?}） |
| GET | /api/todos/:id | 获取单个 todo |
| PUT | /api/todos/:id | 更新 todo |
| DELETE | /api/todos/:id | 删除 todo |
| GET | /api/health | 健康检查 |

### 响应格式

```json
{
  "success": true,
  "data": { ... },
  "error": "错误信息（仅失败时）"
}
```

## 数据模型

```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT "",
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3000 | 服务端口 |

## Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

## 开发说明

- 使用 ES Module（import/export）
- SQLite 数据库文件自动创建在 backend/database/ 目录
- 后端同时 serve 前端静态文件，无需额外 web 服务器
