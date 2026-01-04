"use client";

import { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Row, Col, Card, Button, Input, Select, Typography, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import ProductCard from "@/components/products/ProductCard";
import SkeletonLoader from "@/components/common/SkeletonLoader";
import type { Product } from "@/lib/data";

const { Title, Text } = Typography;
const { Search } = Input;

function ProductsContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filters from URL
  const categoryId = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryId);
  const [searchText, setSearchText] = useState(searchQuery);

  // Get data from API
  const { data: apiProducts = [], isLoading: productsLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  // Transform API products to match Product interface
  // API: price = original, discount_price = discounted
  // Product: price = current (discounted if available), originalPrice = original
  const products: Product[] = useMemo(() => {
    return apiProducts
      .filter((p) => p.is_active !== false)
      .map((p) => ({
        id: String(p.id),
        name: p.name,
        description: p.description,
        price: p.discount_price || p.price, // Use discount_price if available, else original price
        originalPrice: p.discount_price ? p.price : undefined, // Original price only if there's a discount
        images: p.images || [],
        categoryId: String(p.categoryId),
        stock: p.inventory_total,
        featured: false,
        rating: p.rating,
        reviews: p.reviews,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      }));
  }, [apiProducts]);

  const loading = productsLoading;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchText) params.set("search", searchText);
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [selectedCategory, searchText, router]);

  // Memoize filtered products to avoid infinite loops
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchText, products]);

  const handleAddToCart = useCallback((product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  }, [dispatch]);

  const categoryOptions = useMemo(() => [
    { value: undefined, label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ], [categories]);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
      <Title level={1} style={{ marginBottom: "32px" }}>
        Products
      </Title>

      {/* Filters */}
      <div style={{ marginBottom: "32px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <Search
          placeholder="Search products..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ flex: 1, minWidth: "200px" }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="Select Category"
          size="large"
          style={{ width: "200px" }}
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categoryOptions}
        />
      </div>

      {loading ? (
        <Row gutter={[24, 24]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <SkeletonLoader type="product" />
            </Col>
          ))}
        </Row>
      ) : filteredProducts.length === 0 ? (
        <Empty description="No products found" />
      ) : (
        <>
          <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>
            {filteredProducts.length} product(s) found
          </Text>
          <Row gutter={[24, 24]}>
            {filteredProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <SkeletonLoader type="product" count={8} />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
