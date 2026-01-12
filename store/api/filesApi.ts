import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/lib/endpoints";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/constants";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * Files API - Handle file uploads, updates, and deletions
 */

// Upload File Response (matches actual API response)
export interface UploadFileResponse {
  status: string;
  message: string;
  data: {
    url: string;
    fileName: string;
  };
}

// Update File Response (matches actual API response)
export interface UpdateFileResponse {
  status: string;
  message: string;
  data: {
    url: string;
    fileName: string;
  };
}

// Delete File Response
export interface DeleteFileResponse {
  message: string;
}

// Custom base query for file uploads (multipart/form-data)
// This doesn't set Content-Type so browser can set it with boundary
const fileUploadBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // Include cookies for authentication
  // Don't set Content-Type - browser will set it with boundary for multipart/form-data
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

// Files API slice
export const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload a file
    uploadFile: builder.mutation<UploadFileResponse, File>({
      queryFn: async (file, api, extraOptions) => {
        const formData = new FormData();
        formData.append("file", file);

        const result = await fileUploadBaseQuery(
          {
            url: ENDPOINTS.FILES.UPLOAD,
            method: "POST",
            body: formData,
          },
          api,
          extraOptions
        );

        return result as { data: UploadFileResponse } | { error: FetchBaseQueryError };
      },
    }),

    // Update a file
    updateFile: builder.mutation<UpdateFileResponse, { filename: string; file: File }>({
      queryFn: async ({ filename, file }, api, extraOptions) => {
        const formData = new FormData();
        formData.append("file", file);

        const result = await fileUploadBaseQuery(
          {
            url: ENDPOINTS.FILES.UPDATE(filename),
            method: "PUT",
            body: formData,
          },
          api,
          extraOptions
        );

        return result as { data: UpdateFileResponse } | { error: FetchBaseQueryError };
      },
    }),

    // Delete a file
    deleteFile: builder.mutation<DeleteFileResponse, string>({
      query: (filename) => ({
        url: ENDPOINTS.FILES.DELETE(filename),
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useUploadFileMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
} = filesApi;

