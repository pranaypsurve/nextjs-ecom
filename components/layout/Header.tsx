"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Badge, Avatar, Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  GiftOutlined,
  FileTextOutlined,
  SettingOutlined,
  LockOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { openCart } from "@/store/slices/cartSlice";
import { Role } from "@/lib/constants";

const { Header: AntHeader } = Layout;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    setCartItemCount(count);
  }, [items]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleCartClick = () => {
    dispatch(openCart());
  };

  // User menu items
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link href="/profile">View Profile</Link>,
    },
    {
      key: "orders",
      icon: <FileTextOutlined />,
      label: <Link href="/orders">My Orders</Link>,
    },
    {
      key: "addresses",
      icon: <HomeOutlined />,
      label: <Link href="/profile/addresses">Manage Addresses</Link>,
    },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: <Link href="/profile/change-password">Change Password</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Admin menu items
  const adminMenuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "categories",
      icon: <AppstoreOutlined />,
      label: <Link href="/admin/categories">Manage Categories</Link>,
    },
    {
      key: "products",
      icon: <AppstoreOutlined />,
      label: <Link href="/admin/products">Manage Products</Link>,
    },
    {
      key: "orders",
      icon: <FileTextOutlined />,
      label: <Link href="/admin/orders">Manage Orders</Link>,
    },
    {
      key: "coupons",
      icon: <GiftOutlined />,
      label: <Link href="/admin/coupons">Manage Coupons</Link>,
    },
    {
      key: "gift-cards",
      icon: <GiftOutlined />,
      label: <Link href="/admin/gift-cards">Manage Gift Cards</Link>,
    },
  ];

  // Navigation menu items
  const navItems: MenuProps["items"] = [
    {
      key: "/",
      label: <Link href="/">Home</Link>,
    },
    {
      key: "/products",
      label: <Link href="/products">Products</Link>,
    },
  ];

  return (
    <AntHeader 
      className="header" 
      style={{ 
        padding: "0 24px", 
        background: "#fff", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "64px",
        lineHeight: "64px",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/" style={{ fontSize: "20px", fontWeight: "bold", color: "var(--color-primary)" }}>
            E-Commerce
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={navItems}
            style={{ border: "none", flex: 1, minWidth: 200 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isAuthenticated && (
            <>
              <Badge count={cartItemCount} size="small">
                <span>
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
                    onClick={handleCartClick}
                  />
                </span>
              </Badge>

              {user?.role === Role.ADMIN && (
                <Dropdown menu={{ items: adminMenuItems }} placement="bottomRight">
                  <Button type="text" icon={<DashboardOutlined />}>
                    Admin
                  </Button>
                </Dropdown>
              )}

              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />
              </Dropdown>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link href="/login">
                <Button type="text">Login</Button>
              </Link>
              <Link href="/register">
                <Button type="primary">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </AntHeader>
  );
}

