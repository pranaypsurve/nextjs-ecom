import { baseApi } from "./baseApi";
import type { Product } from "@/lib/data";
import { ENDPOINTS } from "@/lib/endpoints";

// Product API request/response types
export interface ProductResponse {
  id: string | number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  inventory_total: number;
  sku?: string;
  images: string[];
  is_active?: boolean;
  categoryId: number;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  reviews?: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  inventory_total: number;
  sku?: string;
  images?: string[];
  is_active?: boolean;
  categoryId: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  discount_price?: number;
  inventory_total?: number;
  sku?: string;
  images?: string[];
  is_active?: boolean;
  categoryId?: number;
}

// Products API slice
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products (Public)
    getProducts: builder.query<ProductResponse[], void>({
      query: () => ENDPOINTS.PRODUCTS.LIST,
      providesTags: ["Product"],
    }),

    // Get all products - Admin (Includes Inactive)
    getProductsAdmin: builder.query<ProductResponse[], void>({
      query: () => ENDPOINTS.PRODUCTS.LIST_ADMIN,
      providesTags: ["Product"],
    }),

    // Get single product
    getProductById: builder.query<ProductResponse, string | number>({
      query: (id) => ENDPOINTS.PRODUCTS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Create product (Admin Only)
    createProduct: builder.mutation<ProductResponse, CreateProductRequest>({
      query: (body) => ({
        url: ENDPOINTS.PRODUCTS.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    // Update product (Admin Only) - PATCH method
    updateProduct: builder.mutation<ProductResponse, { id: string | number; data: UpdateProductRequest }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.PRODUCTS.UPDATE(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }, "Product"],
    }),

    // Delete product (Admin Only)
    deleteProduct: builder.mutation<void, string | number>({
      query: (id) => ({
        url: ENDPOINTS.PRODUCTS.DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetProductsQuery,
  useGetProductsAdminQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;

