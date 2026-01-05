import { baseApi } from "./baseApi";
import type { Role } from "@/lib/constants";
import { ENDPOINTS } from "@/lib/endpoints";

// Auth API response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  // Tokens are stored in httpOnly cookies by backend
  data: {
    id: number;
    email: string;
    name: string;
    role: string;
    phone: string | null;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface RegisterResponse {
  // Tokens are stored in httpOnly cookies by backend
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string | null;
  };
}

// Auth API slice
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: ENDPOINTS.AUTH.LOGIN,
        method: "POST",
        body: credentials,
      }),
    }),

    // Register mutation
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: ENDPOINTS.AUTH.REGISTER,
        method: "POST",
        body: userData,
      }),
    }),

    // Logout mutation
    logout: builder.mutation<void, void>({
      query: () => ({
        url: ENDPOINTS.AUTH.LOGOUT,
        method: "POST",
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<LoginResponse["data"], void>({
      query: () => ENDPOINTS.AUTH.ME,
      providesTags: ["User"],
    }),

    // Refresh token - handled automatically by baseApi on 401
    // This endpoint is called internally, not exposed as a hook
    refreshToken: builder.mutation<void, void>({
      query: () => ({
        url: ENDPOINTS.AUTH.REFRESH,
        method: "POST",
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
} = authApi;

