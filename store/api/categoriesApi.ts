import { baseApi } from "./baseApi";
import type { Category } from "@/lib/data";

// Category API request/response types
export interface CategoryResponse extends Category {
  is_active?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  image?: string;
  is_active?: boolean;
}

// Categories API slice
export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories (Public)
    getCategories: builder.query<CategoryResponse[], void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    // Get all categories - Admin (Includes Inactive)
    getCategoriesAdmin: builder.query<CategoryResponse[], void>({
      query: () => "/categories/admin",
      providesTags: ["Category"],
    }),

    // Get single category
    getCategoryById: builder.query<CategoryResponse, string | number>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    // Create category (Admin Only)
    createCategory: builder.mutation<CategoryResponse, CreateCategoryRequest>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    // Update category (Admin Only) - PATCH method
    updateCategory: builder.mutation<CategoryResponse, { id: string | number; data: UpdateCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Category", id }, "Category"],
    }),

    // Delete category (Admin Only)
    deleteCategory: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCategoriesQuery,
  useGetCategoriesAdminQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;

