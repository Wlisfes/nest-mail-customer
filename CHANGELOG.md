# 📋 开发日志 (Changelog)

> 根据 Git 提交记录按天生成，记录 nest-mail-customer 项目的开发历程。

---

## 2026-03-24（周二）

- ✨ **feat(server)**: 新增定时任务

---

## 2026-03-23（周日）

- ✨ **feat**: enhance email manager UI and functionality
- ✨ **feat**: 添加邮箱同步功能及相关接口，完善授权验证

---

## 2026-03-22（周六）

- ✨ **feat**: refactor email management components to use real API data
- ✨ **feat(docs)**: 添加开发服务器启动和关闭的验证说明
- ✨ **feat(global)**: 完善基本框架
- ✨ **feat(base)**: 完善基本框架
- ✨ **feat(database)**: 添加邮件相关的数据库模型和枚举，更新数据库导出
- ✨ **feat(context)**: 添加 ssr 参数到 AppOptions 接口，移除 useCoutext 中的调试日志
- ✨ **feat(layout)**: 优化输入框样式，调整前后缀位置和内边距

---

## 2026-03-20（周四）

- ✨ **feat(context)**: 更新 useCoutext 函数的默认选项，添加 path 属性以优化 cookie 设置

---

## 2026-03-18（周二）

- ✨ **feat(mail)**: 添加发送注册验证码功能，整合 Redis 与邮件服务，更新相关接口和模板
- ✨ **feat(api)**: 重构用户服务，合并用户相关 API 到新模块，更新相关组件引用
- ✨ **feat(context)**: 优化 useCoutext 函数，直接从全局属性获取 ctx，简化代码逻辑
- ✨ **feat(httpServer)**: 添加 httpServer 执行标记，优化 SSR 中子组件的 httpServer 调用
- ✨ **feat(router)**: 添加路由守卫以处理认证逻辑，确保用户访问权限
- ✨ **feat**: 统一更改 "MailServer" 为 "Mail Server"，更新相关文档和模板
- ✨ **feat(database)**: 添加数据库接口和服务，支持事务处理和数据模型创建
- ✨ **feat(user)**: 更新用户服务，重构用户注册和登录逻辑，添加用户信息获取功能
- ✨ **feat(middleware)**: 重构中间件模块，添加用户代理和日志中间件
- ✨ **feat(interface)**: 添加 Swagger 用户 DTO，优化接口导出
- ✨ **feat(jwt)**: 添加 JWT 模块及相关服务，支持用户注册和登录功能

---

## 2026-03-17（周一）

- ✨ **feat(redis)**: 添加 Redis 模块及相关服务，支持基本的存储、读取和删除操作
- ✨ **feat(mail)**: 添加邮件模块及相关配置，支持 SMTP 发送功能
- ✨ **feat(env)**: 更新 SEO 配置为 MailServer 邮件聚合管理平台
- ✨ **feat(README)**: 优化文案
- ✨ **feat(layout)**: 修改标题为 "MailServer"
- ✨ **feat(global)**: 优化站点文案
- ✨ **feat(server)**: 新增 user 模块

---

## 2026-03-16（周日）— 项目启动

- ✨ **feat(router)**: 聚合登录页面
- ✨ **feat(layout)**: 优化基础配置组件
- ✨ **feat**: add new SVG icons and refactor global layout components
- ✨ **feat(layout)**: 修改布局框架
- ✨ **feat(Global)**: 初始化项目
