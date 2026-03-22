---
description: how to start and stop the dev server for verification
---

## 启动开发服务器验证

1. 启动服务：`cd f:/GitHub/nest-mail-customer && yarn dev 2>&1`
2. 等待输出 `Found 0 errors` 和 `Starting Nest application` 确认编译通过
3. 验证完毕后**必须立即关闭**进程：
   - 查找 PID：`netstat -ano | findstr :5600`
   - 终止进程：`taskkill //F //PID <PID>`

> ⚠️ **重要**：验证完成后不得留下后台运行的 dev server 进程，避免端口占用。
