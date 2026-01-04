"use client";

import { ConfigProvider, App } from "antd";
import { COLORS } from "@/lib/constants";
import type { ReactNode } from "react";

export default function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: COLORS.primary,
          colorSuccess: COLORS.secondary,
          colorWarning: COLORS.accent,
          fontFamily: "var(--font-inter), var(--font-open-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}

