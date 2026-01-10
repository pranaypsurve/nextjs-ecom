"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Breadcrumb, Button, Drawer } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
  TagOutlined,
  GiftOutlined,
  MenuOutlined,
  HomeOutlined,
  ProductOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate breadcrumb items based on pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      {
        title: (
          <Link href="/">
            <HomeOutlined style={{ marginRight: 4 }} />
            Home
          </Link>
        ),
      },
    ];

    if (paths.length > 0) {
      breadcrumbs.push({
        title: (
          <Link href="/admin">
            <DashboardOutlined style={{ marginRight: 4 }} />
            Admin
          </Link>
        ),
      });

      if (paths.length > 1) {
        const pageName = paths[1]
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        breadcrumbs.push({
          title: <span>{pageName}</span>,
        });
      }
    }

    return breadcrumbs;
  };

  // Menu items
  const menuItems: MenuProps["items"] = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/products",
      icon: <ProductOutlined />,
      label: <Link href="/admin/products">Products</Link>,
    },
    {
      key: "/admin/categories",
      icon: <AppstoreOutlined />,
      label: <Link href="/admin/categories">Categories</Link>,
    },
    {
      key: "/admin/orders",
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/orders">Orders</Link>,
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Users</Link>,
    },
    {
      key: "/admin/coupons",
      icon: <TagOutlined />,
      label: <Link href="/admin/coupons">Coupons</Link>,
    },
    {
      key: "/admin/gift-cards",
      icon: <GiftOutlined />,
      label: <Link href="/admin/gift-cards">Gift Cards</Link>,
    },
  ];

  // Get selected key based on current path
  const getSelectedKey = () => {
    if (pathname === "/admin") return "/admin";
    const matchingItem = menuItems.find((item) => {
      if (!item?.key) return false;
      const key = String(item.key);
      return pathname.startsWith(key) && key !== "/admin";
    });
    return matchingItem?.key as string || "/admin";
  };

  const sidebarContent = (
    <Menu
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      items={menuItems}
      style={{
        height: "100%",
        borderRight: 0,
        paddingTop: 16,
      }}
      onClick={() => {
        if (isMobile) {
          setMobileDrawerOpen(false);
        }
      }}
    />
  );

  return (
    <Layout style={{ minHeight: "calc(100vh - 64px)" }}>
      <style jsx global>{`
        .admin-layout-sider {
          background: #fff;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
        }

        .admin-breadcrumb {
          background: white;
          padding: 16px 24px;
          margin: 0;
          border-bottom: 1px solid #f0f0f0;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .admin-mobile-header {
          background: white;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-content-wrapper {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: calc(100vh - 64px - 57px);
        }

        @media (max-width: 767px) {
          .admin-content-wrapper {
            min-height: calc(100vh - 64px - 53px - 48px);
          }
        }
      `}</style>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          width={250}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          className="admin-layout-sider"
          breakpoint="lg"
        >
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              borderBottom: "1px solid #f0f0f0",
              fontWeight: "bold",
              fontSize: collapsed ? "14px" : "16px",
              color: "#667eea",
            }}
          >
            {collapsed ? "Admin" : "Admin Panel"}
          </div>
          {sidebarContent}
        </Sider>
      )}

      <Layout>
        {/* Mobile Header */}
        {isMobile && (
          <div className="admin-mobile-header">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              size="large"
            />
            <span style={{ fontWeight: "bold", fontSize: "16px", color: "#667eea" }}>
              Admin Panel
            </span>
          </div>
        )}

        {/* Breadcrumbs */}
        <Breadcrumb className="admin-breadcrumb" items={getBreadcrumbs()} />

        {/* Main Content */}
        <Content className="admin-content-wrapper">{children}</Content>
      </Layout>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title="Admin Menu"
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          size={250}
          styles={{ body: { padding: 0 } }}
        >
          {sidebarContent}
        </Drawer>
      )}
    </Layout>
  );
}

