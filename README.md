<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Mail Server - 邮件聚合管理平台

> 统一管理多个邮箱账号的 Web 端邮件平台，基于 NestJS + Vue 3 SSR 构建。

## 项目简介

Mail Server 是一个面向职场人士和自由职业者的邮件聚合平台，解决多邮箱管理痛点：

- **统一入口** — 一个平台管理所有邮箱（QQ、163、Outlook、Gmail）
- **简单授权** — OAuth2 或应用专用密码快速接入
- **实时同步** — 邮件收发实时同步，不遗漏重要信息
- **跨平台访问** — 浏览器即可使用，无需安装客户端

## 技术栈

| 层面      | 技术            |
| --------- | --------------- |
| 后端框架  | NestJS 10       |
| 前端框架  | Vue 3 (TSX)     |
| SSR 引擎  | Vite 4          |
| 数据库    | MySQL (TypeORM) |
| 缓存      | Redis           |
| UI 组件库 | Naive UI        |
| 状态管理  | Pinia           |
| CSS 方案  | UnoCSS + SCSS   |
| API 文档  | Swagger         |
| 日志      | Winston         |
| 进程管理  | PM2             |

## 功能规划

### 第一阶段（MVP）

- [x] 用户注册 / 登录
- [x] 添加邮箱账号（QQ 邮箱优先）
- [x] 收件箱查看
- [x] 发送邮件
- [x] 邮件列表与详情

### 第二阶段

- [ ] 支持全部目标邮箱平台（163、Outlook、Gmail）
- [ ] 多账号管理与切换
- [ ] 邮件搜索
- [ ] 附件处理
- [ ] 自动同步

### 第三阶段

- [ ] 邮件过滤规则
- [ ] 联系人管理
- [ ] 高级搜索与标签系统
- [ ] 移动端适配优化

## 支持的邮箱平台

| 平台     | IMAP 服务器                     | SMTP 服务器                          | 授权方式 |
| -------- | ------------------------------- | ------------------------------------ | -------- |
| QQ 邮箱  | imap.qq.com:993 (SSL)           | smtp.qq.com:465 (SSL)                | 授权码   |
| 网易 163 | imap.163.com:993 (SSL)          | smtp.163.com:465 (SSL)               | 授权码   |
| Outlook  | outlook.office365.com:993 (SSL) | smtp-mail.outlook.com:587 (STARTTLS) | OAuth2   |
| Gmail    | imap.gmail.com:993 (SSL)        | smtp.gmail.com:587 (TLS)             | OAuth2   |

## 项目结构

```
├── server/                  # 后端 NestJS
│   ├── main.ts              # 应用入口
│   ├── app.module.ts        # 根模块
│   ├── vite.server.ts       # SSR 渲染引擎
│   ├── modules/
│   │   ├── config/          # 环境变量配置
│   │   ├── logger/          # 日志模块
│   │   ├── database/        # 数据库模块
│   │   └── web/             # SSR 路由控制器
│   ├── decorator/           # 自定义装饰器
│   ├── filters/             # 异常过滤器
│   ├── interceptor/         # 响应拦截器
│   ├── middleware/          # 中间件
│   └── utils/               # 工具函数
├── web/                     # 前端 Vue 3
│   ├── entry-server.ts      # SSR 服务端入口
│   ├── entry-client.ts      # 客户端入口
│   ├── router/              # 路由配置
│   ├── store/               # Pinia 状态管理
│   ├── hooks/               # 组合式函数
│   ├── views/               # 页面视图
│   ├── components/          # 公共组件
│   └── styles/              # 全局样式
├── env/                     # 环境变量
└── ecosystem.config.js      # PM2 部署配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- Redis >= 6.0
- Yarn

### 安装

```bash
yarn install
```

### 配置环境变量

复制 `env/.env.example` 为 `env/.env.development`（开发）或 `env/.env.production`（生产），修改相应配置：

```env
NODE_PORT=3000
ORM_HOST=localhost
ORM_PORT=3306
ORM_USERNAME=your_username
ORM_PASSWORD=your_password
ORM_DATABASE=your_database
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

### 开发模式

```bash
yarn dev
```

启动后访问：

- 应用：http://localhost:3000
- API 文档：http://localhost:3000/api/swagger

### 生产构建与部署

```bash
# 构建后端
yarn build

# 构建前端 SSR
yarn build:web

# 直接启动
yarn start

# PM2 集群部署（3 实例）
yarn pm2
```

## 架构说明

- **SSR 渲染**：NestJS 通配符路由捕获前端请求，Vite SSR 引擎完成服务端渲染
- **开发模式**：Vite Dev Server 中间件提供 HMR 热更新
- **生产模式**：预构建静态资源直接读取渲染
- **数据预取**：组件定义 `httpServer` / `httpMetaServer` 钩子，服务端渲染前预取数据

## License

[MIT](https://opensource.org/licenses/MIT)
