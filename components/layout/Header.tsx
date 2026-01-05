"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Badge, Avatar, Dropdown, Button, Drawer } from "antd";
import type { MenuProps } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  GiftOutlined,
  FileTextOutlined,
  LockOutlined,
  HomeOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { openCart } from "@/store/slices/cartSlice";
import { Role, API_BASE_URL } from "@/lib/constants";
import { ENDPOINTS } from "@/lib/endpoints";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";

const { Header: AntHeader } = Layout;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: categories = [] } = useGetCategoriesQuery();

  // Calculate cart count directly from items
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies on backend
      await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, {
        method: "POST",
        credentials: "include", // Include cookies
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear Redux state
      dispatch(logout());
      router.push("/");
      setMobileMenuOpen(false);
    }
  };

  const handleCartClick = () => {
    dispatch(openCart());
    setMobileMenuOpen(false);
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
      label: <Link href="/admin/orders">Order Management</Link>,
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">User Management</Link>,
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

  // Build Sales submenu with categories
  const salesSubmenuItems: MenuProps["items"] = categories
    .filter((cat) => cat.is_active !== false)
    .map((category) => ({
      key: `/products?category=${category.id}`,
      label: (
        <Link href={`/products?category=${category.id}`} onClick={() => setMobileMenuOpen(false)}>
          {category.name}
        </Link>
      ),
    }));

  // Navigation menu items for desktop
  const navItems: MenuProps["items"] = [
    {
      key: "/",
      label: <Link href="/">Home</Link>,
    },
    {
      key: "sarees",
      label: "Sarees",
      children: [
        {
          key: "/products",
          label: <Link href="/products">All Collections</Link>,
        },
        ...(salesSubmenuItems || []),
      ],
    },
  ];

  // Mobile menu items
  const mobileMenuItems: MenuProps["items"] = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>,
    },
    {
      key: "/products",
      icon: <AppstoreOutlined />,
      label: <Link href="/products" onClick={() => setMobileMenuOpen(false)}>All Products</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "sales-header",
      label: <span style={{ fontWeight: "bold", color: "var(--color-primary)" }}>Collections</span>,
      type: "group",
    },
    ...(salesSubmenuItems || []),
    ...(mounted && isAuthenticated
      ? [
          {
            type: "divider" as const,
          },
          {
            key: "profile",
            icon: <UserOutlined />,
            label: <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>View Profile</Link>,
          },
          {
            key: "orders",
            icon: <FileTextOutlined />,
            label: <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>,
          },
          {
            key: "addresses",
            icon: <HomeOutlined />,
            label: <Link href="/profile/addresses" onClick={() => setMobileMenuOpen(false)}>Manage Addresses</Link>,
          },
          {
            key: "change-password",
            icon: <LockOutlined />,
            label: <Link href="/profile/change-password" onClick={() => setMobileMenuOpen(false)}>Change Password</Link>,
          },
          ...(user?.role === Role.ADMIN
            ? [
                {
                  type: "divider" as const,
                },
                {
                  key: "admin-header",
                  label: <span style={{ fontWeight: "bold", color: "var(--color-primary)" }}>Admin</span>,
                  type: "group" as const,
                },
                {
                  key: "admin-dashboard",
                  icon: <DashboardOutlined />,
                  label: <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>,
                },
                {
                  key: "admin-categories",
                  icon: <AppstoreOutlined />,
                  label: <Link href="/admin/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>,
                },
                {
                  key: "admin-products",
                  icon: <AppstoreOutlined />,
                  label: <Link href="/admin/products" onClick={() => setMobileMenuOpen(false)}>Products</Link>,
                },
                {
                  key: "admin-orders",
                  icon: <FileTextOutlined />,
                  label: <Link href="/admin/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>,
                },
                {
                  key: "admin-users",
                  icon: <UserOutlined />,
                  label: <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)}>Users</Link>,
                },
                {
                  key: "admin-coupons",
                  icon: <GiftOutlined />,
                  label: <Link href="/admin/coupons" onClick={() => setMobileMenuOpen(false)}>Coupons</Link>,
                },
                {
                  key: "admin-gift-cards",
                  icon: <GiftOutlined />,
                  label: <Link href="/admin/gift-cards" onClick={() => setMobileMenuOpen(false)}>Gift Cards</Link>,
                },
              ]
            : []),
          {
            type: "divider" as const,
          },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            onClick: handleLogout,
            danger: true,
          },
        ]
      : [
          {
            type: "divider" as const,
          },
          {
            key: "login",
            label: <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>,
          },
          {
            key: "register",
            label: <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>,
          },
        ]),
  ];

  return (
    <>
      <AntHeader
        className="header"
        style={{
          padding: "0 16px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          height: "64px",
          lineHeight: "64px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontSize: isMobile ? "18px" : "20px",
              fontWeight: "bold",
              color: "var(--color-primary)",
              whiteSpace: "nowrap",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            E-Commerce
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1, justifyContent: "center" }}>
              <Menu
                mode="horizontal"
                selectedKeys={[pathname]}
                items={navItems}
                style={{
                  border: "none",
                  background: "transparent",
                  minWidth: 300,
                }}
              />
            </div>
          )}

          {/* Right Side Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "4px" : "8px", flexShrink: 0 }}>
            {mounted && isAuthenticated && (
              <>
                <Badge count={cartItemCount} size="small">
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined style={{ fontSize: isMobile ? "18px" : "20px" }} />}
                    onClick={handleCartClick}
                    style={{ display: "flex", alignItems: "center", padding: isMobile ? "4px 8px" : "4px 12px" }}
                  />
                </Badge>

                {/* Desktop Admin & User Menus */}
                {!isMobile && (
                  <>
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
              </>
            )}

            {mounted && !isAuthenticated && !isMobile && (
              <>
                <Link href="/login">
                  <Button type="text">Login</Button>
                </Link>
                <Link href="/register">
                  <Button type="primary">Sign Up</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                type="text"
                icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ fontSize: "20px" }}
              />
            )}
          </div>
        </div>
      </AntHeader>

      {/* Mobile Drawer Menu */}
      {isMobile && (
        <Drawer
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {mounted && isAuthenticated && (
                <Badge count={cartItemCount} size="small">
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
                    onClick={handleCartClick}
                  />
                </Badge>
              )}
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>Menu</span>
            </div>
          }
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          styles={{
            body: { padding: 0 },
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={mobileMenuItems}
            style={{ border: "none" }}
          />
        </Drawer>
      )}
    </>
  );
}

