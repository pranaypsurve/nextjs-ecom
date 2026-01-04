import { baseApi } from "./baseApi";
import { ENDPOINTS, getEndpoint } from "@/lib/endpoints";
import type { Product } from "@/lib/data";

// Example API slice demonstrating reusable pattern
// This pattern can be extended for all other entities

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products
    getProducts: builder.query<
      { products: Product[]; total: number },
      { page?: number; limit?: number; categoryId?: string; search?: string }
    >({
      query: (params) => ({
        url: getEndpoint(ENDPOINTS.PRODUCTS.LIST),
        params,
      }),
      providesTags: ["Product"],
    }),

    // Get product by ID
    getProductById: builder.query<Product, string>({
      query: (id) => getEndpoint(ENDPOINTS.PRODUCTS.DETAIL(id)),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Get featured products
    getFeaturedProducts: builder.query<Product[], void>({
      query: () => getEndpoint(ENDPOINTS.PRODUCTS.FEATURED),
      providesTags: ["Product"],
    }),

    // Search products
    searchProducts: builder.query<Product[], string>({
      query: (searchTerm) => ({
        url: getEndpoint(ENDPOINTS.PRODUCTS.SEARCH),
        params: { q: searchTerm },
      }),
      providesTags: ["Product"],
    }),

    // Create product (Admin only)
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: getEndpoint(ENDPOINTS.PRODUCTS.LIST),
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    // Update product (Admin only)
    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: getEndpoint(ENDPOINTS.PRODUCTS.DETAIL(id)),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }, "Product"],
    }),

    // Delete product (Admin only)
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: getEndpoint(ENDPOINTS.PRODUCTS.DETAIL(id)),
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useSearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;

