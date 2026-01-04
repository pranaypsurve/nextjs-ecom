import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants";

// Token retrieval function (currently from localStorage, future: cookies)
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// Base query with token injection
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { endpoint, type }) => {
    // Check if this is an auth endpoint that shouldn't have token
    // The endpoint name from RTK Query will be "login" or "register" for auth endpoints
    const isAuthEndpoint = 
      endpoint === "login" || 
      endpoint === "register" ||
      (typeof endpoint === "string" && endpoint.includes("auth"));
    
    if (!isAuthEndpoint) {
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// Base query with reauth logic (for future token refresh)
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - token expired
  if (result.error && result.error.status === 401) {
    // Future: Implement token refresh logic here
    // For now, clear token and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  return result;
};

// Create base API slice
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Product",
    "Category",
    "Cart",
    "Order",
    "User",
    "Address",
    "Payment",
    "Coupon",
    "GiftCard",
    "Notification",
  ],
  endpoints: () => ({}),
});

// Export reusable query/mutation builders for future use
export type ApiError = FetchBaseQueryError;
export type ApiResponse<T> = { data: T } | { error: ApiError };
