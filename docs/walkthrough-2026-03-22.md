# Walkthrough - 2026-03-22

## 一、接口统一 POST 改造

### 背景
`AppController` 的 `@Get('*')` 通配路由与 API GET 接口冲突，导致 `/api/mail-account/list` 等请求返回 304。

### 解决方案
将所有 API 接口统一改为 POST 类型，彻底避免与 SSR 页面路由 `@Get('*')` 的冲突。

### 变更文件

**后端 Controllers（5 个）**：

| 模块 | 旧路由 | 新路由 |
|------|--------|--------|
| user | `GET /resolver` | `POST /resolver` |
| mail-account | `GET /list`, `POST /`, `PUT /:keyId`, `DELETE /:keyId` | `POST /list`, `POST /create`, `POST /update`, `POST /delete` |
| mail-message | `GET /list`, `PUT /seen/:keyId` | `POST /list`, `POST /seen` |
| mail-draft | `GET /list`, `POST /`, `DELETE /:keyId` | `POST /list`, `POST /save`, `POST /delete` |
| mail-blacklist | `GET /list`, `POST /`, `DELETE /:keyId` | `POST /list`, `POST /add`, `POST /delete` |

**前端 API Services（5 个）**：
- 所有 `method: 'GET'` / `'PUT'` / `'DELETE'` → `'POST'`
- `params` → `data`，路径参数移入 body

---

## 二、后端接口实现 & 前端对接

### 1. Dashboard 后端模块（新增）

| 文件 | 说明 |
|------|------|
| `server/modules/dashboard/dashboard.module.ts` | 模块注册 |
| `server/modules/dashboard/dashboard.service.ts` | 3 个聚合查询方法 |
| `server/modules/dashboard/dashboard.controller.ts` | 3 个 POST 端点 |

**API 端点**：
- `POST /api/dashboard/stats` — 统计卡片（总邮件/未读/今日发送/附件）
- `POST /api/dashboard/trend` — 7 天收发趋势
- `POST /api/dashboard/distribution` — 邮箱分布饼图

### 2. 前端 API 服务（新增）

- `web/api/modules/web-dashboard.service.ts` — 3 个 API 函数
- `web/api/index.ts` — 新增导出

### 3. 前端 9 个页面（faker mock → 真实 API）

| 页面 | API 调用 |
|------|----------|
| `manager-stat-cards.vue` | `dashboard/stats` |
| `manager-chart-area.vue` | `dashboard/trend` + `distribution` |
| `manager-recent-mails.vue` | `mail-message/list` (6条) |
| `manager-inbox.vue` | `mail-message/list` + `seen` + 分页 |
| `manager-sent.vue` | `mail-message/list` (Sent) + 分页 |
| `manager-drafts.vue` | `mail-draft/list` + `delete` |
| `manager-compose.vue` | `mail-account/list` + `send` + `save` |
| `manager-accounts.vue` | `mail-account` CRUD（添加/删除） |
| `manager-blacklist.vue` | `mail-blacklist` CRUD（添加/移除） |

### 4. 后端注册

- `server/app.module.ts` — 添加 `DashboardModule` 到 imports

## 验证结果

- ✅ TypeScript 编译 **0 错误**
- ✅ NestJS 服务启动成功（5600 端口）
- ✅ 端口已关闭
