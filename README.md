# tidemail

tidemail 是一个轻量的临时邮箱服务，基于 Cloudflare Workers 和 D1。它支持从配置的域名创建临时邮箱、接收和查看邮件，也可以按需启用发信。

[English](README_en.md) · [Cloudflare 部署教程](docs/github-action-tutorial.md)

## 功能

- 从一个或多个配置域名创建临时邮箱地址
- 通过 Cloudflare Email Routing 接收邮件，并在网页端查看或删除
- 按需启用邮件发送、站点密码和 Cloudflare Turnstile
- 支持简体中文、英语，以及浅色、深色和跟随系统的主题
- 邮件在 D1 中保留 7 天，由每小时运行的任务清理

## 部署到 Cloudflare

项目使用 Cloudflare Worker 同时提供前端静态资源和邮件接口，邮件数据保存在 Cloudflare D1。仓库已配置 GitHub Actions：向 `main` 推送会先运行测试和构建，再应用 D1 迁移并部署 Worker。

从 [Cloudflare 部署教程](docs/github-action-tutorial.md) 开始，按步骤创建 D1、配置 GitHub Actions Secrets 和邮箱路由。首次部署的迁移 `0004_simplify_product.sql` 会清空现有邮件，并删除已停用 API 产品和统计功能留下的旧表。

Cloudflare Worker 的技术资源名为 `tidemail`。部署后请把 Email Routing 和已有的自定义域名路由切换到新 Worker，验证收件正常后再删除旧的 `vmail` Worker。

## 本地开发

需要 Node.js 22.8 或更新版本，以及 pnpm。

```bash
pnpm install --frozen-lockfile
cp .env.example .env
cp wrangler.toml wrangler.local.toml
```

在 `wrangler.local.toml` 中填写本地 D1 名称和 ID、邮箱域名等非敏感配置；在 `.env` 中填写 Cookie、Turnstile、站点密码和发信渠道密钥等本地 secret。`wrangler.local.toml` 已加入 `.gitignore`，不会覆盖部署模板。启动 Worker：

```bash
pnpm dev
```

另开终端启动前端开发服务器：

```bash
pnpm frontend:dev
```

前端 `/api` 请求会代理到本地 Worker `127.0.0.1:8787`。

## 验证

```bash
pnpm test:unit
pnpm test:coverage
pnpm test:core-coverage
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm exec wrangler deploy --dry-run
```

`pnpm test` 会运行覆盖率门槛和 Playwright E2E；首次运行 E2E 前执行 `pnpm exec playwright install chromium`。E2E 使用模拟的 Worker API，不代表真实 Cloudflare、D1 或邮件服务验收。

## 许可证

[GNU General Public License v3.0](LICENSE)
