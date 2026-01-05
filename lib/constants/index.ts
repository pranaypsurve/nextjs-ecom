// User Roles
export enum Role {
  CUSTOMER = "customer",
  ADMIN = "admin",
  INVENTORY = "inventory",
  ORDER = "order",
  USER = "user",
}

// API Configuration
// Next.js automatically loads .env files, just use process.env directly
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Route Permissions
export const ROUTE_PERMISSIONS = {
  "/admin": [Role.ADMIN],
  "/admin/categories": [Role.ADMIN],
  "/admin/products": [Role.ADMIN],
  "/admin/orders": [Role.ADMIN],
  "/admin/users": [Role.ADMIN],
  "/admin/coupons": [Role.ADMIN],
  "/admin/gift-cards": [Role.ADMIN],
  "/cart": [Role.USER],
  "/checkout": [Role.USER],
  "/profile": [Role.ADMIN, Role.USER],
  "/orders": [Role.ADMIN, Role.USER],
} as const;

// Application Colors (4-color user engagement scheme)
export const COLORS = {
  primary: "#2563eb", // Engaging blue - primary actions, links
  secondary: "#10b981", // Success green - positive actions, success states
  accent: "#f59e0b", // Engaging amber - highlights, warnings
  error: "#ef4444", // Error red - errors, destructive actions
  text: {
    primary: "#1f2937",
    secondary: "#6b7280",
    disabled: "#9ca3af",
  },
  background: {
    light: "#ffffff",
    dark: "#111827",
    gray: "#f9fafb",
  },
  border: "#e5e7eb",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// Local Storage Keys
// Note: With Redux Persist, data is stored under "persist:root" key
// Tokens are stored in httpOnly cookies by backend, not in localStorage
export const STORAGE_KEYS = {
  USER: "user_data", // Only user data is persisted, tokens are in cookies
} as const;

// Currency Configuration
export const CURRENCY = {
  SYMBOL: "₹",
  CODE: "INR",
  LOCALE: "en-IN",
} as const;

