/**
 * Cart Slice
 * 
 * Simplified cart structure - products are sold directly without variants
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  variantId: string; // NOTE: This is actually productId (kept as variantId for backward compatibility with existing cart items)
  quantity: number;
  price: number;
  // Display information
  productName: string;
  productImage: string;
  variantOptions?: Record<string, string>; // For display only (legacy field, not used)
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        variantId: string; // NOTE: This is actually productId
        quantity?: number;
        price: number;
        productName: string;
        productImage: string;
        variantOptions?: Record<string, string>; // Legacy field, not used
      }>
    ) => {
      const { variantId, quantity = 1, price, productName, productImage, variantOptions } = action.payload;

      // Find existing item by variantId (which is actually productId)
      const existingItem = state.items.find((item) => item.variantId === variantId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: `${variantId}-${Date.now()}`,
          variantId,
          quantity,
          price,
          productName,
          productImage,
          variantOptions,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((item) => item.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;

