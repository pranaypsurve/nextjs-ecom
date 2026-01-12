// API Endpoints Configuration
// This file centralizes all API endpoints for easy maintenance and updates

const API_VERSION = "/v1";

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    PROFILE: "/auth/profile",
  },

  // Products
  PRODUCTS: {
    LIST: "/products",
    LIST_ADMIN: "/products/admin",
    DETAIL: (id: string | number) => `/products/${id}`,
    BY_SLUG: (slug: string) => `/products/slug/${slug}`,
    CREATE: "/products",
    UPDATE: (id: string | number) => `/products/${id}`,
    DELETE: (id: string | number) => `/products/${id}`,
    SEARCH: "/products/search",
    FEATURED: "/products/featured",
    BY_CATEGORY: (categoryId: string | number) => `/products/category/${categoryId}`,
  },

  // Categories
  CATEGORIES: {
    LIST: "/categories",
    LIST_ADMIN: "/categories/admin",
    DETAIL: (id: string | number) => `/categories/${id}`,
    CREATE: "/categories",
    UPDATE: (id: string | number) => `/categories/${id}`,
    DELETE: (id: string | number) => `/categories/${id}`,
  },

  // Cart
  CART: {
    GET: "/cart",
    ADD_ITEM: "/cart/add",
    UPDATE_ITEM: "/cart/update",
    REMOVE_ITEM: (id: string | number) => `/cart/remove/${id}`,
    CLEAR: "/cart/clear",
  },

  // Orders
  ORDERS: {
    LIST: "/orders",
    MY_ORDERS: "/orders/my-orders",
    DETAIL: (id: string | number) => `/orders/${id}`,
    CREATE: "/orders",
    UPDATE: (id: string | number) => `/orders/${id}`,
    DELETE: (id: string | number) => `/orders/${id}`,
    TRACK: (id: string | number) => `/orders/${id}/track`,
    CANCEL: (id: string | number) => `/orders/${id}/cancel`,
  },

  // Users
  USERS: {
    LIST: "/users",
    ME: "/users/me",
    ME_PASSWORD: "/users/me/password",
    DETAIL: (id: string | number) => `/users/${id}`,
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
  },

  // Shipping Addresses
  SHIPPING_ADDRESSES: {
    LIST: "/shipping-addresses",
    DETAIL: (id: string | number) => `/shipping-addresses/${id}`,
    CREATE: "/shipping-addresses",
    UPDATE: (id: string | number) => `/shipping-addresses/${id}`,
    DELETE: (id: string | number) => `/shipping-addresses/${id}`,
    SET_DEFAULT: (id: string | number) => `/shipping-addresses/${id}/set-default`,
    GET_DEFAULT: "/shipping-addresses/default",
  },

  // Payments
  PAYMENTS: {
    LIST: "/payments",
    DETAIL: (id: string | number) => `/payments/${id}`,
    CREATE: "/payments",
    UPDATE: (id: string | number) => `/payments/${id}`,
    DELETE: (id: string | number) => `/payments/${id}`,
  },

  // Coupons
  COUPONS: {
    LIST: "/coupons",
    LIST_ADMIN: "/coupons/admin",
    BY_CODE: (code: string) => `/coupons/code/${code}`,
    DETAIL: (id: string | number) => `/coupons/${id}`,
    CREATE: "/coupons",
    UPDATE: (id: string | number) => `/coupons/${id}`,
    DELETE: (id: string | number) => `/coupons/${id}`,
    APPLY: "/coupons/apply",
    VALIDATE: "/coupons/validate",
  },

  // Gift Vouchers
  GIFT_VOUCHERS: {
    LIST: "/gift-vouchers",
    BY_CODE: (code: string) => `/gift-vouchers/code/${code}`,
    DETAIL: (id: string | number) => `/gift-vouchers/${id}`,
    CREATE: "/gift-vouchers",
    UPDATE: (id: string | number) => `/gift-vouchers/${id}`,
    DELETE: (id: string | number) => `/gift-vouchers/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
    DETAIL: (id: string | number) => `/notifications/${id}`,
    CREATE: "/notifications",
    UPDATE: (id: string | number) => `/notifications/${id}`,
    DELETE: (id: string | number) => `/notifications/${id}`,
    MARK_READ: (id: string | number) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },

  // Files
  FILES: {
    UPLOAD: "/files/upload",
    UPDATE: (filename: string) => `/files/update/${filename}`,
    DELETE: (filename: string) => `/files/${filename}`,
  },
} as const;

// Helper function to get full endpoint URL
export const getEndpoint = (endpoint: string): string => {
  return `${API_VERSION}${endpoint}`;
};

