import { baseApi } from "./baseApi";
import type { Role } from "@/lib/constants";

// Auth API response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  accessToken: string;
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
  token: string;
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
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Register mutation
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    // Logout mutation
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<LoginResponse["data"], void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // Refresh token
    refreshToken: builder.mutation<{ token: string }, void>({
      query: () => ({
        url: "/auth/refresh",
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

