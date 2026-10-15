# TideMail 项目说明

## 项目结构

- 根目录使用 pnpm workspace；`frontend/` 是 Vite、React 和 TypeScript 前端，`worker/src/` 是 Cloudflare Worker API 与邮件处理逻辑。
- `worker/drizzle/` 保存 D1 schema 和迁移；`wrangler.toml` 绑定 D1、邮件发送能力和前端构建产物 `frontend/build/client`。
- 前端 API 文档和首页路由分别位于 `frontend/src/pages/ApiDocs.tsx` 与 `frontend/src/pages/Home.tsx`；共享 UI 和 API 客户端分别位于 `frontend/src/components/` 与 `frontend/src/services/`。

## 常用命令

- 安装依赖：`pnpm install`
- 本地 Worker：`pnpm dev`
- 单独运行前端：`pnpm frontend:dev`（API 请求代理到本地 Worker 的 `127.0.0.1:8787`）
- 前端类型检查：`pnpm typecheck`
- Worker 测试：`pnpm test`
- 前端生产构建：`pnpm build`

## 前端约定

- 使用 `animal-island-ui` 的组件和设计变量；`animal-island-ui/style` 只在 `frontend/src/main.tsx` 引入一次。图标统一从 `naive-icons` 导入。
- 设计规则和已落地 token 见根目录 `DESIGN.md`；新增样式沿用暖白、浅木色、棕色文字和岛屿青绿，不重新引入暗色主题或第二套组件库。
- 用户可见文案使用 `react-i18next`。翻译键需同步维护 `frontend/public/locales/*/common.json` 中的 12 个语言版本。
- 保持首页现有邮箱创建、密码找回、Turnstile、收件箱操作、有效期重置和发信流程，以及 API Key 创建和复制能力。

## 安全与行为边界

- 不在前端或 `wrangler.toml` 中加入服务端密钥；需要的密钥通过 Wrangler secret 配置。
- 保留邮箱发信的 bearer token 授权和 Worker 侧验证；不要把邮件内容或 API Key 写入日志。
- 邮件 HTML 在带 `sandbox` 的 iframe 中显示。修改沙箱权限前先确认必要功能与安全影响。
- Turnstile、API Key 创建开关和邮箱授权错误处理属于产品行为，不因视觉重构而绕过。

## 验证

- 改动前后端逻辑时运行 `pnpm test`；修改前端时运行 `pnpm typecheck` 和 `pnpm build`。
- 提交前检查 `git diff --check` 与 `git status --short`，只处理当前任务涉及的文件，不覆盖其他工作区改动。
