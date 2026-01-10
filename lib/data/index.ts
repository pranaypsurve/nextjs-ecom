// JSON Data Structure for initial data management
// This will be replaced with API calls in the future

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  subCategoryId?: string;
  stock: number;
  featured: boolean;
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null; // null for top-level categories
  createdAt: string;
  updatedAt: string;
  children?: Category[]; // Subcategories (for nested display)
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  couponCode?: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface Address {
  id: string;
  userId: string;
  type: "shipping" | "billing" | "both";
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "card" | "paypal" | "bank";
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
}

// Initial data (for development/testing)
export const initialData = {
  products: [] as Product[],
  categories: [] as Category[],
  orders: [] as Order[],
  coupons: [] as Coupon[],
};

