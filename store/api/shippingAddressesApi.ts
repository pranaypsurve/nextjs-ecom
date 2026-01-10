import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/lib/endpoints";

// Shipping Address API request/response types
export interface ShippingAddress {
  id: number;
  userId?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  address_type: "home" | "work" | "other";
  label?: string;
  is_default: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShippingAddressRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  address_type: "home" | "work" | "other";
  label?: string;
  is_default?: boolean;
}

export interface UpdateShippingAddressRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  address_type?: "home" | "work" | "other";
  label?: string;
  is_default?: boolean;
}

// Shipping Addresses API slice
export const shippingAddressesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Shipping Addresses
    getShippingAddresses: builder.query<ShippingAddress[], { type?: "home" | "work" | "other" } | void>({
      query: (params) => {
        const queryParams = params?.type ? `?type=${params.type}` : "";
        return `${ENDPOINTS.SHIPPING_ADDRESSES.LIST}${queryParams}`;
      },
      providesTags: ["ShippingAddress"],
    }),

    // Get Single Shipping Address
    getShippingAddressById: builder.query<ShippingAddress, string | number>({
      query: (id) => ENDPOINTS.SHIPPING_ADDRESSES.DETAIL(id),
      providesTags: (result, error, id) => [{ type: "ShippingAddress", id }],
    }),

    // Create Shipping Address
    createShippingAddress: builder.mutation<ShippingAddress, CreateShippingAddressRequest>({
      query: (body) => ({
        url: ENDPOINTS.SHIPPING_ADDRESSES.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShippingAddress"],
    }),

    // Update Shipping Address
    updateShippingAddress: builder.mutation<
      ShippingAddress,
      { id: string | number; data: UpdateShippingAddressRequest }
    >({
      query: ({ id, data }) => ({
        url: ENDPOINTS.SHIPPING_ADDRESSES.UPDATE(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ShippingAddress", id }, "ShippingAddress"],
    }),

    // Delete Shipping Address
    deleteShippingAddress: builder.mutation<void, string | number>({
      query: (id) => ({
        url: ENDPOINTS.SHIPPING_ADDRESSES.DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["ShippingAddress"],
    }),

    // Set Default Shipping Address
    setDefaultShippingAddress: builder.mutation<ShippingAddress, string | number>({
      query: (id) => ({
        url: ENDPOINTS.SHIPPING_ADDRESSES.SET_DEFAULT(id),
        method: "PATCH",
      }),
      invalidatesTags: ["ShippingAddress"],
    }),

    // Get Default Address
    getDefaultShippingAddress: builder.query<ShippingAddress, void>({
      query: () => ENDPOINTS.SHIPPING_ADDRESSES.GET_DEFAULT,
      providesTags: ["ShippingAddress"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetShippingAddressesQuery,
  useGetShippingAddressByIdQuery,
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation,
  useDeleteShippingAddressMutation,
  useSetDefaultShippingAddressMutation,
  useGetDefaultShippingAddressQuery,
} = shippingAddressesApi;

