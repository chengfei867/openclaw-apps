# AGENTS.md — Markdown 笔记应用 (md-note)

## 项目概述

一个前后端分离的 Markdown 笔记应用，支持笔记的创建/编辑/删除、Markdown 实时预览、标签分类、暗色/亮色主题切换、用户注册登录等功能。

## 技术栈

### 前端
- **框架**: React 18 + Vite
- **路由**: React Router v6
- **状态管理**: Zustand（轻量、简洁）
- **Markdown 编辑器**: CodeMirror 6（编辑模式）+ react-markdown + remark-gfm（预览渲染）
- **代码高亮**: highlight.js
- **样式**: Tailwind CSS
- **HTTP 客户端**: Axios
- **图标**: Lucide React

### 后端
- **运行时**: Node.js 20
- **框架**: Express.js
- **鉴权**: JWT (jsonwebtoken + bcryptjs)
- **数据库**: SQLite (better-sqlite3)
- **文件上传**: multer
- **校验**: express-validator

### 目录结构

```
md-note/
├── AGENTS.md
├── Dockerfile
├── package.json              # 根 workspace
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       │   └── client.js         # Axios 实例 + 拦截器
│       ├── store/
│       │   ├── authStore.js      # 用户认证状态
│       │   ├── noteStore.js      # 笔记状态
│       │   └── themeStore.js     # 主题状态
│       ├── components/
│       │   ├── Layout.jsx        # 主布局（侧边栏 + 内容区）
│       │   ├── Sidebar.jsx       # 笔记列表侧边栏
│       │   ├── NoteEditor.jsx    # Markdown 编辑器（CodeMirror）
│       │   ├── NotePreview.jsx   # Markdown 预览渲染
│       │   ├── SplitView.jsx     # 分屏编辑+预览
│       │   ├── TagFilter.jsx     # 标签筛选
│       │   ├── SearchBar.jsx     # 搜索框
│       │   ├── ThemeToggle.jsx   # 主题切换按钮
│       │   └── AuthForm.jsx      # 登录/注册表单
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           └── NotePage.jsx      # 主笔记页面
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js              # 入口，Express 启动
│   │   ├── config.js             # 配置（JWT_SECRET, DB_PATH 等）
│   │   ├── db.js                 # SQLite 初始化 + 表创建
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT 验证中间件
│   │   │   └── errorHandler.js   # 全局错误处理
│   │   └── routes/
│   │       ├── auth.js           # POST /api/auth/register, /api/auth/login
│   │       ├── notes.js          # CRUD /api/notes
│   │       ├── tags.js           # CRUD /api/tags
│   │       └── upload.js         # POST /api/upload/md
│   └── uploads/                  # 上传文件临时目录
└── static/                       # 前端构建输出（Dockerfile COPY 用）
```

## API 设计

### 认证
- `POST /api/auth/register` — 注册（username, password）
- `POST /api/auth/login` — 登录，返回 JWT token

### 笔记
- `GET /api/notes` — 获取当前用户所有笔记（支持 ?search=xxx&tag=xxx 查询参数）
- `GET /api/notes/:id` — 获取单个笔记
- `POST /api/notes` — 创建笔记（title, content, tags[]）
- `PUT /api/notes/:id` — 更新笔记
- `DELETE /api/notes/:id` — 删除笔记

### 标签
- `GET /api/tags` — 获取当前用户所有标签
- `POST /api/tags` — 创建标签（name, color）
- `DELETE /api/tags/:id` — 删除标签

### 文件上传
- `POST /api/upload/md` — 上传 .md 文件，解析后创建笔记

### 健康检查
- `GET /api/health` — 返回 `{ "status": "ok" }`

## 数据库设计（SQLite）

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  is_draft INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  UNIQUE(user_id, name)
);

CREATE TABLE note_tags (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
```

## 约束

- 后端监听端口 **3030**（3000 被 Kanban 占用）
- 后端在生产模式下同时 serve 前端静态文件（`express.static('./static')`）
- 前端构建输出到 `static/` 目录
- 前端开发时 Vite 代理 `/api` 到 `http://localhost:3030`
- JWT_SECRET 通过环境变量配置，默认 `md-note-secret-key`
- SQLite 数据库文件路径：`./data/notes.db`
- 所有 API 路由以 `/api` 开头
- 前端路由使用 hash router（避免刷新 404）
- 暗色/亮色主题通过 Tailwind `dark:` class 实现，状态持久化到 localStorage
- 自动保存草稿：编辑器内容变化后 2 秒自动调用 PUT 更新
- 本地缓存：笔记列表缓存到 localStorage，离线时可查看
