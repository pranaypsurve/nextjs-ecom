import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.scss";
import StoreProvider from "@/components/providers/StoreProvider";
import AntdProvider from "@/components/providers/AntdProvider";
import MainLayout from "@/components/layout/MainLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-Commerce Platform",
  description: "Modern e-commerce platform with comprehensive features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${openSans.variable} antialiased`}
      >
        <StoreProvider>
          <AntdProvider>
            <MainLayout>{children}</MainLayout>
          </AntdProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
