"use client";

import { Layout } from "antd";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Layout style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Content style={{ flex: 1, background: "#fff" }}>{children}</Content>
      <Footer />
      <CartDrawer />
    </Layout>
  );
}

