import { createContext, useContext } from "react";

// 定义配置的类型
export interface AppConfig {
  emailDomain: string[]; // 修改为字符串数组
  turnstileKey: string;
  turnstileEnabled: boolean;
  sitePasswordEnabled: boolean;
  cookiesSecret: string;
  sendChannel: "" | "resend" | "mailchannels" | "cloudflare";
  senderEmail: string;
}

export const ConfigContext = createContext<AppConfig | null>(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig 必须在 ConfigProvider 内部使用");
  }
  return context;
};
