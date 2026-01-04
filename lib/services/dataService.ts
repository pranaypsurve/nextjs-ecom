// Service to handle JSON data operations
// This will be replaced with API calls in the future

import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import couponsData from "@/data/coupons.json";
import giftCardsData from "@/data/giftCards.json";
import type { Product, Category, Coupon } from "@/lib/data";

export const dataService = {
  // Products
  getProducts: (): Product[] => {
    return productsData as Product[];
  },
  
  getProductById: (id: string): Product | undefined => {
    return productsData.find((p) => p.id === id) as Product | undefined;
  },
  
  getFeaturedProducts: (): Product[] => {
    return productsData.filter((p) => p.featured) as Product[];
  },
  
  searchProducts: (query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return productsData.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    ) as Product[];
  },
  
  // Categories
  getCategories: (): Category[] => {
    return categoriesData as Category[];
  },
  
  getCategoryById: (id: string): Category | undefined => {
    return categoriesData.find((c) => c.id === id) as Category | undefined;
  },
  
  // Coupons
  getCoupons: (): Coupon[] => {
    return couponsData as Coupon[];
  },
  
  getCouponByCode: (code: string): Coupon | undefined => {
    return couponsData.find((c) => c.code === code && c.isActive) as Coupon | undefined;
  },
  
  // Gift Cards
  getGiftCards: () => {
    return giftCardsData;
  },
};

