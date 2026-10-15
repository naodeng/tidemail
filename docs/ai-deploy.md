# tidemail 部署指南

本文面向协助部署 tidemail 的 AI 助手。项目运行在 Cloudflare Workers 和 D1，产品主流程是创建多域名邮箱、接收/查看/删除邮件，以及可选发信。仓库不再提供对外 API Key 产品。

## 部署前准备

- Cloudflare 账户和一个已托管到 Cloudflare 的邮箱域名。
- 使用名为 `tidemail` 的 D1 数据库，并准备 `D1_DATABASE_NAME=tidemail`、对应的 `D1_DATABASE_ID`、`CF_ACCOUNT_ID` 和 `CF_API_TOKEN`。
- Wrangler Worker 资源名为 `tidemail`；如果将已有的 `vmail` Worker 迁移过来，先切换 Email Routing 和自定义域名路由并验证，再删除旧 Worker。
- 账户已启用 Cloudflare Email Routing，并可将 catch-all 邮件转发给 Worker。

## 配置

部署工作流从 GitHub Actions Secrets 读取配置：

- 必需：`CF_ACCOUNT_ID`、`CF_API_TOKEN`、`D1_DATABASE_NAME`、`D1_DATABASE_ID`、`EMAIL_DOMAIN`、`COOKIES_SECRET`。
- 可选：`PASSWORD` 控制站点密码；`TURNSTILE_KEY` 与 `TURNSTILE_SECRET` 同时设置后启用人机验证。
- 可选发信：`SEND_CHANNEL`、`SENDER_EMAIL`、`MAILBOX_TOKEN_SECRET`，以及对应服务商的 `RESEND_API_KEY` 或 `MAILCHANNELS_API_KEY`。`SEND_CHANNEL=cloudflare` 使用原生 `SEND_EMAIL` 绑定。
- 可选限流：`SEND_RATE_LIMIT_PER_MINUTE` 默认为每邮箱每分钟 3 封；`SEND_IP_RATE_LIMIT_PER_MINUTE` 默认为每 IP 每分钟 10 封。

服务端密钥通过 Wrangler secret 配置，不要写入前端环境变量或提交到仓库。

## 数据库迁移

迁移文件位于 `worker/drizzle/`，部署工作流会先对远端 D1 应用迁移，再部署 Worker。`0004_simplify_product.sql` 是改版的首次部署迁移：它会删除现存邮件记录、移除已废弃的 API/统计表，并保留邮件表和发信限流表。该数据清理是预期行为；不要在没有用户明确要求时手动对远端数据库执行迁移。

邮件保留期为 7 天，Worker 的每小时计划任务会删除超期邮件；发信限流记录在 24 小时后清理。站点不会把邮箱地址持久化到 D1。

## 本地检查

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm exec wrangler deploy --dry-run
```

`pnpm test` 会运行单元测试、至少 80% 的通用覆盖率门槛、核心模块 100% 覆盖率门槛和 Playwright E2E。浏览器尚未安装时运行 `pnpm exec playwright install chromium`。

## 部署后检查

1. 打开站点，确认域名选择器显示 `EMAIL_DOMAIN` 中配置的域名。
2. 创建临时邮箱，检查收件箱能加载并显示邮件。
3. 验证邮件查看、删除、密码找回和站点密码行为。
4. 配置了发信时，检查邮箱 token 授权、发信限流和服务商投递。
5. 在 Cloudflare 中确认 D1 迁移和 Email Routing 绑定状态。

前端 `/api/*` 是站点自己的内部接口，用于页面功能，不是兼容承诺的公开 API。
