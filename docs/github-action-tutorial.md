# Cloudflare 部署教程

TideMail 使用 Cloudflare Workers、D1 和 Email Routing。仓库内的 GitHub Actions 工作流负责测试、数据库迁移和 Worker 部署。

## 1. 准备 Cloudflare 资源

1. 准备一个 Cloudflare 账户，以及 DNS 托管在 Cloudflare 的收件域名。
2. 使用名为 `tidemail` 的 D1 数据库，记录数据库 ID。当前 Cloudflare API 没有原地修改 D1 名称的字段，因此本次新建了 `tidemail` 数据库；旧数据库先保留。也可以在本地使用 Wrangler 创建：

   ```bash
   pnpm exec wrangler d1 create tidemail
   ```

3. 在 **Workers & Pages** 中创建一个临时 Worker，名称设为 `tidemail`。这样后续部署 Token 只需更新现有 Worker；如果由工作流新建 Worker，则 Token 需要创建 Worker 的权限。
4. 创建 Cloudflare API Token，授予目标账户的 Worker 编辑权限和 D1 数据库编辑权限。限制 Token 只能访问部署所需的账户。
5. 开启该域名的 Cloudflare Email Routing。Worker 部署完成后，将 Catch-all 路由的动作设为 **Send to a Worker** 并选择 `tidemail`；若旧 `vmail` 已有 Catch-all 规则，请编辑原规则，避免重复创建。

## 2. 配置 GitHub Actions Secrets

在 GitHub 仓库打开 **Settings → Secrets and variables → Actions → New repository secret**。当前工作流从 Repository secrets 读取以下值。

| Secret                          | 必需                | 说明                                                         |
| ------------------------------- | ------------------- | ------------------------------------------------------------ |
| `CF_API_TOKEN`                  | 是                  | Cloudflare API Token，允许部署 Worker 和应用 D1 迁移         |
| `CF_ACCOUNT_ID`                 | 是                  | Cloudflare 账户 ID                                           |
| `D1_DATABASE_NAME`              | 是                  | D1 数据库名称                                                |
| `D1_DATABASE_ID`                | 是                  | D1 数据库 ID                                                 |
| `EMAIL_DOMAIN`                  | 是                  | 收件域名；多个域名用逗号分隔                                 |
| `COOKIES_SECRET`                | 是                  | Cookie 签名密钥；工作流会作为 Worker secret 写入             |
| `TURNSTILE_KEY`                 | 否                  | Turnstile Site Key；启用验证时与 Secret Key 一起配置         |
| `TURNSTILE_SECRET`              | 否                  | Turnstile Secret Key；工作流会作为 Worker secret 写入        |
| `PASSWORD`                      | 否                  | 站点访问密码；工作流会作为 Worker secret 写入                |
| `SEND_CHANNEL`                  | 否                  | `cloudflare`、`resend` 或 `mailchannels`；留空则隐藏发信功能 |
| `SENDER_EMAIL`                  | 启用发信时必需      | 发件服务允许使用的发件地址                                   |
| `MAILBOX_TOKEN_SECRET`          | 启用发信时必需      | 邮箱发信授权令牌密钥；工作流会作为 Worker secret 写入        |
| `RESEND_API_KEY`                | Resend 时必需       | Resend API Key；工作流会作为 Worker secret 写入              |
| `MAILCHANNELS_API_KEY`          | MailChannels 时必需 | MailChannels API Key；工作流会作为 Worker secret 写入        |
| `SEND_RATE_LIMIT_PER_MINUTE`    | 否                  | 每个邮箱每分钟最大发信次数，默认 `3`                         |
| `SEND_IP_RATE_LIMIT_PER_MINUTE` | 否                  | 每个 IP 每分钟最大发信次数，默认 `10`                        |

Turnstile 的两个密钥必须同时设置。`TURNSTILE_KEY` 是前端使用的 Site Key；`TURNSTILE_SECRET` 只在 Worker 服务端使用。敏感值应放在 GitHub Secrets，并由工作流通过 Wrangler secrets 管理，不要写进前端或 `wrangler.toml`。

Cloudflare API Token 的最新创建指引见 [Cloudflare Workers GitHub Actions 文档](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)；Worker secret 的说明见 [Cloudflare Workers secrets 文档](https://developers.cloudflare.com/workers/configuration/secrets/)。

## 3. 部署

配置完成后，推送到 `main` 会触发 `.github/workflows/deploy.yml`。也可以在 GitHub 仓库 **Actions** 页面手动运行 **Deploy to Cloudflare**。工作流会：

1. 检查 Cloudflare 凭据并安装依赖。
2. 运行覆盖率、E2E、类型检查和前端构建。
3. 对配置的远端 D1 数据库应用 `worker/drizzle/` 下尚未执行的迁移。
4. 部署 Worker 与前端静态资源，再通过 Wrangler secrets 配置服务端密钥。

第一次改版部署会执行 `0004_simplify_product.sql`：该迁移会删除现有邮件，并移除已停用 API 和统计功能的旧表。确认这些历史数据可以清除后再运行工作流。Cloudflare 的迁移命令会针对远端 D1 执行，详见 [D1 migrations 文档](https://developers.cloudflare.com/d1/wrangler-commands/)。

## 4. 验证邮件路由和发信

- 收件：确认 Email Routing 的 Catch-all 路由指向 `tidemail` Worker，再向 `EMAIL_DOMAIN` 中的地址发送一封测试邮件。
- 发信：按所选渠道配置 `SEND_CHANNEL`、`SENDER_EMAIL` 和 `MAILBOX_TOKEN_SECRET`。Resend 或 MailChannels 渠道还需要各自的 API Key；Cloudflare 原生渠道使用仓库中的 `SEND_EMAIL` 绑定，并要求域名启用 Cloudflare Email Routing。
- 主题、人机验证和站点密码：在网页端分别切换主题或验证功能，确认请求可正常通过。
- 数据保留：邮件会在 D1 中最多保留 7 天，由 Worker 每小时运行的 Cron 清理任务删除。

部署完成后，可在 Cloudflare **Workers & Pages → tidemail** 查看 Worker 状态和日志。如果旧的 `vmail` Worker 已配置自定义域名或邮件路由，先将这些路由改为 `tidemail`，验证网页访问和收件正常后，再删除旧 Worker。GitHub Actions 若显示跳过部署，请检查 `CF_API_TOKEN` 与 `CF_ACCOUNT_ID` 是否已配置。
