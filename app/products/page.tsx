"use client";

import { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Row,
  Col,
  Input,
  Select,
  Typography,
  Empty,
  Slider,
  Space,
  Badge,
  Button,
  Drawer,
  Tag,
  Card,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  StarFilled,
  FireOutlined,
} from "@ant-design/icons";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import ProductCard from "@/components/products/ProductCard";
import SkeletonLoader from "@/components/common/SkeletonLoader";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/lib/data";

const { Title, Text } = Typography;
const { Search } = Input;

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "rating-desc";

function ProductsContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filters from URL
  const categoryId = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryId);
  const [searchText, setSearchText] = useState(searchQuery);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get data from API
  const { data: apiProducts = [], isLoading: productsLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  // Transform API products to match Product interface
  const products: Product[] = useMemo(() => {
    return apiProducts
      .filter((p) => p.is_active !== false)
      .map((p) => ({
        id: String(p.id),
        name: p.name,
        description: p.description,
        price: p.discount_price || p.price,
        originalPrice: p.discount_price ? p.price : undefined,
        images: p.images || [],
        categoryId: String(p.categoryId),
        stock: p.inventory_total,
        featured: false,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      }));
  }, [apiProducts]);

  // Calculate price range from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100000;
    return Math.max(...products.map((p) => p.originalPrice || p.price), 100000);
  }, [products]);

  // Update price range when products change
  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === 100000) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  const loading = productsLoading;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchText) params.set("search", searchText);
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [selectedCategory, searchText, router]);

  // Memoize filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    // Search filter
    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const productPrice = p.originalPrice || p.price;
      return productPrice >= priceRange[0] && productPrice <= priceRange[1];
    });

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => (a.originalPrice || a.price) - (b.originalPrice || b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.originalPrice || b.price) - (a.originalPrice || a.price));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating-desc":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [selectedCategory, searchText, priceRange, sortBy, products]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      dispatch(addToCart({ product, quantity: 1 }));
    },
    [dispatch]
  );

  const categoryOptions = useMemo(
    () => [
      { value: undefined, label: "All Categories" },
      ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
    ],
    [categories]
  );

  const sortOptions = [
    { value: "default", label: "Default" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "rating-desc", label: "Highest Rated" },
  ];

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (searchText ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="products-page">
      <style jsx>{`
        .products-page {
          min-height: calc(100vh - 64px);
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
        }
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 24px;
          text-align: center;
          color: white;
          margin-bottom: 40px;
        }
        .hero-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .hero-subtitle {
          font-size: 18px;
          opacity: 0.95;
          margin-bottom: 32px;
        }
        .search-container {
          max-width: 600px;
          margin: 0 auto;
        }
        .filters-bar {
          background: white;
          padding: 20px 24px;
          border-bottom: 1px solid #e8e8e8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          position: sticky;
          top: 64px;
          z-index: 100;
        }
        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        .filter-sidebar {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }
        .products-grid {
          margin-top: 24px;
        }
        .product-count {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .view-toggle {
          display: flex;
          gap: 8px;
          margin-left: auto;
        }
        .category-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }
        .category-tag {
          cursor: pointer;
          transition: all 0.3s;
          padding: 8px 16px;
          border-radius: 20px;
        }
        .category-tag:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .category-tag.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 32px;
          }
          .filters-bar {
            top: 0;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-title">Discover Amazing Products</div>
        <div className="hero-subtitle">
          Find exactly what you're looking for with our curated collection
        </div>
        <div className="search-container">
          <Search
            placeholder="Search for products, brands, or categories..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              borderRadius: "50px",
            }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Space size="middle" wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <Space size="middle" wrap>
              <Button
                type={showFilters ? "primary" : "default"}
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Badge count={activeFiltersCount} offset={[8, -2]} />
                )}
              </Button>
              <Select
                placeholder="Sort by"
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 180 }}
                options={sortOptions}
              />
              <Text type="secondary">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
              </Text>
            </Space>
            <div className="view-toggle">
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode("grid")}
              />
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode("list")}
              />
            </div>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="content-wrapper">
        <Row gutter={[24, 24]}>
          {/* Filter Sidebar */}
          {showFilters && (
            <Col xs={24} lg={6}>
              <div className="filter-sidebar">
                <Title level={5} style={{ marginBottom: 20 }}>
                  <FilterOutlined /> Filters
                </Title>

                {/* Category Filter */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: "block", marginBottom: 12 }}>
                    Categories
                  </Text>
                  <div className="category-tags">
                    <Tag
                      className={`category-tag ${!selectedCategory ? "active" : ""}`}
                      onClick={() => setSelectedCategory(undefined)}
                    >
                      All
                    </Tag>
                    {categories.map((cat) => (
                      <Tag
                        key={cat.id}
                        className={`category-tag ${selectedCategory === String(cat.id) ? "active" : ""}`}
                        onClick={() => setSelectedCategory(String(cat.id))}
                      >
                        {cat.name}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: "block", marginBottom: 12 }}>
                    Price Range
                  </Text>
                  <Slider
                    range
                    min={0}
                    max={maxPrice}
                    value={priceRange}
                    onChange={(value) => setPriceRange(value as [number, number])}
                    tooltip={{ formatter: (value) => formatCurrency(value || 0) }}
                  />
                  <Space style={{ width: "100%", justifyContent: "space-between", marginTop: 8 }}>
                    <Text type="secondary">{formatCurrency(priceRange[0])}</Text>
                    <Text type="secondary">{formatCurrency(priceRange[1])}</Text>
                  </Space>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    block
                    onClick={() => {
                      setSelectedCategory(undefined);
                      setSearchText("");
                      setPriceRange([0, maxPrice]);
                      setSortBy("default");
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </Col>
          )}

          {/* Products Grid */}
          <Col xs={24} lg={showFilters ? 18 : 24}>
            {loading ? (
              <Row gutter={[24, 24]}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <SkeletonLoader type="product" />
                  </Col>
                ))}
              </Row>
            ) : filteredProducts.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "60px 20px" }}>
                <Empty
                  description={
                    <div>
                      <Text strong style={{ fontSize: 18, display: "block", marginBottom: 8 }}>
                        No products found
                      </Text>
                      <Text type="secondary">
                        Try adjusting your filters or search terms
                      </Text>
                    </div>
                  }
                />
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                {filteredProducts.map((product) => (
                  <Col
                    xs={24}
                    sm={12}
                    md={viewMode === "list" ? 24 : 8}
                    lg={viewMode === "list" ? 24 : showFilters ? 8 : 6}
                    key={product.id}
                  >
                    <ProductCard product={product} onAddToCart={handleAddToCart} viewMode={viewMode} />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
          <SkeletonLoader type="product" count={8} />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
