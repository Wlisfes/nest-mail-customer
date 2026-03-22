# 邮件客户端开发文档

> 本文档记录 Mail Server 邮件聚合管理平台的邮件客户端功能实施过程，包含数据库设计、API 接口、前端页面架构等完整技术细节。

---

## 1. 功能概述

### 1.1 新增功能模块

| 模块 | 说明 |
|------|------|
| 📥 收件箱 | 按邮箱账号/文件夹查看收件，支持已读/未读标记、附件标识、分页 |
| 📤 已发送 | 查看已发送邮件记录 |
| 📝 草稿箱 | 保存/编辑/删除邮件草稿 |
| ✉ 写邮件 | 选择发件账号、输入收件人/主题/正文、发送或存为草稿 |
| 👤 邮箱账号管理 | 多邮箱绑定（QQ/163/Outlook/Gmail）、自动填充 IMAP/SMTP 配置 |
| 🚫 黑名单 | 屏蔽指定邮箱地址，支持添加原因 |
| ⚙ 平台配置 | 查看支持平台的服务器配置参考、设置同步频率 |
| 📊 仪表盘 | 统计概览（ECharts 图表）、快捷操作、最近邮件 |

### 1.2 技术选型

| 技术 | 用途 |
|------|------|
| TypeORM Entity | 数据库表结构定义 |
| NestJS Module/Service/Controller | 后端业务逻辑 |
| class-validator + class-transformer | DTO 参数校验 |
| Swagger (PickType/IntersectionType) | API 文档自动生成 |
| Naive UI (n-data-table/n-modal/n-menu) | 前端 UI 组件 |
| ECharts | 统计图表 |
| @faker-js/faker | 前端 Mock 数据 |

---

## 2. 数据库设计

### 2.1 表结构总览

```
tb_user                 用户表（已有）
tb_mail_account         邮箱账号表（已有）
tb_mail_message         邮件缓存表（已有）
tb_mail_draft           草稿箱表（新增）
tb_mail_blacklist       黑名单表（新增）
```

### 2.2 新增表：tb_mail_draft（草稿箱）

| 字段 | 类型 | 说明 |
|------|------|------|
| key_id | int (PK) | 主键 |
| account_id | int | 关联邮箱账号 keyId |
| to_address | varchar(512) | 收件人地址 |
| subject | varchar(512) | 邮件主题 |
| content | text | 邮件正文 HTML |
| attachments | text | 附件信息 JSON |
| create_time | datetime | 创建时间 |
| modify_time | datetime | 更新时间 |

**源文件**：`server/modules/database/schema/tb_mail_draft.ts`

### 2.3 新增表：tb_mail_blacklist（黑名单）

| 字段 | 类型 | 说明 |
|------|------|------|
| key_id | int (PK) | 主键 |
| user_id | int | 关联用户 keyId |
| email | varchar(128) | 拉黑邮箱地址 |
| reason | varchar(255) | 拉黑原因（可选） |
| create_time | datetime | 创建时间 |
| modify_time | datetime | 更新时间 |

**源文件**：`server/modules/database/schema/tb_mail_blacklist.ts`

### 2.4 已有表说明

#### tb_mail_account（邮箱账号表）

用于存储用户绑定的邮箱账号信息，包含 IMAP/SMTP 服务器配置。

| 字段 | 说明 |
|------|------|
| user_id | 关联用户 |
| email | 邮箱地址 |
| provider | 邮箱平台（qq/163/outlook/gmail） |
| imap_host / imap_port | IMAP 服务器配置 |
| smtp_host / smtp_port | SMTP 服务器配置 |
| auth_code | 授权码 |
| status | 状态（0=正常，1=连接失败） |

#### tb_mail_message（邮件缓存表）

| 字段 | 说明 |
|------|------|
| account_id | 关联邮箱账号 |
| message_id | 邮件 Message-ID |
| uid | IMAP UID |
| folder | 邮件文件夹（INBOX/Sent 等） |
| subject / from_address / to_address | 邮件头信息 |
| date / seen / has_attachment / snippet | 元数据 |

---

## 3. API 接口设计

Swagger 文档地址：`http://localhost:5600/api/swagger`

### 3.1 邮箱账号 `/api/mail-account`

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| POST | `/` | 添加邮箱 | `{ email, provider, authCode }` |
| GET | `/list` | 获取邮箱列表 | — |
| PUT | `/:keyId` | 更新邮箱 | `{ authCode }` |
| DELETE | `/:keyId` | 删除邮箱 | — |

> **注意**：添加邮箱时根据 `provider` 自动填充 IMAP/SMTP 配置，无需手动输入服务器地址。

**平台配置映射**（`server/modules/database/enums/enum.mail.ts`）：

| Provider | IMAP 服务器 | SMTP 服务器 |
|----------|-------------|-------------|
| `qq` | imap.qq.com:993 (SSL) | smtp.qq.com:465 (SSL) |
| `163` | imap.163.com:993 (SSL) | smtp.163.com:465 (SSL) |
| `outlook` | outlook.office365.com:993 (SSL) | smtp-mail.outlook.com:587 (STARTTLS) |
| `gmail` | imap.gmail.com:993 (SSL) | smtp.gmail.com:587 (TLS) |

### 3.2 邮件消息 `/api/mail-message`

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/list` | 邮件列表 | `?folder=INBOX&accountId=1&page=1&size=20` |
| POST | `/send` | 发送邮件 | `{ accountId, to, subject, html }` |
| PUT | `/seen/:keyId` | 标记已读 | — |

### 3.3 草稿箱 `/api/mail-draft`

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| POST | `/` | 保存草稿 | `{ accountId, toAddress, subject, content }` |
| GET | `/list` | 草稿列表 | — |
| DELETE | `/:keyId` | 删除草稿 | — |

### 3.4 黑名单 `/api/mail-blacklist`

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| POST | `/` | 添加黑名单 | `{ email, reason? }` |
| GET | `/list` | 黑名单列表 | — |
| DELETE | `/:keyId` | 移除黑名单 | — |

---

## 4. 前端架构

### 4.1 路由结构

```
/                         → 重定向到 /manager
├── /manager              → 仪表盘 Dashboard
├── /manager/inbox        → 收件箱
├── /manager/sent         → 已发送
├── /manager/drafts       → 草稿箱
├── /manager/compose      → 写邮件
├── /manager/accounts     → 邮箱账号管理
├── /manager/blacklist    → 黑名单管理
├── /manager/settings     → 平台配置
├── /web/client           → 首页（公开）
├── /main/login           → 登录
└── /main/register        → 注册
```

所有 `/manager/*` 路由均配置 `meta: { AUTH: 'AUTH' }`，需登录后访问。

### 4.2 布局设计

```
┌──────────────────────────────────────────────────┐
│  n-layout (has-sider)                            │
├────────────┬─────────────────────────────────────┤
│            │  Header (52px)                      │
│  Sider     │  ┌─────────────────────────────────┤
│  (220px)   │  │                                 │
│            │  │  <router-view />                │
│  n-menu    │  │  (页面内容区)                    │
│  导航菜单   │  │                                 │
│            │  │                                 │
│  可折叠     │  │                                 │
│  64px      │  │                                 │
├────────────┴──┴─────────────────────────────────┤
```

侧边栏支持：
- 折叠/展开（`show-trigger="bar"`）
- 暗色模式反转（`inverted`）
- 分隔线区分核心功能与管理功能

### 4.3 文件结构

```
web/views/manager/
├── index.vue                          # 旧入口（已不再被路由引用）
├── manager.scss                       # 公共样式
├── components/                        # Dashboard 子组件
│   ├── manager-stat-cards.vue         # 统计卡片
│   ├── manager-chart-area.vue         # ECharts 图表
│   ├── manager-quick-actions.vue      # 快捷操作
│   └── manager-recent-mails.vue       # 最近邮件
└── pages/                             # 路由页面
    ├── manager-dashboard.vue          # 仪表盘
    ├── manager-inbox.vue              # 收件箱
    ├── manager-sent.vue               # 已发送
    ├── manager-drafts.vue             # 草稿箱
    ├── manager-compose.vue            # 写邮件
    ├── manager-accounts.vue           # 邮箱账号管理
    ├── manager-blacklist.vue          # 黑名单
    └── manager-settings.vue           # 平台配置
```

### 4.4 前端 API 服务

```
web/api/modules/
├── web-user.service.ts                # 用户（已有）
├── web-mail-account.service.ts        # 邮箱账号 CRUD
├── web-mail-message.service.ts        # 邮件列表/发送/标记已读
├── web-mail-draft.service.ts          # 草稿保存/列表/删除
└── web-mail-blacklist.service.ts      # 黑名单增删查
```

---

## 5. 后端模块结构

```
server/modules/
├── mail/                   # 邮件发送基础模块（已有，Nodemailer SMTP）
├── mail-account/           # 邮箱账号管理（新增）
│   ├── mail-account.module.ts
│   ├── mail-account.service.ts
│   └── mail-account.controller.ts
├── mail-message/           # 邮件消息管理（新增）
│   ├── mail-message.module.ts
│   ├── mail-message.service.ts
│   └── mail-message.controller.ts
├── mail-draft/             # 草稿管理（新增）
│   ├── mail-draft.module.ts
│   ├── mail-draft.service.ts
│   └── mail-draft.controller.ts
└── mail-blacklist/         # 黑名单管理（新增）
    ├── mail-blacklist.module.ts
    ├── mail-blacklist.service.ts
    └── mail-blacklist.controller.ts
```

所有模块已在 `app.module.ts` 中注册。

---

## 6. 开发约定

### 6.1 后端编码规范

- **Service** 继承 `Logger` 基类，使用 `@AutoDescriptor` 装饰器
- **Controller** 使用 `@ApifoxController` + `@ApiServiceDecorator` 装饰器
- 事务操作使用 `database.transaction()` + `try/commit/catch/rollback/finally/release`
- 错误统一抛出 `HttpException`

### 6.2 前端编码规范

- 页面组件使用 `defineComponent` + TSX 语法
- 状态管理使用 `useState` hook（来自 `@/hooks`）
- UI 组件使用 Naive UI（`n-card`, `n-data-table`, `n-modal`, `n-form` 等）
- CSS 使用 UnoCSS 工具类 + scoped SCSS

### 6.3 Mock 数据说明

当前前端页面使用 `@faker-js/faker` 生成模拟数据，后续接入真实 API 时需要：

1. 替换 `useState` 中的静态数据为 API 调用
2. 在 `onMounted` 或 `httpServer` 中发起请求
3. 使用 `setState` 更新列表数据

---

## 7. 部署注意事项

### 7.1 数据库迁移

开发环境 TypeORM 配置了 `synchronize: true`（自动建表），生产环境需要：

```sql
-- 草稿箱表
CREATE TABLE `tb_mail_draft` (
  `key_id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL COMMENT '关联邮箱账号keyId',
  `to_address` varchar(512) DEFAULT NULL COMMENT '收件人地址',
  `subject` varchar(512) DEFAULT NULL COMMENT '邮件主题',
  `content` text COMMENT '邮件正文',
  `attachments` text COMMENT '附件信息JSON',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `modify_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`key_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='草稿箱表';

-- 黑名单表
CREATE TABLE `tb_mail_blacklist` (
  `key_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '关联用户keyId',
  `email` varchar(128) NOT NULL COMMENT '拉黑邮箱地址',
  `reason` varchar(255) DEFAULT NULL COMMENT '拉黑原因',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `modify_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`key_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='黑名单表';
```

### 7.2 新增依赖

```bash
yarn add echarts vue-echarts
```

---

## 8. 后续扩展方向

- [ ] 前端页面对接真实 API（替换 faker 数据）
- [ ] IMAP 收件同步服务（定时任务 + ImapFlow）
- [ ] 邮件详情页面（HTML 正文渲染）
- [ ] 附件上传/下载
- [ ] 邮件搜索（全文检索）
- [ ] 联系人管理
- [ ] 邮件过滤规则
- [ ] 移动端响应式优化
