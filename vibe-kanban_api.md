# Vibe Kanban API 文档

## API 基础路径

所有 API 端点前缀: `/api`

---

## 通用响应格式

```typescript
ApiResponse<T, E = T> = {
  success: boolean,
  data: T | null,
  error_data: E | null,
  message: string | null
}
```

---

## 健康检查 & 系统

| 方法 | 路径 | 描述 | 响应类型 |
|------|------|------|----------|
| GET | `/health` | 健康检查 | `ApiResponse<String>` ("OK") |

---

## 配置 & 系统信息

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/info` | 获取用户系统信息 | - | `ApiResponse<UserSystemInfo>` |
| PUT | `/config` | 更新配置 | `Config` | `ApiResponse<Config>` |
| GET | `/sounds/{sound}` | 获取音效文件 | - | WAV 音频文件 |
| GET | `/mcp-config?executor={BaseCodingAgent}` | 获取 MCP 服务器配置 | - | `ApiResponse<GetMcpServerResponse>` |
| POST | `/mcp-config?executor={BaseCodingAgent}` | 更新 MCP 服务器配置 | `UpdateMcpServersBody` | `ApiResponse<String>` |
| GET | `/profiles` | 获取执行器配置 | - | `ApiResponse<ProfilesContent>` |
| PUT | `/profiles` | 更新执行器配置 | `String` (JSON) | `ApiResponse<String>` |
| GET | `/editors/check-availability?editor_type={EditorType}` | 检查编辑器可用性 | - | `ApiResponse<CheckEditorAvailabilityResponse>` |
| GET | `/agents/check-availability?executor={BaseCodingAgent}` | 检查 Agent 可用性 | - | `ApiResponse<AvailabilityInfo>` |
| GET | `/agents/slash-commands/ws` | 流式获取 Agent 斜杠命令 (WebSocket) | Query: `executor`, `workspace_id`, `repo_id` | JSON Patches |

---

## 认证 & OAuth

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| POST | `/auth/handoff/init` | 初始化 OAuth 握手 | `{ provider: string, return_to: string }` | `ApiResponse<{ handoff_id: UUID, authorize_url: string }>` |
| GET | `/auth/handoff/complete` | 完成 OAuth 握手 | Query: `handoff_id`, `app_code`, `error` | HTML 页面 |
| POST | `/auth/logout` | 登出 | - | `204 No Content` |
| GET | `/auth/status` | 获取认证状态 | - | `ApiResponse<StatusResponse>` |
| GET | `/auth/token` | 获取访问令牌 | - | `ApiResponse<TokenResponse>` |
| GET | `/auth/user` | 获取当前用户 | - | `ApiResponse<CurrentUserResponse>` |

---

## 项目 (Projects)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/projects` | 获取项目列表 | - | `ApiResponse<Vec<Project>>` |
| POST | `/projects` | 创建项目 | `CreateProject` | `ApiResponse<Project>` |
| GET | `/projects/stream/ws` | 流式获取项目更新 (WebSocket) | - | 项目更新流 |
| GET | `/projects/{id}` | 获取单个项目 | - | `ApiResponse<Project>` |
| PUT | `/projects/{id}` | 更新项目 | `UpdateProject` | `ApiResponse<Project>` |
| DELETE | `/projects/{id}` | 删除项目 | - | `ApiResponse<()>` |
| GET | `/projects/{id}/search?q={query}&mode={SearchMode}` | 搜索项目文件 | - | `ApiResponse<Vec<SearchResult>>` |
| POST | `/projects/{id}/open-editor` | 在编辑器中打开项目 | `Option<OpenEditorRequest>` | `ApiResponse<OpenEditorResponse>` |
| GET | `/projects/{id}/repositories` | 获取项目仓库列表 | - | `ApiResponse<Vec<Repo>>` |
| POST | `/projects/{id}/repositories` | 添加项目仓库 | `CreateProjectRepo` | `ApiResponse<Repo>` |
| GET | `/projects/{project_id}/repositories/{repo_id}` | 获取项目仓库详情 | - | `ApiResponse<ProjectRepo>` |
| DELETE | `/projects/{project_id}/repositories/{repo_id}` | 删除项目仓库 | - | `ApiResponse<()>` |

---

## 任务 (Tasks)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/projects/{project_id}/tasks` | 获取任务列表 | Query: `project_id` | `ApiResponse<Vec<TaskWithAttemptStatus>>` |
| POST | `/projects/{project_id}/tasks` | 创建任务 | `CreateTask` | `ApiResponse<Task>` |
| POST | `/projects/{project_id}/tasks/create-and-start` | 创建并启动任务 | `CreateAndStartTaskRequest` | `ApiResponse<TaskWithAttemptStatus>` |
| GET | `/projects/{project_id}/tasks/stream/ws` | 流式获取任务更新 (WebSocket) | Query: `project_id` | 任务更新流 |
| GET | `/projects/{project_id}/tasks/{task_id}` | 获取单个任务 | - | `ApiResponse<Task>` |
| PUT | `/projects/{project_id}/tasks/{task_id}` | 更新任务 | `UpdateTask` | `ApiResponse<Task>` |
| DELETE | `/projects/{project_id}/tasks/{task_id}` | 删除任务 | - | `202 Accepted, ApiResponse<()>` |

### 任务状态枚举 (TaskStatus)
- `todo` - 待办
- `inprogress` - 进行中
- `inreview` - 审核中
- `done` - 已完成
- `cancelled` - 已取消

---

## 仓库 (Repositories)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/repos` | 获取所有仓库 | - | `ApiResponse<Vec<Repo>>` |
| POST | `/repos` | 注册仓库 | `RegisterRepoRequest` | `ApiResponse<Repo>` |
| POST | `/repos/init` | 初始化仓库 | `InitRepoRequest` | `ApiResponse<Repo>` |
| POST | `/repos/batch` | 批量获取仓库 | `BatchRepoRequest` | `ApiResponse<Vec<Repo>>` |
| GET | `/repos/{repo_id}` | 获取单个仓库 | - | `ApiResponse<Repo>` |
| PUT | `/repos/{repo_id}` | 更新仓库 | `UpdateRepo` | `ApiResponse<Repo>` |
| GET | `/repos/{repo_id}/branches` | 获取仓库分支 | - | `ApiResponse<Vec<GitBranch>>` |
| GET | `/repos/{repo_id}/remotes` | 获取仓库远程 | - | `ApiResponse<Vec<GitRemote>>` |
| GET | `/repos/{repo_id}/prs?remote={remote_name}` | 列出开放的 PR | - | `ApiResponse<Vec<OpenPrInfo>>` |
| GET | `/repos/{repo_id}/search?q={query}&mode={SearchMode}` | 搜索仓库文件 | - | `ApiResponse<Vec<SearchResult>>` |
| POST | `/repos/{repo_id}/open-editor` | 在编辑器中打开仓库 | `Option<OpenEditorRequest>` | `ApiResponse<OpenEditorResponse>` |

---

## 标签 (Tags)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/tags?search={search_query}` | 获取标签列表 | - | `ApiResponse<Vec<Tag>>` |
| POST | `/tags` | 创建标签 | `CreateTag` | `ApiResponse<Tag>` |
| PUT | `/tags/{tag_id}` | 更新标签 | `UpdateTag` | `ApiResponse<Tag>` |
| DELETE | `/tags/{tag_id}` | 删除标签 | - | `ApiResponse<()>` |

---

## 容器 & 工作区 (Containers & Workspaces)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/containers/info?ref={container_ref}` | 获取容器信息 | - | `ApiResponse<ContainerInfo>` |
| GET | `/containers/attempt-context?ref={container_ref}` | 获取尝试上下文 | - | `ApiResponse<WorkspaceContext>` |

---

## 执行进程 (Execution Processes)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/execution-processes/{id}` | 获取执行进程 | - | `ApiResponse<ExecutionProcess>` |
| POST | `/execution-processes/{id}/stop` | 停止执行进程 | - | `ApiResponse<()>` |
| GET | `/execution-processes/{id}/repo-states` | 获取执行进程仓库状态 | - | `ApiResponse<Vec<ExecutionProcessRepoState>>` |
| GET | `/execution-processes/{id}/raw-logs/ws` | 流式获取原始日志 (WebSocket) | - | JSON Patches |
| GET | `/execution-processes/{id}/normalized-logs/ws` | 流式获取标准化日志 (WebSocket) | - | 标准化日志消息 |
| GET | `/execution-processes/stream/session/ws` | 按会话流式获取执行进程 (WebSocket) | Query: `session_id`, `show_soft_deleted` | 执行进程流 |

### 执行进程状态枚举 (ExecutionProcessStatus)
- `running` - 运行中
- `completed` - 已完成
- `failed` - 失败
- `killed` - 已终止

---

## 会话 (Sessions)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/sessions?workspace_id={uuid}` | 获取会话列表 | - | `ApiResponse<Vec<Session>>` |
| GET | `/sessions/{session_id}` | 获取单个会话 | - | `ApiResponse<Session>` |
| POST | `/sessions` | 创建会话 | `CreateSessionRequest` | `ApiResponse<Session>` |
| POST | `/sessions/{session_id}/follow-up` | 创建后续尝试 | `CreateFollowUpAttempt` | `ApiResponse<ExecutionProcess>` |

---

## 任务尝试 / 工作区 (Task Attempts / Workspaces)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/task-attempts/{workspace_id}` | 获取任务尝试 | - | `ApiResponse<Workspace>` |
| POST | `/task-attempts/{workspace_id}/start` | 启动任务尝试 | `StartWorkspaceRequest` | `ApiResponse<Workspace>` |
| POST | `/task-attempts/{workspace_id}/stop` | 停止任务尝试 | - | `ApiResponse<()>` |
| POST | `/task-attempts/{workspace_id}/archive` | 归档任务尝试 | - | `ApiResponse<()>` |
| POST | `/task-attempts/{workspace_id}/unarchive` | 取消归档任务尝试 | - | `ApiResponse<()>` |
| POST | `/task-attempts/{workspace_id}/pin` | 固定任务尝试 | - | `ApiResponse<()>` |
| POST | `/task-attempts/{workspace_id}/unpin` | 取消固定任务尝试 | - | `ApiResponse<()>` |
| POST | `/task-attempts/{workspace_id}/rename` | 重命名任务尝试 | `{ name: string }` | `ApiResponse<Workspace>` |
| POST | `/task-attempts/{workspace_id}/rebase` | 变基任务尝试 | `RebaseTaskAttemptRequest` | `ApiResponse<()>` |
| POST | `/task-attempts/{workspace_id}/abort-conflicts` | 中止冲突 | `AbortConflictsRequest` | `ApiResponse<()>` |
| POST | `/task-attempts/{workspace_id}/continue-rebase` | 继续变基 | `ContinueRebaseRequest` | `ApiResponse<()>` |
| GET | `/task-attempts/{workspace_id}/diff/ws?stats_only={bool}` | 流式获取差异 (WebSocket) | - | 差异更新流 |
| GET | `/task-attempts/{workspace_id}/summary/ws` | 流式获取工作区摘要 (WebSocket) | - | 摘要更新流 |
| GET | `/task-attempts/{workspace_id}/pr` | 获取 PR 信息 | - | `ApiResponse<PullRequestInfo>` |
| POST | `/task-attempts/{workspace_id}/pr` | 创建 PR | `CreatePrRequest` | `ApiResponse<PullRequestInfo>` |
| POST | `/task-attempts/{workspace_id}/pr/merge` | 合并 PR | `MergePrRequest` | `ApiResponse<Merge>` |
| GET | `/task-attempts/{workspace_id}/cursor-setup` | 获取 Cursor 设置状态 | - | `ApiResponse<CursorSetupStatus>` |
| POST | `/task-attempts/{workspace_id}/cursor-setup` | 设置 Cursor | - | `ApiResponse<()>` |
| GET | `/task-attempts/{workspace_id}/codex-setup` | 获取 Codex 设置状态 | - | `ApiResponse<CodexSetupStatus>` |
| POST | `/task-attempts/{workspace_id}/codex-setup` | 设置 Codex | - | `ApiResponse<()>` |
| GET | `/task-attempts/{workspace_id}/gh-cli-setup` | 获取 GH CLI 设置状态 | - | `ApiResponse<GhCliSetupStatus>` |
| POST | `/task-attempts/{workspace_id}/gh-cli-setup` | 设置 GH CLI | - | `ApiResponse<()>` |

---

## 暂存 / UI 状态持久化 (Scratch)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/scratch` | 列出暂存项 | - | `ApiResponse<Vec<Scratch>>` |
| GET | `/scratch/{scratch_type}/{id}` | 获取暂存项 | - | `ApiResponse<Scratch>` |
| POST | `/scratch/{scratch_type}/{id}` | 创建暂存项 | `CreateScratch` | `ApiResponse<Scratch>` |
| PUT | `/scratch/{scratch_type}/{id}` | 更新暂存项 | `UpdateScratch` | `ApiResponse<Scratch>` |
| DELETE | `/scratch/{scratch_type}/{id}` | 删除暂存项 | - | `ApiResponse<()>` |
| GET | `/scratch/{scratch_type}/{id}/stream/ws` | 流式获取暂存更新 (WebSocket) | - | 暂存更新流 |

### 暂存类型枚举 (ScratchType)
- `DRAFT_TASK` - 草稿任务
- `DRAFT_FOLLOW_UP` - 草稿后续
- `DRAFT_WORKSPACE` - 草稿工作区
- `PREVIEW_SETTINGS` - 预览设置
- `WORKSPACE_NOTES` - 工作区笔记
- `UI_PREFERENCES` - UI 偏好设置

---

## 搜索 (Search)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/search?q={query}&mode={SearchMode}&repo_ids={uuid1,uuid2,...}` | 多仓库文件搜索 | - | `ApiResponse<Vec<SearchResult>>` |

---

## 审批 (Approvals)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| POST | `/approvals/{id}/respond` | 响应审批 | `ApprovalResponse` | `ApiResponse<ApprovalStatus>` |

---

## 组织 (Organizations)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/organizations` | 列出组织 | - | `ApiResponse<ListOrganizationsResponse>` |
| POST | `/organizations` | 创建组织 | `CreateOrganizationRequest` | `ApiResponse<CreateOrganizationResponse>` |
| GET | `/organizations/{id}` | 获取组织 | - | `ApiResponse<GetOrganizationResponse>` |
| PATCH | `/organizations/{id}` | 更新组织 | `UpdateOrganizationRequest` | `ApiResponse<Organization>` |
| DELETE | `/organizations/{id}` | 删除组织 | - | `204 No Content` |
| POST | `/organizations/{org_id}/invitations` | 创建邀请 | `CreateInvitationRequest` | `ApiResponse<CreateInvitationResponse>` |
| GET | `/organizations/{org_id}/invitations` | 列出邀请 | - | `ApiResponse<ListInvitationsResponse>` |
| POST | `/organizations/{org_id}/invitations/revoke` | 撤销邀请 | `RevokeInvitationRequest` | `204 No Content` |
| GET | `/invitations/{token}` | 获取邀请 | - | `ApiResponse<GetInvitationResponse>` |
| POST | `/invitations/{token}/accept` | 接受邀请 | - | `ApiResponse<AcceptInvitationResponse>` |
| GET | `/organizations/{org_id}/members` | 列出组织成员 | - | `ApiResponse<ListMembersResponse>` |
| DELETE | `/organizations/{org_id}/members/{user_id}` | 移除组织成员 | - | `204 No Content` |
| PATCH | `/organizations/{org_id}/members/{user_id}/role` | 更新成员角色 | `UpdateMemberRoleRequest` | `ApiResponse<UpdateMemberRoleResponse>` |

### 成员角色枚举 (MemberRole)
- `ADMIN` - 管理员
- `MEMBER` - 成员

### 邀请状态枚举 (InvitationStatus)
- `PENDING` - 待处理
- `ACCEPTED` - 已接受
- `DECLINED` - 已拒绝
- `EXPIRED` - 已过期

---

## 文件系统 (Filesystem)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/filesystem/directory?path={path}` | 列出目录 | - | `ApiResponse<DirectoryListResponse>` |
| GET | `/filesystem/git-repos?path={path}` | 列出 Git 仓库 | - | `ApiResponse<Vec<DirectoryEntry>>` |

---

## 图片 (Images)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| POST | `/images/upload` | 上传图片 | `multipart/form-data` (最大 20MB) | `ApiResponse<ImageResponse>` |
| GET | `/images/{id}/file` | 获取图片文件 | - | 图片文件 |
| DELETE | `/images/{id}` | 删除图片 | - | `ApiResponse<()>` |
| GET | `/images/task/{task_id}` | 获取任务图片 | - | `ApiResponse<Vec<ImageResponse>>` |
| GET | `/images/task/{task_id}/metadata?path={path}` | 获取任务图片元数据 | - | `ApiResponse<ImageMetadata>` |
| POST | `/images/task/{task_id}/upload` | 上传任务图片 | `multipart/form-data` (最大 20MB) | `ApiResponse<ImageResponse>` |

---

## 事件 (Events)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/events` | 流式获取事件 (SSE) | - | Server-Sent Events 流 |

---

## 终端 (Terminal)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| GET | `/terminal/ws?workspace_id={uuid}&cols={cols}&rows={rows}` | 终端 WebSocket | 默认: cols=80, rows=24 | 交互式终端会话 |

---

## 迁移 (Migration)

| 方法 | 路径 | 描述 | 请求体 | 响应类型 |
|------|------|------|--------|----------|
| POST | `/migration/start` | 开始迁移 | `MigrationRequest` | `ApiResponse<MigrationResponse>` |

---

## 项目目录结构

```
vibe-kanban/
├── crates/                    # Rust 工作区
│   ├── server/               # API 服务器 + 二进制文件
│   ├── db/                   # SQLx 模型和迁移
│   ├── executors/            # 执行器
│   ├── services/             # 服务层
│   ├── utils/                # 工具函数
│   ├── deployment/           # 部署相关
│   ├── local-deployment/     # 本地部署
│   └── remote/               # 远程相关
├── frontend/                  # React + TypeScript 前端
│   └── src/
│       └── components/
│           └── dialogs/      # 对话框组件
├── remote-frontend/           # 远程部署前端
├── shared/                    # 共享类型
│   └── types.ts              # 自动生成的 TypeScript 类型
├── assets/                    # 打包资源
├── dev_assets_seed/           # 开发资源种子
├── dev_assets/                # 本地开发资源
├── npx-cli/                   # npm CLI 包
├── scripts/                   # 开发辅助脚本
└── docs/                      # 文档
```

---

## 常用命令

```bash
# 安装依赖
pnpm i

# 开发模式 (前端 + 后端)
pnpm run dev

# 后端开发 (监听模式)
pnpm run backend:dev:watch

# 前端开发
pnpm run frontend:dev

# 类型检查
pnpm run check              # 前端
pnpm run backend:check      # Rust

# 测试
cargo test --workspace

# 生成 TypeScript 类型
pnpm run generate-types

# 准备 SQLx (离线模式)
pnpm run prepare-db
```

---

## 请求体类型定义 (Request Body Types)

以下是所有 API 路由中使用的请求体对象的详细类型定义。

### 项目相关 (Projects)

#### CreateProject
创建项目请求体
```typescript
type CreateProject = {
  name: string,                           // 项目名称
  repositories: Array<CreateProjectRepo>, // 关联的仓库列表
}
```

#### UpdateProject
更新项目请求体
```typescript
type UpdateProject = {
  name: string | null,  // 项目名称 (可选)
}
```

#### CreateProjectRepo
创建项目仓库关联
```typescript
type CreateProjectRepo = {
  display_name: string,   // 显示名称
  git_repo_path: string,  // Git 仓库路径
}
```

---

### 任务相关 (Tasks)

#### CreateTask
创建任务请求体
```typescript
type CreateTask = {
  project_id: string,                    // 所属项目 ID
  title: string,                         // 任务标题
  description: string | null,            // 任务描述 (可选)
  status: TaskStatus | null,             // 任务状态 (可选)
  parent_workspace_id: string | null,    // 父工作区 ID (可选)
  image_ids: Array<string> | null,       // 关联图片 ID 列表 (可选)
}
```

#### UpdateTask
更新任务请求体
```typescript
type UpdateTask = {
  title: string | null,                  // 任务标题 (可选)
  description: string | null,            // 任务描述 (可选)
  status: TaskStatus | null,             // 任务状态 (可选)
  parent_workspace_id: string | null,    // 父工作区 ID (可选)
  image_ids: Array<string> | null,       // 关联图片 ID 列表 (可选)
}
```

#### CreateAndStartTaskRequest
创建并启动任务请求体
```typescript
type CreateAndStartTaskRequest = {
  task: CreateTask,                      // 任务信息
  executor_profile_id: ExecutorProfileId, // 执行器配置 ID
  repos: Array<WorkspaceRepoInput>,      // 工作区仓库列表
}
```

#### WorkspaceRepoInput
工作区仓库输入
```typescript
type WorkspaceRepoInput = {
  repo_id: string,       // 仓库 ID
  target_branch: string, // 目标分支
}
```

---

### 仓库相关 (Repositories)

#### RegisterRepoRequest
注册仓库请求体
```typescript
type RegisterRepoRequest = {
  path: string,                // 仓库路径
  display_name: string | null, // 显示名称 (可选)
}
```

#### InitRepoRequest
初始化仓库请求体
```typescript
type InitRepoRequest = {
  parent_path: string,  // 父目录路径
  folder_name: string,  // 文件夹名称
}
```

#### UpdateRepo
更新仓库请求体
```typescript
type UpdateRepo = {
  display_name?: string | null,          // 显示名称
  setup_script?: string | null,          // 设置脚本
  cleanup_script?: string | null,        // 清理脚本
  archive_script?: string | null,        // 归档脚本
  copy_files?: string | null,            // 复制文件配置
  parallel_setup_script?: boolean | null, // 是否并行执行设置脚本
  dev_server_script?: string | null,     // 开发服务器脚本
  default_target_branch?: string | null, // 默认目标分支
  default_working_dir?: string | null,   // 默认工作目录
}
```

---

### 标签相关 (Tags)

#### CreateTag
创建标签请求体
```typescript
type CreateTag = {
  tag_name: string,  // 标签名称
  content: string,   // 标签内容
}
```

#### UpdateTag
更新标签请求体
```typescript
type UpdateTag = {
  tag_name: string | null,  // 标签名称 (可选)
  content: string | null,   // 标签内容 (可选)
}
```

---

### 会话相关 (Sessions)

#### CreateFollowUpAttempt
创建后续尝试请求体
```typescript
type CreateFollowUpAttempt = {
  prompt: string,                         // 提示内容
  executor_profile_id: ExecutorProfileId, // 执行器配置 ID
  retry_process_id: string | null,        // 重试进程 ID (可选)
  force_when_dirty: boolean | null,       // 脏状态时强制执行 (可选)
  perform_git_reset: boolean | null,      // 执行 git reset (可选)
}
```

---

### 任务尝试/工作区相关 (Task Attempts / Workspaces)

#### RebaseTaskAttemptRequest
变基任务尝试请求体
```typescript
type RebaseTaskAttemptRequest = {
  repo_id: string,                   // 仓库 ID
  old_base_branch: string | null,    // 旧基础分支 (可选)
  new_base_branch: string | null,    // 新基础分支 (可选)
}
```

#### ContinueRebaseRequest
继续变基请求体
```typescript
type ContinueRebaseRequest = {
  repo_id: string,  // 仓库 ID
}
```

#### AbortConflictsRequest
中止冲突请求体
```typescript
type AbortConflictsRequest = {
  repo_id: string,  // 仓库 ID
}
```

#### CreatePrApiRequest
创建 PR 请求体
```typescript
type CreatePrApiRequest = {
  title: string,                       // PR 标题
  body: string | null,                 // PR 描述 (可选)
  target_branch: string | null,        // 目标分支 (可选)
  draft: boolean | null,               // 是否为草稿 (可选)
  repo_id: string,                     // 仓库 ID
  auto_generate_description: boolean,  // 是否自动生成描述
}
```

#### MergeTaskAttemptRequest
合并任务尝试请求体
```typescript
type MergeTaskAttemptRequest = {
  repo_id: string,  // 仓库 ID
}
```

#### OpenEditorRequest
在编辑器中打开请求体
```typescript
type OpenEditorRequest = {
  editor_type: string | null,  // 编辑器类型 (可选)
  file_path: string | null,    // 文件路径 (可选)
}
```

---

### 暂存相关 (Scratch)

#### CreateScratch
创建暂存项请求体
```typescript
type CreateScratch = {
  payload: ScratchPayload,  // 暂存数据
}
```

#### UpdateScratch
更新暂存项请求体
```typescript
type UpdateScratch = {
  payload: ScratchPayload,  // 暂存数据
}
```

#### ScratchPayload
暂存数据联合类型
```typescript
type ScratchPayload =
  | { type: "DRAFT_TASK", data: string }
  | { type: "DRAFT_FOLLOW_UP", data: DraftFollowUpData }
  | { type: "DRAFT_WORKSPACE", data: DraftWorkspaceData }
  | { type: "PREVIEW_SETTINGS", data: PreviewSettingsData }
  | { type: "WORKSPACE_NOTES", data: WorkspaceNotesData }
  | { type: "UI_PREFERENCES", data: UiPreferencesData }
```

#### DraftFollowUpData
草稿后续数据
```typescript
type DraftFollowUpData = {
  message: string,                        // 消息内容
  executor_profile_id: ExecutorProfileId, // 执行器配置 ID
}
```

#### DraftWorkspaceData
草稿工作区数据
```typescript
type DraftWorkspaceData = {
  message: string,                              // 消息内容
  project_id: string | null,                    // 项目 ID (可选)
  repos: Array<DraftWorkspaceRepo>,             // 仓库列表
  selected_profile: ExecutorProfileId | null,   // 选中的配置 (可选)
  linked_issue: DraftWorkspaceLinkedIssue | null, // 关联的 Issue (可选)
}
```

#### DraftWorkspaceRepo
草稿工作区仓库
```typescript
type DraftWorkspaceRepo = {
  repo_id: string,       // 仓库 ID
  target_branch: string, // 目标分支
}
```

#### DraftWorkspaceLinkedIssue
草稿工作区关联 Issue
```typescript
type DraftWorkspaceLinkedIssue = {
  issue_id: string,          // Issue ID
  simple_id: string,         // 简单 ID
  title: string,             // 标题
  remote_project_id: string, // 远程项目 ID
}
```

#### PreviewSettingsData
预览设置数据
```typescript
type PreviewSettingsData = {
  url: string,                       // URL
  screen_size: string | null,        // 屏幕尺寸 (可选)
  responsive_width: number | null,   // 响应式宽度 (可选)
  responsive_height: number | null,  // 响应式高度 (可选)
}
```

#### WorkspaceNotesData
工作区笔记数据
```typescript
type WorkspaceNotesData = {
  content: string,  // 笔记内容
}
```

#### UiPreferencesData
UI 偏好设置数据
```typescript
type UiPreferencesData = {
  repo_actions: { [key: string]: string },              // 每个仓库的首选操作
  expanded: { [key: string]: boolean },                 // UI 区块展开/折叠状态
  context_bar_position: string | null,                  // 上下文栏位置
  pane_sizes: { [key: string]: JsonValue },             // 面板尺寸
  collapsed_paths: { [key: string]: Array<string> },    // 文件树中每个工作区的折叠路径
  is_left_sidebar_visible: boolean | null,              // 左侧边栏可见性
  is_right_sidebar_visible: boolean | null,             // 右侧边栏可见性
  is_terminal_visible: boolean | null,                  // 终端可见性
  workspace_panel_states: { [key: string]: WorkspacePanelStateData }, // 工作区面板状态
}
```

#### WorkspacePanelStateData
工作区面板状态数据
```typescript
type WorkspacePanelStateData = {
  right_main_panel_mode: string | null,    // 右侧主面板模式
  is_left_main_panel_visible: boolean,     // 左侧主面板是否可见
}
```

---

### 审批相关 (Approvals)

#### ApprovalResponse
审批响应请求体
```typescript
type ApprovalResponse = {
  execution_process_id: string,  // 执行进程 ID
  status: ApprovalStatus,        // 审批状态
}
```

#### ApprovalStatus
审批状态联合类型
```typescript
type ApprovalStatus =
  | { status: "pending" }
  | { status: "approved" }
  | { status: "denied", reason?: string }
  | { status: "timed_out" }
```

---

### 组织相关 (Organizations)

#### CreateOrganizationRequest
创建组织请求体
```typescript
type CreateOrganizationRequest = {
  name: string,  // 组织名称
  slug: string,  // 组织 slug (URL 友好标识)
}
```

#### UpdateOrganizationRequest
更新组织请求体
```typescript
type UpdateOrganizationRequest = {
  name: string,  // 组织名称
}
```

#### CreateInvitationRequest
创建邀请请求体
```typescript
type CreateInvitationRequest = {
  email: string,      // 被邀请人邮箱
  role: MemberRole,   // 成员角色 ("ADMIN" | "MEMBER")
}
```

#### RevokeInvitationRequest
撤销邀请请求体
```typescript
type RevokeInvitationRequest = {
  invitation_id: string,  // 邀请 ID
}
```

#### UpdateMemberRoleRequest
更新成员角色请求体
```typescript
type UpdateMemberRoleRequest = {
  role: MemberRole,  // 成员角色 ("ADMIN" | "MEMBER")
}
```

---

### 配置相关 (Config)

#### Config
配置对象
```typescript
type Config = {
  config_version: string,                    // 配置版本
  theme: ThemeMode,                          // 主题模式
  executor_profile: ExecutorProfileId,       // 执行器配置
  disclaimer_acknowledged: boolean,          // 免责声明已确认
  onboarding_acknowledged: boolean,          // 引导已确认
  notifications: NotificationConfig,         // 通知配置
  editor: EditorConfig,                      // 编辑器配置
  github: GitHubConfig,                      // GitHub 配置
  analytics_enabled: boolean,                // 分析已启用
  workspace_dir: string | null,              // 工作区目录
  last_app_version: string | null,           // 上次应用版本
  show_release_notes: boolean,               // 显示发布说明
  language: UiLanguage,                      // UI 语言
  git_branch_prefix: string,                 // Git 分支前缀
  showcases: ShowcaseState,                  // 展示状态
  pr_auto_description_enabled: boolean,      // PR 自动描述已启用
  pr_auto_description_prompt: string | null, // PR 自动描述提示
  beta_workspaces: boolean,                  // Beta 工作区
  beta_workspaces_invitation_sent: boolean,  // Beta 工作区邀请已发送
  commit_reminder_enabled: boolean,          // 提交提醒已启用
  commit_reminder_prompt: string | null,     // 提交提醒提示
  send_message_shortcut: SendMessageShortcut, // 发送消息快捷键
}
```

#### NotificationConfig
通知配置
```typescript
type NotificationConfig = {
  sound_enabled: boolean,  // 声音已启用
  push_enabled: boolean,   // 推送已启用
  sound_file: SoundFile,   // 声音文件
}
```

#### EditorConfig
编辑器配置
```typescript
type EditorConfig = {
  editor_type: EditorType,         // 编辑器类型
  custom_command: string | null,   // 自定义命令
  remote_ssh_host: string | null,  // 远程 SSH 主机
  remote_ssh_user: string | null,  // 远程 SSH 用户
}
```

#### GitHubConfig
GitHub 配置
```typescript
type GitHubConfig = {
  pat: string | null,              // 个人访问令牌
  oauth_token: string | null,      // OAuth 令牌
  username: string | null,         // 用户名
  primary_email: string | null,    // 主邮箱
  default_pr_base: string | null,  // 默认 PR 基础分支
}
```

---

### MCP 服务器相关

#### UpdateMcpServersBody
更新 MCP 服务器请求体
```typescript
type UpdateMcpServersBody = {
  servers: { [key: string]: JsonValue },  // 服务器配置映射
}
```

---

### 迁移相关 (Migration)

#### MigrationRequest
迁移请求体
```typescript
type MigrationRequest = {
  organization_id: string,        // 组织 ID
  project_ids: Array<string>,     // 要迁移的本地项目 ID 列表
}
```

---

### PR 相关

#### CreateWorkspaceFromPrBody
从 PR 创建工作区请求体
```typescript
type CreateWorkspaceFromPrBody = {
  repo_id: string,              // 仓库 ID
  pr_number: bigint,            // PR 编号
  pr_title: string,             // PR 标题
  pr_url: string,               // PR URL
  head_branch: string,          // 头分支
  base_branch: string,          // 基础分支
  run_setup: boolean,           // 是否运行设置
  remote_name: string | null,   // 远程名称 (可选)
}
```

#### AttachExistingPrRequest
附加现有 PR 请求体
```typescript
type AttachExistingPrRequest = {
  repo_id: string,  // 仓库 ID
}
```

---

### 执行器配置相关 (Executor Profiles)

#### ExecutorProfileId
执行器配置 ID
```typescript
type ExecutorProfileId = {
  executor: BaseCodingAgent,   // 执行器类型
  variant: string | null,      // 变体名称 (可选)
}
```

#### BaseCodingAgent
基础编码代理枚举
```typescript
enum BaseCodingAgent {
  CLAUDE_CODE = "CLAUDE_CODE",
  AMP = "AMP",
  GEMINI = "GEMINI",
  CODEX = "CODEX",
  OPENCODE = "OPENCODE",
  CURSOR_AGENT = "CURSOR_AGENT",
  QWEN_CODE = "QWEN_CODE",
  COPILOT = "COPILOT",
  DROID = "DROID"
}
```

---

### 其他枚举类型

#### TaskStatus
任务状态
```typescript
type TaskStatus = "todo" | "inprogress" | "inreview" | "done" | "cancelled"
```

#### ExecutionProcessStatus
执行进程状态
```typescript
enum ExecutionProcessStatus {
  running = "running",
  completed = "completed",
  failed = "failed",
  killed = "killed"
}
```

#### ThemeMode
主题模式
```typescript
enum ThemeMode {
  LIGHT = "LIGHT",
  DARK = "DARK",
  SYSTEM = "SYSTEM"
}
```

#### EditorType
编辑器类型
```typescript
enum EditorType {
  VS_CODE = "VS_CODE",
  VS_CODE_INSIDERS = "VS_CODE_INSIDERS",
  CURSOR = "CURSOR",
  WINDSURF = "WINDSURF",
  INTELLI_J = "INTELLI_J",
  ZED = "ZED",
  XCODE = "XCODE",
  GOOGLE_ANTIGRAVITY = "GOOGLE_ANTIGRAVITY",
  CUSTOM = "CUSTOM"
}
```

#### SoundFile
声音文件
```typescript
enum SoundFile {
  ABSTRACT_SOUND1 = "ABSTRACT_SOUND1",
  ABSTRACT_SOUND2 = "ABSTRACT_SOUND2",
  ABSTRACT_SOUND3 = "ABSTRACT_SOUND3",
  ABSTRACT_SOUND4 = "ABSTRACT_SOUND4",
  COW_MOOING = "COW_MOOING",
  PHONE_VIBRATION = "PHONE_VIBRATION",
  ROOSTER = "ROOSTER"
}
```

#### UiLanguage
UI 语言
```typescript
type UiLanguage = "BROWSER" | "EN" | "FR" | "JA" | "ES" | "KO" | "ZH_HANS" | "ZH_HANT"
```

#### SendMessageShortcut
发送消息快捷键
```typescript
type SendMessageShortcut = "ModifierEnter" | "Enter"
```

#### MemberRole
成员角色
```typescript
enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
}
```

#### InvitationStatus
邀请状态
```typescript
enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED"
}
```

#### SearchMode
搜索模式
```typescript
type SearchMode = "taskform" | "settings"
```

#### MergeStatus
合并状态
```typescript
type MergeStatus = "open" | "merged" | "closed" | "unknown"
```

#### ProviderKind
提供商类型
```typescript
type ProviderKind = "git_hub" | "azure_dev_ops" | "unknown"
```

#### ConflictOp
冲突操作类型
```typescript
type ConflictOp = "rebase" | "merge" | "cherry_pick" | "revert"
```

---

### 通用类型

#### JsonValue
JSON 值类型
```typescript
type JsonValue = number | string | boolean | Array<JsonValue> | { [key: string]: JsonValue } | null
```
