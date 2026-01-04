import { baseApi } from "./baseApi";

// Gift Voucher API request/response types
export interface GiftVoucherResponse {
  id: string | number;
  code: string;
  amount: number;
  balance?: number;
  purchased_by_id?: number;
  assigned_to_id?: number;
  valid_from?: string;
  valid_until?: string;
  message?: string;
  is_active?: boolean;
  is_used?: boolean;
  created_at?: string;
  updated_at?: string;
  // Legacy fields (for backward compatibility)
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGiftVoucherRequest {
  amount: number;
  purchased_by_id?: number;
  assigned_to_id?: number;
  valid_from: string;
  valid_until: string;
  message?: string;
}

export interface UpdateGiftVoucherRequest {
  amount?: number;
  purchased_by_id?: number;
  assigned_to_id?: number;
  valid_from?: string;
  valid_until?: string;
  message?: string;
  is_active?: boolean;
}

// Gift Vouchers API slice
export const giftVouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Gift Vouchers (Admin Only)
    getGiftVouchers: builder.query<GiftVoucherResponse[], void>({
      query: () => "/gift-vouchers",
      providesTags: ["GiftCard"],
    }),

    // Get Gift Voucher by Code (Authenticated)
    getGiftVoucherByCode: builder.query<GiftVoucherResponse, string>({
      query: (code) => `/gift-vouchers/code/${code}`,
      providesTags: (result, error, code) => [{ type: "GiftCard", id: code }],
    }),

    // Get Single Gift Voucher (Admin Only)
    getGiftVoucherById: builder.query<GiftVoucherResponse, string | number>({
      query: (id) => `/gift-vouchers/${id}`,
      providesTags: (result, error, id) => [{ type: "GiftCard", id }],
    }),

    // Create Gift Voucher (Admin Only)
    createGiftVoucher: builder.mutation<GiftVoucherResponse, CreateGiftVoucherRequest>({
      query: (body) => ({
        url: "/gift-vouchers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GiftCard"],
    }),

    // Update Gift Voucher (Admin Only) - PATCH method
    updateGiftVoucher: builder.mutation<GiftVoucherResponse, { id: string | number; data: UpdateGiftVoucherRequest }>({
      query: ({ id, data }) => ({
        url: `/gift-vouchers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "GiftCard", id }, "GiftCard"],
    }),

    // Delete Gift Voucher (Admin Only)
    deleteGiftVoucher: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/gift-vouchers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GiftCard"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetGiftVouchersQuery,
  useGetGiftVoucherByCodeQuery,
  useGetGiftVoucherByIdQuery,
  useCreateGiftVoucherMutation,
  useUpdateGiftVoucherMutation,
  useDeleteGiftVoucherMutation,
} = giftVouchersApi;

