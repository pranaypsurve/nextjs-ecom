import { baseApi } from "./baseApi";
import type { User } from "@/store/slices/authSlice";
import { Role } from "@/lib/constants";
import { ENDPOINTS } from "@/lib/endpoints";

// User API request/response types
export interface UserResponse extends User {
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  email?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Users API slice
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get My Profile (Authenticated)
    getMyProfile: builder.query<UserResponse, void>({
      query: () => ENDPOINTS.USERS.ME,
      providesTags: ["User"],
    }),

    // Get All Users (Admin Only)
    getUsers: builder.query<UserResponse[], void>({
      query: () => ENDPOINTS.USERS.LIST,
      providesTags: ["User"],
    }),

    // Get Single User (Admin or Own Profile)
    getUserById: builder.query<UserResponse, string | number>({
      query: (id) => ENDPOINTS.USERS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Update User Profile (Authenticated - Own Profile)
    updateMyProfile: builder.mutation<UserResponse, UpdateUserProfileRequest>({
      query: (body) => ({
        url: ENDPOINTS.USERS.ME,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // Update User (Admin Only)
    updateUser: builder.mutation<UserResponse, { id: string | number; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.USERS.UPDATE(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }, "User"],
    }),

    // Delete User (Admin Only)
    deleteUser: builder.mutation<void, string | number>({
      query: (id) => ({
        url: ENDPOINTS.USERS.DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Change Password (Authenticated)
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url: ENDPOINTS.USERS.ME_PASSWORD,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetMyProfileQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateMyProfileMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
} = usersApi;

