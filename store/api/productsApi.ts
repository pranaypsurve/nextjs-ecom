import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/lib/endpoints";

/**
 * Products API - Simplified for basic product management
 */

// Product Response (matches API)
export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discount_price?: number;
  inventory: number;
  low_stock_threshold: number;
  color?: string;
  material?: string;
  image?: string; // Legacy single image (for backward compatibility)
  images?: string[]; // Array of product images (2-8 recommended)
  thumbnail?: string; // Single thumbnail for product display
  weight?: number;
  tags?: string[];
  is_on_sale: boolean;
  is_featured: boolean;
  is_returnable: boolean;
  average_rating: number;
  review_count: number;
  total_sold: number;
  status: "active" | "inactive" | "archived";
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
  updated_at: string;
}

// Admin Response (includes all fields)
export interface ProductAdminResponse extends ProductResponse {
  // All fields from ProductResponse
}

// Create Product Request
export interface CreateProductRequest {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discount_price?: number;
  inventory: number;
  low_stock_threshold?: number;
  color?: string;
  material?: string;
  image?: string; // Legacy single image (for backward compatibility)
  images?: string[]; // Array of product images (2-8 recommended)
  thumbnail?: string; // Single thumbnail for product display
  weight?: number;
  tags?: string[];
  is_on_sale?: boolean;
  is_featured?: boolean;
  is_returnable?: boolean;
  categoryId: string;
}

// Update Product Request
export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  price?: number;
  discount_price?: number;
  inventory?: number;
  low_stock_threshold?: number;
  color?: string;
  material?: string;
  image?: string; // Legacy single image (for backward compatibility)
  images?: string[]; // Array of product images (2-8 recommended)
  thumbnail?: string; // Single thumbnail for product display
  weight?: number;
  tags?: string[];
  is_on_sale?: boolean;
  is_featured?: boolean;
  is_returnable?: boolean;
  status?: "active" | "inactive" | "archived";
  categoryId?: string;
}

// Update Inventory Request
export interface UpdateInventoryRequest {
  quantity: number; // Positive to increase, negative to decrease
}

// Product List Query Parameters
export interface ProductListQueryParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  status?: "active" | "inactive" | "archived";
  page?: number;
  limit?: number;
}

// Products API slice
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products (Public) with filters
    getProducts: builder.query<ProductResponse[], ProductListQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.category) queryParams.append("category", params.category);
          if (params.minPrice) queryParams.append("minPrice", String(params.minPrice));
          if (params.maxPrice) queryParams.append("maxPrice", String(params.maxPrice));
          if (params.color) queryParams.append("color", params.color);
          if (params.status) queryParams.append("status", params.status);
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
        }
        const queryString = queryParams.toString();
        return `${ENDPOINTS.PRODUCTS.LIST}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Product"],
      // Force refetch on mount to get fresh data
      keepUnusedDataFor: 0,
    }),

    // Get all products - Admin (includes all statuses)
    getProductsAdmin: builder.query<ProductAdminResponse[], void>({
      query: () => ENDPOINTS.PRODUCTS.LIST_ADMIN,
      providesTags: ["Product"],
      // Force refetch on mount to get fresh data
      keepUnusedDataFor: 0,
    }),

    // Get single product by ID
    getProductById: builder.query<ProductResponse, string>({
      query: (id) => ENDPOINTS.PRODUCTS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Get product by slug
    getProductBySlug: builder.query<ProductResponse, string>({
      query: (slug) => ENDPOINTS.PRODUCTS.BY_SLUG(slug),
      providesTags: (result, error, slug) => [{ type: "Product", id: slug }],
    }),

    // Create product (Admin Only)
    createProduct: builder.mutation<ProductResponse, CreateProductRequest>({
      query: (body) => ({
        url: ENDPOINTS.PRODUCTS.CREATE,
        method: "POST",
        body,
      }),
      // Invalidate all Product queries to force refetch everywhere
      invalidatesTags: (result, error) => {
        if (error) return [];
        // Invalidate all Product tags to force refetch on all clients
        return [{ type: "Product" }, { type: "Product", id: "LIST" }];
      },
    }),

    // Update product (Admin Only)
    updateProduct: builder.mutation<ProductResponse, { id: string; data: UpdateProductRequest }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.PRODUCTS.UPDATE(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }, "Product"],
    }),

    // Update inventory (Admin Only)
    updateInventory: builder.mutation<ProductResponse, { id: string; data: UpdateInventoryRequest }>({
      query: ({ id, data }) => ({
        url: `${ENDPOINTS.PRODUCTS.DETAIL(id)}/inventory`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }, "Product"],
    }),

    // Delete product (Admin Only)
    deleteProduct: builder.mutation<void, string>({
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
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateInventoryMutation,
  useDeleteProductMutation,
} = productsApi;
