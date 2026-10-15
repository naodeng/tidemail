import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { Button, Card, Select } from "animal-island-ui";
import {
  CodeIcon,
  CloseIcon,
  GlobeIcon,
  KeyIcon,
} from "naive-icons";
import { MailList } from "../components/MailList.tsx";
import { CopyButton } from "../components/CopyButton.tsx";
import {
  getEmails,
  getMailboxMeta,
  deleteEmails,
  loginByPassword,
  refreshMailboxToken,
  verifyTurnstile,
} from "../services/api.ts";
import { useConfig } from "../hooks/useConfig.ts";
import { encrypt } from "../lib/utlis.ts";
import type { Email } from "../database_types.ts";
import { InfoModal } from "../components/InfoModal.tsx";
import { PasswordModal } from "../components/password.tsx";
import { SenderModal } from "../components/sender.tsx";
import { MailDetail } from "./MailDetail.tsx";
import { CountdownTimer } from "../components/CountdownTimer.tsx";
import { useTheme } from "../hooks/useTheme.tsx";

export function Home() {
  const config = useConfig();
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const queryClient = useQueryClient();

  const [address, setAddress] = useState<string | undefined>(() =>
    Cookies.get("userMailbox"),
  );
  const [mailboxToken, setMailboxToken] = useState<string>(
    () => Cookies.get("mailboxToken") || "",
  );
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | undefined>(
    () => {
      const expiry = Cookies.get("emailExpiry");
      return expiry ? parseInt(expiry, 10) : undefined;
    },
  );
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>(
    config.emailDomain[0],
  );
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSenderModal, setShowSenderModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const canSendEmails = Boolean(address && mailboxToken && config.sendChannel);
  const [hasReceivedEmail, setHasReceivedEmail] = useState(false);

  const {
    data: emails = [],
    isLoading,
    isFetching,
    refetch,
    error: emailsError,
  } = useQuery<Email[], Error>({
    queryKey: ["emails", address],
    queryFn: () => getEmails(address!, 50),
    enabled: !!address,
    refetchInterval: false,
    retry: false,
  });

  useEffect(() => {
    if (emailsError) {
      toast.error(`${t("Failed to get emails")}: ${emailsError.message}`, {
        duration: 5000,
      });
    }
  }, [emailsError, t]);

  const mailboxMetaSignatureRef = useRef<string | null>(null);

  const { data: mailboxMeta } = useQuery({
    queryKey: ["emails-meta", address],
    queryFn: () => getMailboxMeta(address!),
    enabled: !!address,
    refetchInterval: () =>
      document.visibilityState === "visible" ? 60000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    if (!mailboxMeta) {
      return;
    }

    const signature = `${mailboxMeta.count}:${mailboxMeta.latestEmailCreatedAt ?? ""}`;
    if (mailboxMetaSignatureRef.current === null) {
      mailboxMetaSignatureRef.current = signature;
      return;
    }

    if (mailboxMetaSignatureRef.current !== signature) {
      mailboxMetaSignatureRef.current = signature;
      queryClient.invalidateQueries({ queryKey: ["emails", address] });
    }
  }, [address, mailboxMeta, queryClient]);

  const showPasswordToast = useCallback(
    (password: string) => {
      toast(
        (toastInstance) => (
          <Card className="password-toast-card">
            <div className="password-toast-card__heading">
              <div className="password-toast-card__title">
                <KeyIcon aria-hidden="true" />
                <h3 className="text-lg font-semibold">{t("View password")}</h3>
              </div>
              <Button
                type="text"
                size="small"
                icon={<CloseIcon aria-hidden="true" />}
                onClick={() => toast.dismiss(toastInstance.id)}
                aria-label={t("Close")}
              />
            </div>
            <div>
              <p className="form-note">
                {t("Save your password and continue using this email in 1 day")}
              </p>
              <div className="address-card">
                <span className="address-card__value">{password}</span>
                <CopyButton text={password} />
              </div>
              <p className="form-note">
                {t(
                  "Remember your password, otherwise your email will expire and cannot be retrieved",
                )}
              </p>
            </div>
          </Card>
        ),
        {
          id: "password-notification",
          duration: 5000,
          position: "top-center",
          style: {
            background: "transparent",
            border: "none",
            padding: 0,
            boxShadow: "none",
          },
        },
      );
    },
    [t],
  );

  useEffect(() => {
    if (emails.length > 0 && !hasReceivedEmail) {
      setHasReceivedEmail(true);
    }

    if (!address) {
      setHasReceivedEmail(false);
      setExpiryTimestamp(undefined);
      toast.dismiss("password-notification");
    } else {
      const expiry = Cookies.get("emailExpiry");
      if (expiry && !expiryTimestamp) {
        setExpiryTimestamp(parseInt(expiry, 10));
      }
    }
  }, [emails, address, hasReceivedEmail, expiryTimestamp]);

  // 创建新邮箱地址的处理函数
  const handleCreateAddress = async () => {
    const requireTurnstile = config.turnstileEnabled;

    if (requireTurnstile && !turnstileToken) {
      toast.error(t("No captcha response"));
      return;
    }

    try {
      const authorization = await verifyTurnstile(
        selectedDomain,
        requireTurnstile ? turnstileToken : undefined,
      );
      const mailbox = authorization.mailbox;
      // feat: 计算并存储过期时间戳 (当前时间 + 24小时)
      const now = Date.now();
      const expires = now + 24 * 60 * 60 * 1000;
      Cookies.set("userMailbox", mailbox, { expires: 1 }); // cookie 有效期1天
      Cookies.set("emailExpiry", expires.toString(), { expires: 1 }); // 存储过期时间戳
      if (authorization.mailboxToken) {
        Cookies.set("mailboxToken", authorization.mailboxToken, { expires: 1 });
      } else {
        Cookies.remove("mailboxToken");
      }
      setAddress(mailbox);
      setMailboxToken(authorization.mailboxToken || "");
      setExpiryTimestamp(expires); // 更新状态
      setHasReceivedEmail(false); // 重置接收邮件状态
      toast.success(t("Email created successfully")); // feat: 使用全局 toast 提示
    } catch (error) {
      toast.error(t("Failed to verify captcha"));
      console.error("Turnstile verification failed:", error);
    }
  };

  // 停止使用当前邮箱地址
  const handleStopAddress = () => {
    Cookies.remove("userMailbox");
    Cookies.remove("mailboxToken");
    // feat: 移除过期时间 cookie
    Cookies.remove("emailExpiry");
    setAddress(undefined);
    setMailboxToken("");
    mailboxMetaSignatureRef.current = null;
    setHasReceivedEmail(false); // 重置状态
    setSelectedEmail(null); // 清除选中的邮件
    setExpiryTimestamp(undefined); // 清除过期时间状态
    queryClient.invalidateQueries({ queryKey: ["emails"] }); // 清理缓存
  };

  // feat: 手动刷新邮件
  const handleRefresh = () => {
    refetch();
    toast.success(t("Mailbox refreshed"));
  };

  // 修改：将延长邮箱有效期改为重置邮箱有效期
  const handleResetExpiry = useCallback(async () => {
    if (mailboxToken) {
      try {
        const refreshedToken = await refreshMailboxToken(mailboxToken);
        Cookies.set("mailboxToken", refreshedToken, { expires: 1 });
        setMailboxToken(refreshedToken);
      } catch {
        toast.error(t("SEND_UNAUTHORIZED"));
        return;
      }
    }

    // feat: 计算新的过期时间戳 (当前时间 + 24小时)
    const newExpiry = Date.now() + 24 * 60 * 60 * 1000;
    // 计算新的 Cookie 过期时间（相对于当前时间1天）
    const cookieExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    Cookies.set("emailExpiry", newExpiry.toString(), {
      expires: cookieExpires,
    }); // 更新 Cookie，有效期设为从现在起1天
    setExpiryTimestamp(newExpiry); // 更新状态
    toast.success(t("Validity reset successfully")); // 修改：显示重置成功提示
  }, [mailboxToken, t]);

  // 删除邮件的 useMutation hook
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteEmails(ids),
    onSuccess: () => {
      toast.success(t("Emails deleted successfully")); // feat: 使用全局 toast 提示
      setSelectedIds([]); // 清空选择
      if (selectedEmail && selectedIds.includes(selectedEmail.id)) {
        setSelectedEmail(null); // 如果删除的邮件是被选中的，则清除
      }
      queryClient.invalidateQueries({ queryKey: ["emails", address] }); // 刷新列表
    },
    onError: () => {
      toast.error(t("Failed to delete emails")); // feat: 使用全局 toast 提示
    },
  });

  // 定义 handleDeleteEmails 函数
  const handleDeleteEmails = (ids: string[]) => {
    if (ids.length === 0) {
      toast.error(t("Please select emails to delete"));
      return;
    }
    deleteMutation.mutate(ids);
  };

  // feat: 处理密码登录的函数
  // fix: 移除登录时的 turnstile token 校验逻辑
  const handleLogin = async (password: string) => {
    setIsLoggingIn(true);
    try {
      // fix: 调用更新后的 loginByPassword 函数，不再传递 token
      const data = await loginByPassword(password);
      // feat: 登录成功后也设置过期时间戳
      const now = Date.now();
      const expires = now + 24 * 60 * 60 * 1000;
      Cookies.set("userMailbox", data.address, { expires: 1 });
      Cookies.set("emailExpiry", expires.toString(), { expires: 1 });
      if (data.mailboxToken) {
        Cookies.set("mailboxToken", data.mailboxToken, { expires: 1 });
      } else {
        Cookies.remove("mailboxToken");
      }
      setAddress(data.address);
      setMailboxToken(data.mailboxToken || "");
      setExpiryTimestamp(expires); // 更新状态
      setShowPasswordModal(false); // 关闭模态框
      toast.success(t("Login successful"));
    } catch (error: any) {
      // fix: 使用 i18n 翻译错误信息
      toast.error(`${t("Login failed")}: ${t(error.message)}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // feat: 获取密码（基于当前邮箱地址和 COOKIES_SECRET 加密）
  const getPassword = useCallback(() => {
    if (address && config.cookiesSecret) {
      return encrypt(address, config.cookiesSecret);
    }
    return null;
  }, [address, config.cookiesSecret]);

  // 新增：处理邮件选择
  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  // 新增：关闭邮件详情
  const handleCloseDetail = () => {
    setSelectedEmail(null);
  };

  // feat: 新增处理函数，用于在模态框中显示邮件
  const handleExpandEmail = () => {
    setShowEmailModal(true);
  };

  return (
    <>
      <main className="home-page">
        <section className="home-heading">
          <h1 className="home-title">{t("Virtual Temporary Email")}</h1>
          <p>
            {t("Privacy friendly")} · {t("Valid for 1 Day")} ·{" "}
            {t("100% Run on Cloudflare")}
          </p>
        </section>

        <div className="home-layout">
          <aside className="home-sidebar">
            <Card className="home-sidebar__card">
              <ul className="service-feature-list">
                <li>
                  <CodeIcon size={18} aria-hidden="true" />
                  <a
                    href="https://github.com/naodeng/vmail"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Open Source")}
                  </a>
                </li>
                <li>
                  <GlobeIcon size={18} aria-hidden="true" />
                  <span>{t("Multi-domain configurable")}</span>
                </li>
              </ul>
            </Card>

            <Card className="home-sidebar__card">
              {address ? (
                <section>
                  <h2>{t("Email address")}</h2>
                  <div className="address-card">
                    <span className="address-card__value">{address}</span>
                    <CopyButton text={address} className="ml-auto" />
                  </div>
                  {expiryTimestamp && (
                    <CountdownTimer
                      expiryTimestamp={expiryTimestamp}
                      onReset={handleResetExpiry}
                    />
                  )}
                  <Button
                    type="default"
                    danger
                    block
                    onClick={handleStopAddress}
                  >
                    {t("Stop")}
                  </Button>
                </section>
              ) : (
                <section>
                  <h2>{t("Create temporary email")}</h2>
                  <label className="form-field">
                    {t("Domain")}
                    <Select
                      options={config.emailDomain.map((domain) => ({
                        key: domain,
                        label: `@${domain}`,
                      }))}
                      value={selectedDomain}
                      onChange={setSelectedDomain}
                      aria-label={t("Domain")}
                    />
                  </label>
                  {config.turnstileEnabled && (
                    <div className="form-field">
                      <span>{t("Validater")}</span>
                      <div className="turnstile-shell">
                        <Turnstile
                          className="w-full"
                          siteKey={config.turnstileKey}
                          onSuccess={setTurnstileToken}
                          options={{ theme: resolvedTheme, size: "flexible" }}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    type="primary"
                    block
                    onClick={handleCreateAddress}
                    disabled={config.turnstileEnabled && !turnstileToken}
                  >
                    {t("Create temporary email")}
                  </Button>
                  <Button
                    className="mt-3"
                    type="text"
                    size="small"
                    icon={<KeyIcon aria-hidden="true" />}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    {t("Have a password? Login.")}
                  </Button>
                </section>
              )}
            </Card>
          </aside>

          <section aria-label={t("INBOX")}>
            <MailList
              isAddressCreated={Boolean(address)}
              emails={emails}
              isLoading={isLoading}
              isFetching={isFetching}
              onDelete={handleDeleteEmails}
              isDeleting={deleteMutation.isPending}
              onRefresh={handleRefresh}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onSelectEmail={handleSelectEmail}
              showViewPasswordButton={hasReceivedEmail}
              onShowPassword={() => {
                const password = getPassword();
                if (password) showPasswordToast(password);
              }}
              selectedEmail={selectedEmail}
              onCloseDetail={handleCloseDetail}
              onExpand={handleExpandEmail}
              canSendEmails={canSendEmails}
              onOpenSender={() => setShowSenderModal(true)}
            />
          </section>
        </div>
      </main>

      <PasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
      />
      <SenderModal
        senderEmail={address || ""}
        mailboxToken={mailboxToken}
        open={showSenderModal}
        onClose={() => setShowSenderModal(false)}
      />
      {selectedEmail && (
        <InfoModal
          showModal={showEmailModal}
          setShowModal={setShowEmailModal}
          title={t("Email Detail")}
        >
          <MailDetail email={selectedEmail} />
        </InfoModal>
      )}
    </>
  );
}
