import type { Config } from "tailwindcss";

export default {
  // 修复：确保 Tailwind 扫描 index.html 和 src 目录下的所有相关文件以生成样式
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
} satisfies Config;
