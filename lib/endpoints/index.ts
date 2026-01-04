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
    PROFILE: "/auth/profile",
  },

  // Products
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id: string | number) => `/products/${id}`,
    SEARCH: "/products/search",
    FEATURED: "/products/featured",
    BY_CATEGORY: (categoryId: string | number) => `/products/category/${categoryId}`,
  },

  // Categories
  CATEGORIES: {
    LIST: "/categories",
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
    DETAIL: (id: string | number) => `/orders/${id}`,
    CREATE: "/orders",
    UPDATE: (id: string | number) => `/orders/${id}`,
    TRACK: (id: string | number) => `/orders/${id}/track`,
    CANCEL: (id: string | number) => `/orders/${id}/cancel`,
  },

  // Users
  USERS: {
    LIST: "/users",
    DETAIL: (id: string | number) => `/users/${id}`,
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
  },

  // Addresses
  ADDRESSES: {
    LIST: "/addresses",
    DETAIL: (id: string | number) => `/addresses/${id}`,
    CREATE: "/addresses",
    UPDATE: (id: string | number) => `/addresses/${id}`,
    DELETE: (id: string | number) => `/addresses/${id}`,
    SET_DEFAULT: (id: string | number) => `/addresses/${id}/default`,
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
    DETAIL: (id: string | number) => `/coupons/${id}`,
    CREATE: "/coupons",
    UPDATE: (id: string | number) => `/coupons/${id}`,
    DELETE: (id: string | number) => `/coupons/${id}`,
    APPLY: "/coupons/apply",
    VALIDATE: "/coupons/validate",
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
} as const;

// Helper function to get full endpoint URL
export const getEndpoint = (endpoint: string): string => {
  return `${API_VERSION}${endpoint}`;
};

