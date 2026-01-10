import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState, AppDispatch } from "@/store";
import { API_BASE_URL } from "@/lib/constants";
import { logout } from "@/store/slices/authSlice";
import { ENDPOINTS } from "@/lib/endpoints";

// Request queue for handling concurrent 401 errors
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error?: any) => void;
  args: string | FetchArgs;
  api: any;
  extraOptions: any;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: any = null) => {
  failedQueue.forEach(async ({ resolve, reject, args, api, extraOptions }) => {
    if (error) {
      reject(error);
    } else {
      // Retry the original request
      try {
        const result = await baseQuery(args, api, extraOptions);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }
  });
  failedQueue = [];
};

// Base query - cookies are sent automatically, no manual token handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // Important: Include cookies in all requests
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    // No Authorization header - cookies handle authentication
    return headers;
  },
});

// Base query with auto-refresh and request queuing
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // Skip refresh logic for auth endpoints
  const isAuthEndpoint =
    (typeof args === "string" && args.includes("/auth/")) ||
    (typeof args === "object" &&
      typeof args.url === "string" &&
      (args.url === ENDPOINTS.AUTH.LOGIN ||
        args.url === ENDPOINTS.AUTH.REGISTER ||
        args.url === ENDPOINTS.AUTH.REFRESH));

  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - token expired
  if (result.error && result.error.status === 401 && !isAuthEndpoint) {
    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<typeof result>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject: (err) => {
            resolve({ error: err as FetchBaseQueryError });
          },
          args,
          api,
          extraOptions,
        });
      });
    }

    // Start refresh process
    isRefreshing = true;

    try {
      // Call refresh endpoint - cookies are sent automatically
      const refreshResult = await baseQuery(
        {
          url: ENDPOINTS.AUTH.REFRESH,
          method: "POST",
        },
        api,
        extraOptions
      );

      if (refreshResult.error) {
        // Refresh failed - logout and redirect
        processQueue(refreshResult.error);
        isRefreshing = false;

        const dispatch = api.dispatch as AppDispatch;
        dispatch(logout());

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = "/login?expired=true";
          }, 100);
        }

        return refreshResult;
      }

      // Refresh successful - process queue and retry original request
      processQueue(null);
      isRefreshing = false;

      // Retry the original request
      result = await baseQuery(args, api, extraOptions);
    } catch (error) {
      // Refresh failed with exception
      processQueue(error);
      isRefreshing = false;

      const dispatch = api.dispatch as AppDispatch;
      dispatch(logout());

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
        setTimeout(() => {
          window.location.href = "/login?expired=true";
        }, 100);
      }

      return { error: { status: 401, data: "Authentication failed" } };
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
    "ShippingAddress",
    "Payment",
    "Coupon",
    "GiftCard",
    "Notification",
  ],
  endpoints: () => ({}),
  // Disable caching for development - refetch on every mount
  keepUnusedDataFor: 0, // Don't keep unused data
  refetchOnMountOrArgChange: true, // Always refetch on component mount
  refetchOnFocus: true, // Refetch when window regains focus
  refetchOnReconnect: true, // Refetch when reconnecting
});

// Export reusable query/mutation builders for future use
export type ApiError = FetchBaseQueryError;
export type ApiResponse<T> = { data: T } | { error: ApiError };
