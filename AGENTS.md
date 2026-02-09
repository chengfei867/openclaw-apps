# AGENTS.md - Todo App 开发规范

## 项目概述
开发一个 Todo 管理应用，包含前后端，数据库使用 SQLite。

## 技术栈
- **后端**: Node.js + Express.js
- **数据库**: SQLite（使用 better-sqlite3）
- **前端**: 原生 HTML5 + CSS3 + JavaScript（无框架）
- **API 风格**: RESTful JSON API

## 项目结构
```
todo-app/
├── backend/
│   ├── package.json
│   ├── server.js          # Express 入口
│   ├── db.js              # SQLite 初始化
│   ├── routes/
│   │   └── todos.js       # Todo CRUD 路由
│   └── database/
│       └── todos.db       # SQLite 数据库文件（自动生成）
├── frontend/
│   ├── index.html         # 主页面
│   ├── css/
│   │   └── style.css      # 样式
│   └── js/
│       └── app.js         # 前端逻辑
├── package.json            # 根 package.json（启动脚本）
├── AGENTS.md
├── README.md               # 开发文档
└── USER_GUIDE.md           # 用户手册
```

## 数据模型
```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API 设计
```
GET    /api/todos          # 获取所有 todo（支持 ?completed=0|1 筛选）
POST   /api/todos          # 创建 todo（body: {title, description?}）
GET    /api/todos/:id      # 获取单个 todo
PUT    /api/todos/:id      # 更新 todo（body: {title?, description?, completed?}）
DELETE /api/todos/:id      # 删除 todo
```

## 前端功能
- 显示 todo 列表（区分已完成/未完成）
- 添加新 todo（标题 + 可选描述）
- 标记 todo 完成/未完成（点击切换）
- 编辑 todo
- 删除 todo
- 筛选：全部 / 未完成 / 已完成
- 简洁美观的 UI，响应式设计

## 编码规范
- 后端端口默认 3000，可通过 PORT 环境变量配置
- 后端同时 serve 前端静态文件（frontend/ 目录）
- 所有 API 返回统一格式：`{ success: boolean, data: any, error?: string }`
- 使用 ES Module（import/export）
- 代码需有基本注释

## 启动方式
```bash
cd todo-app
npm install
npm start
# 访问 http://localhost:3000
```
