import { baseApi } from "./baseApi";
import type { Order } from "@/lib/data";
import { ENDPOINTS } from "@/lib/endpoints";

// Order placement request types
export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface PlaceOrderRequest {
  items: OrderItem[];
  couponId?: number;
  shipping_cost?: number;
  shipping_address?: string;
  notes?: string;
}

export interface PlaceOrderResponse {
  status: boolean;
  message: string;
  data: Order;
}

export interface UpdateOrderRequest {
  status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_address?: string;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  trackingNumber?: string;
}

// Orders API slice
export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Order (Authenticated)
    placeOrder: builder.mutation<PlaceOrderResponse, PlaceOrderRequest>({
      query: (body) => ({
        url: ENDPOINTS.ORDERS.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "Cart"],
    }),

    // Get All Orders (Authenticated - Users see own, Admin sees all)
    getOrders: builder.query<Order[], void>({
      query: () => ENDPOINTS.ORDERS.LIST,
      providesTags: ["Order"],
    }),

    // Get My Orders (Authenticated)
    getMyOrders: builder.query<Order[], void>({
      query: () => ENDPOINTS.ORDERS.MY_ORDERS,
      providesTags: ["Order"],
    }),

    // Get Single Order (Authenticated)
    getOrderById: builder.query<Order, string | number>({
      query: (id) => ENDPOINTS.ORDERS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // Update Order (Admin Only)
    updateOrder: builder.mutation<Order, { id: string | number; data: UpdateOrderRequest }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.ORDERS.UPDATE(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }, "Order"],
    }),

    // Delete Order (Admin Only)
    deleteOrder: builder.mutation<void, string | number>({
      query: (id) => ({
        url: ENDPOINTS.ORDERS.DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  usePlaceOrderMutation,
  useGetOrdersQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;

