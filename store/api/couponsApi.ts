import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/lib/endpoints";

// Coupon API request/response types
export interface CouponResponse {
  id: string | number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  condition_type?: "products" | "categories" | "all";
  applicable_product_ids?: number[];
  applicable_category_ids?: number[];
  minimum_amount?: number;
  maximum_discount?: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  is_active?: boolean;
  // Legacy fields (for backward compatibility)
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface CreateCouponRequest {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  condition_type: "products" | "categories" | "all";
  applicable_product_ids?: number[];
  applicable_category_ids?: number[];
  minimum_amount?: number;
  maximum_discount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  is_active?: boolean;
}

export interface UpdateCouponRequest {
  code?: string;
  type?: "percentage" | "fixed";
  value?: number;
  condition_type?: "products" | "categories" | "all";
  applicable_product_ids?: number[];
  applicable_category_ids?: number[];
  minimum_amount?: number;
  maximum_discount?: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  is_active?: boolean;
}

// Coupons API slice
export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Coupons (Public - Active Only)
    getCoupons: builder.query<CouponResponse[], void>({
      query: () => ENDPOINTS.COUPONS.LIST,
      providesTags: ["Coupon"],
    }),

    // Get All Coupons - Admin (Includes Inactive)
    getCouponsAdmin: builder.query<CouponResponse[], void>({
      query: () => ENDPOINTS.COUPONS.LIST_ADMIN,
      providesTags: ["Coupon"],
    }),

    // Get Coupon by Code (Public)
    getCouponByCode: builder.query<CouponResponse, string>({
      query: (code) => ENDPOINTS.COUPONS.BY_CODE(code),
      providesTags: (result, error, code) => [{ type: "Coupon", id: code }],
    }),

    // Get Single Coupon
    getCouponById: builder.query<CouponResponse, string | number>({
      query: (id) => ENDPOINTS.COUPONS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: "Coupon", id }],
    }),

    // Create Coupon (Admin Only)
    createCoupon: builder.mutation<CouponResponse, CreateCouponRequest>({
      query: (body) => ({
        url: ENDPOINTS.COUPONS.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupon"],
    }),

    // Update Coupon (Admin Only) - PATCH method
    updateCoupon: builder.mutation<CouponResponse, { id: string | number; data: UpdateCouponRequest }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.COUPONS.UPDATE(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Coupon", id }, "Coupon"],
    }),

    // Delete Coupon (Admin Only)
    deleteCoupon: builder.mutation<void, string | number>({
      query: (id) => ({
        url: ENDPOINTS.COUPONS.DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCouponsQuery,
  useGetCouponsAdminQuery,
  useGetCouponByCodeQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;

