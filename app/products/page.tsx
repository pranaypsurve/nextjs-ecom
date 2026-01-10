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
  Card,
  Tag,
  Collapse,
  Rate,
  Divider,
  Segmented,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  StarFilled,
  FireOutlined,
  ThunderboltOutlined,
  ClearOutlined,
  TagsOutlined,
  DollarOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useRouter as useNextRouter } from "next/navigation";
import { useGetProductsQuery, type ProductResponse } from "@/store/api/productsApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import ProductCard from "@/components/products/ProductCard";
import SkeletonLoader from "@/components/common/SkeletonLoader";
import { formatCurrency } from "@/lib/utils/currency";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "rating-desc" | "newest" | "bestseller";

function ProductsContent() {
  const nextRouter = useNextRouter();
  const searchParams = useSearchParams();

  // Get filters from URL
  const categoryId = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryId);
  const [searchText, setSearchText] = useState(searchQuery);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [showOnSale, setShowOnSale] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);

  // Get data from API
  const { data: apiProducts = [], isLoading: productsLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  // Filter active products
  const products: ProductResponse[] = useMemo(() => {
    return apiProducts.filter((p) => p.status === "active");
  }, [apiProducts]);

  // Calculate price range from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100000;
    const prices = products.map((p) => p.discount_price || p.price);
    return Math.max(...prices, 100000);
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
    nextRouter.replace(`/products?${params.toString()}`, { scroll: false });
  }, [selectedCategory, searchText, nextRouter]);

  // Get all category IDs including subcategories for a main category
  const getCategoryIdsIncludingSubcategories = useCallback((categoryId: string): string[] => {
    const categoryIds = [categoryId];
    
    // Find the category to check if it has children
    const category = categories.find((c) => String(c.id) === categoryId);
    
    // If this is a main category with children, add all subcategory IDs
    if (category && !category.parentId && category.children) {
      category.children.forEach((child) => {
        categoryIds.push(String(child.id));
      });
    }
    
    // Also check for subcategories with this parentId (in case children array is not populated)
    const subcategories = categories.filter(
      (c) => c.parentId && String(c.parentId) === categoryId
    );
    subcategories.forEach((sub) => {
      if (!categoryIds.includes(String(sub.id))) {
        categoryIds.push(String(sub.id));
      }
    });
    
    return categoryIds;
  }, [categories]);

  // Memoize filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter (including subcategories)
    if (selectedCategory) {
      const categoryIdsToInclude = getCategoryIdsIncludingSubcategories(selectedCategory);
      filtered = filtered.filter((p) => 
        categoryIdsToInclude.includes(String(p.categoryId))
      );
    }

    // Search filter
    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const price = p.discount_price || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Rating filter
    if (selectedRating) {
      filtered = filtered.filter((p) => p.average_rating >= selectedRating);
    }

    // On Sale filter
    if (showOnSale) {
      filtered = filtered.filter((p) => p.is_on_sale);
    }

    // Featured filter
    if (showFeatured) {
      filtered = filtered.filter((p) => p.is_featured);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating-desc":
        sorted.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "bestseller":
        sorted.sort((a, b) => b.total_sold - a.total_sold);
        break;
      default:
        break;
    }

    return sorted;
  }, [selectedCategory, searchText, priceRange, sortBy, products, selectedRating, showOnSale, showFeatured, getCategoryIdsIncludingSubcategories]);

  const sortOptions = [
    { value: "default", label: "Default Sorting" },
    { value: "newest", label: "🆕 Newest First" },
    { value: "bestseller", label: "🔥 Best Sellers" },
    { value: "price-asc", label: "💰 Price: Low to High" },
    { value: "price-desc", label: "💎 Price: High to Low" },
    { value: "name-asc", label: "🔤 Name: A to Z" },
    { value: "name-desc", label: "🔤 Name: Z to A" },
    { value: "rating-desc", label: "⭐ Highest Rated" },
  ];

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (searchText ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) +
    (selectedRating ? 1 : 0) +
    (showOnSale ? 1 : 0) +
    (showFeatured ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory(undefined);
    setSearchText("");
    setPriceRange([0, maxPrice]);
    setSortBy("default");
    setSelectedRating(undefined);
    setShowOnSale(false);
    setShowFeatured(false);
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: filteredProducts.length,
      onSale: products.filter((p) => p.is_on_sale).length,
      featured: products.filter((p) => p.is_featured).length,
      avgPrice:
        filteredProducts.reduce((sum, p) => sum + (p.discount_price || p.price), 0) /
        (filteredProducts.length || 1),
    };
  }, [filteredProducts, products]);

  return (
    <div className="products-page">
      <style jsx global>{`
        .products-page {
          min-height: calc(100vh - 64px);
          background: #f5f5f5;
        }

        .hero-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 24px 60px;
          position: relative;
          overflow: hidden;
        }

        .hero-banner::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .hero-content {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .search-box {
          max-width: 700px;
          margin: 32px auto 0;
        }

        .quick-filters {
          background: white;
          padding: 20px 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          margin: -30px auto 32px;
          max-width: 1400px;
          position: relative;
          z-index: 10;
        }

        .filters-sidebar {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 80px;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
        }

        .filters-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .filters-sidebar::-webkit-scrollbar-thumb {
          background: #d9d9d9;
          border-radius: 3px;
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px 40px;
        }

        .filter-tag {
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid #e8e8e8;
          padding: 8px 16px;
          border-radius: 8px;
          background: white;
        }

        .filter-tag:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .filter-tag.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .stats-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }

        .rating-filter {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rating-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #f0f0f0;
        }

        .rating-option:hover {
          background: #f5f5f5;
          border-color: #667eea;
        }

        .rating-option.active {
          background: #f0f5ff;
          border-color: #667eea;
        }

        @media (max-width: 768px) {
          .hero-banner {
            padding: 60px 16px 40px;
          }

          .quick-filters {
            margin: -20px 16px 24px;
          }

          .filters-sidebar {
            position: static;
            max-height: none;
            margin-bottom: 24px;
          }
        }
      `}</style>

      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div style={{ textAlign: "center", color: "white" }}>
            <Badge
              count={`${stats.total} Products`}
              style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 14, padding: "4px 12px" }}
            />
            <Title level={1} style={{ color: "white", marginTop: 16, marginBottom: 8, fontSize: 48, fontWeight: 800 }}>
              Shop Our Collection
            </Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.95)", fontSize: 18, marginBottom: 0 }}>
              Discover amazing products with exclusive deals and premium quality
            </Paragraph>
          </div>

          {/* Search Box */}
          <div className="search-box">
            <Search
              placeholder="Search products, brands, categories..."
              allowClear
              enterButton={
                <Button type="primary" style={{ background: "white", color: "#667eea", border: "none" }}>
                  <SearchOutlined /> Search
                </Button>
              }
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 50, overflow: "hidden" }}
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div style={{ padding: "0 24px" }}>
        <div className="quick-filters">
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Space size="middle" wrap>
                <Tooltip title="Show only sale items">
                  <Tag
                    icon={<FireOutlined />}
                    color={showOnSale ? "red" : "default"}
                    style={{ cursor: "pointer", padding: "6px 16px", fontSize: 14 }}
                    onClick={() => setShowOnSale(!showOnSale)}
                  >
                    On Sale {stats.onSale > 0 && `(${stats.onSale})`}
                  </Tag>
                </Tooltip>
                <Tooltip title="Show featured products">
                  <Tag
                    icon={<StarFilled />}
                    color={showFeatured ? "gold" : "default"}
                    style={{ cursor: "pointer", padding: "6px 16px", fontSize: 14 }}
                    onClick={() => setShowFeatured(!showFeatured)}
                  >
                    Featured {stats.featured > 0 && `(${stats.featured})`}
                  </Tag>
                </Tooltip>
                <Tag icon={<DollarOutlined />} style={{ padding: "6px 16px", fontSize: 14 }}>
                  Avg: {formatCurrency(stats.avgPrice)}
                </Tag>
              </Space>
            </Col>
            <Col>
              <Space>
                <Select
                  placeholder="Sort by"
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 200 }}
                  size="large"
                  options={sortOptions}
                />
                <Segmented
                  value={viewMode}
                  onChange={(value) => setViewMode(value as "grid" | "list")}
                  size="large"
                  options={[
                    { value: "grid", icon: <AppstoreOutlined /> },
                    { value: "list", icon: <UnorderedListOutlined /> },
                  ]}
                />
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        <Row gutter={[24, 24]}>
          {/* Filters Sidebar */}
          <Col xs={24} lg={6}>
            <div className="filters-sidebar">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0 }}>
                  <FilterOutlined /> Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      count={activeFiltersCount}
                      style={{ marginLeft: 8, background: "#667eea" }}
                    />
                  )}
                </Title>
                {activeFiltersCount > 0 && (
                  <Button
                    type="link"
                    danger
                    icon={<ClearOutlined />}
                    onClick={clearAllFilters}
                    size="small"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <Collapse
                defaultActiveKey={["categories", "price", "rating"]}
                ghost
                expandIconPlacement="end"
                items={[
                  {
                    key: "categories",
                    label: <Text strong><TagsOutlined /> Categories</Text>,
                    children: (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <Tag
                          className={`filter-tag ${!selectedCategory ? "active" : ""}`}
                          onClick={() => setSelectedCategory(undefined)}
                        >
                          <ShopOutlined /> All Products ({products.length})
                        </Tag>
                        {categories
                          .filter((cat) => !cat.parentId) // Only show main categories
                          .map((mainCat) => {
                            // Get all category IDs including subcategories
                            const categoryIds = getCategoryIdsIncludingSubcategories(String(mainCat.id));
                            const count = products.filter((p) => 
                              categoryIds.includes(String(p.categoryId))
                            ).length;
                            
                            // Get subcategories for this main category
                            const subcategories = categories.filter(
                              (c) => c.parentId && String(c.parentId) === String(mainCat.id)
                            );
                            
                            return (
                              <div key={mainCat.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <Tag
                                  className={`filter-tag ${selectedCategory === String(mainCat.id) ? "active" : ""}`}
                                  onClick={() => setSelectedCategory(String(mainCat.id))}
                                  style={{ 
                                    fontWeight: 600,
                                    marginBottom: subcategories.length > 0 ? 4 : 0
                                  }}
                                >
                                  {mainCat.name} ({count})
                                </Tag>
                                {subcategories.length > 0 && (
                                  <div style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                                    {subcategories.map((subCat) => {
                                      const subCount = products.filter((p) => 
                                        String(p.categoryId) === String(subCat.id)
                                      ).length;
                                      return (
                                        <Tag
                                          key={subCat.id}
                                          className={`filter-tag ${selectedCategory === String(subCat.id) ? "active" : ""}`}
                                          onClick={() => setSelectedCategory(String(subCat.id))}
                                          style={{ 
                                            fontSize: 13,
                                            padding: "6px 12px",
                                            marginLeft: 8
                                          }}
                                        >
                                          └ {subCat.name} ({subCount})
                                        </Tag>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ),
                  },
                  {
                    key: "price",
                    label: <Text strong><DollarOutlined /> Price Range</Text>,
                    children: (
                      <div style={{ padding: "16px 8px" }}>
                        <Slider
                          range
                          min={0}
                          max={maxPrice}
                          value={priceRange}
                          onChange={(value) => setPriceRange(value as [number, number])}
                          tooltip={{ formatter: (value) => formatCurrency(value || 0) }}
                          styles={{
                            track: { background: "linear-gradient(90deg, #667eea, #764ba2)" },
                          }}
                        />
                        <Space style={{ width: "100%", justifyContent: "space-between", marginTop: 12 }}>
                          <Text strong style={{ color: "#667eea" }}>{formatCurrency(priceRange[0])}</Text>
                          <Text strong style={{ color: "#667eea" }}>{formatCurrency(priceRange[1])}</Text>
                        </Space>
                      </div>
                    ),
                  },
                  {
                    key: "rating",
                    label: <Text strong><StarFilled /> Rating</Text>,
                    children: (
                      <div className="rating-filter">
                        <div
                          className={`rating-option ${!selectedRating ? "active" : ""}`}
                          onClick={() => setSelectedRating(undefined)}
                        >
                          <Text>All Ratings</Text>
                        </div>
                        {[4, 3, 2, 1].map((rating) => (
                          <div
                            key={rating}
                            className={`rating-option ${selectedRating === rating ? "active" : ""}`}
                            onClick={() => setSelectedRating(rating)}
                          >
                            <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
                            <Text type="secondary">& up</Text>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                ]}
              />

              <Divider />

              {/* Product Count */}
              <div style={{ textAlign: "center" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Showing <Text strong style={{ color: "#667eea" }}>{filteredProducts.length}</Text> of{" "}
                  <Text strong>{products.length}</Text> products
                </Text>
              </div>
            </div>
          </Col>

          {/* Products Grid */}
          <Col xs={24} lg={18}>
            {loading ? (
              <Row gutter={[24, 24]}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <Col xs={24} sm={12} md={viewMode === "list" ? 24 : 8} key={index}>
                    <SkeletonLoader type="product" />
                  </Col>
                ))}
              </Row>
            ) : filteredProducts.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "80px 20px", borderRadius: 12 }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text strong style={{ fontSize: 20, display: "block", marginBottom: 12 }}>
                        No products found
                      </Text>
                      <Text type="secondary" style={{ fontSize: 16 }}>
                        Try adjusting your filters or search terms
                      </Text>
                    </div>
                  }
                >
                  <Button type="primary" size="large" onClick={clearAllFilters} style={{ marginTop: 16 }}>
                    Clear All Filters
                  </Button>
                </Empty>
              </Card>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {filteredProducts.map((product) => (
                    <Col
                      xs={24}
                      sm={12}
                      md={viewMode === "list" ? 24 : 8}
                      key={product.id}
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </Col>
                  ))}
                </Row>

                {/* Load More or Pagination can be added here */}
                {filteredProducts.length > 0 && (
                  <div style={{ textAlign: "center", marginTop: 40 }}>
                    <Text type="secondary">
                      Showing all {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                    </Text>
                  </div>
                )}
              </>
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
        <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
          <Row gutter={[24, 24]}>
            {Array.from({ length: 12 }).map((_, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <SkeletonLoader type="product" />
              </Col>
            ))}
          </Row>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
