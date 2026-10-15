# TideMail 项目说明

## 项目结构

- 根目录是 pnpm workspace。`frontend/` 使用 Vite、React、TypeScript 和 Animal-Island-UI；`worker/src/` 实现 Cloudflare Worker、邮件处理与 D1 数据访问。
- `frontend/src/pages/Home.tsx` 是邮箱主界面；`frontend/src/services/api.ts` 只调用站点内部接口。Worker 路由位于 `worker/src/index.ts`，D1 schema 和迁移分别位于 `worker/src/database/` 与 `worker/drizzle/`。
- 产品核心是多域名邮箱创建、收件、查看、删除和发信。站点密码、Turnstile、人机验证、邮箱密码找回与发信授权属于保留功能。对外 API Key/API 产品和统计功能已移除。

## 常用命令

- 安装依赖：`pnpm install --frozen-lockfile`
- 本地 Worker：复制 `wrangler.toml` 为被 `.gitignore` 忽略的 `wrangler.local.toml`，填写本地 D1 与非敏感变量，并把 secret 放在 `.env`；然后运行 `pnpm dev`
- 单独运行前端：`pnpm frontend:dev`（内部 `/api` 请求代理到 `127.0.0.1:8787`）
- 单元测试：`pnpm test:unit`
- 通用覆盖率门槛（行、分支、函数均至少 80%）：`pnpm test:coverage`
- 核心模块覆盖率门槛（行、分支、函数均为 100%）：`pnpm test:core-coverage`
- E2E：`pnpm test:e2e`（首次使用先运行 `pnpm exec playwright install chromium`）
- 全部测试与覆盖率门槛：`pnpm test`
- 类型检查：`pnpm typecheck`
- 生产构建：`pnpm build`
- Worker 打包检查：`pnpm exec wrangler deploy --dry-run`

覆盖率统计针对 `worker/src/{database/dao,database/db,database/schema,email,retention,sender,utils}.ts` 与 `frontend/src/services/api.ts`。这些文件承载邮件收发、授权、保留清理、D1 持久化和页面 API 交互。E2E 使用 Playwright 浏览器并 mock 内部 Worker API，验证站点密码、多域名邮箱创建、收件查看/删除、发信请求和主题/语言选择；它不代替真实 Cloudflare/D1/邮件服务验收。

## 前端约定

- `animal-island-ui/style` 只在 `frontend/src/main.tsx` 引入一次；图标从 `naive-icons` 导入。
- 设计 token 和组件约定见根目录 `DESIGN.md`。浅色、深色和系统默认主题由 `frontend/src/hooks/useTheme.tsx` 管理，默认跟随系统。
- 用户可见文案使用 `react-i18next`。只维护 `frontend/public/locales/en/common.json` 和 `frontend/public/locales/zh/common.json`。
- 保持多域名创建、收件箱操作、邮箱密码找回、有效期重置、Turnstile 和发信流程。

## 数据和安全边界

- Worker 每小时清理创建时间早于 7 天的邮件；发送限流窗口记录保留 24 小时。邮箱地址保存在用户浏览器 cookie，D1 保存邮件内容和必要元数据。
- `worker/drizzle/0004_simplify_product.sql` 是改版后的部署迁移，会清空已有邮件，并删除 API/统计旧表；不要直接操作远端 D1，除非任务明确要求。
- 不在前端或 `wrangler.toml` 中加入服务端密钥；密钥通过 Wrangler secret 配置。不要把邮件内容或授权 token 写入日志。
- 保留邮箱发信的 bearer token 校验、配置域名校验、站点密码和 Turnstile 验证。
- 邮件 HTML 必须放在带 `sandbox` 的 iframe 中。修改 iframe 权限前先核实安全影响。

## 交付检查

- 修改 Worker 或前端后运行相关单元测试、覆盖率门槛、E2E、`pnpm typecheck` 和 `pnpm build`。
- Worker 配置或路由改变时运行 `pnpm exec wrangler deploy --dry-run`。
- 最后检查 `git diff --check` 与 `git status --short`，只处理当前任务涉及的文件，不覆盖其他工作区改动。
