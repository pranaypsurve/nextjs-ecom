"use client";

import { useMemo } from "react";
import { Row, Col, Card, Button, Typography, Spin, Badge, Tag, Statistic } from "antd";
import {
  ShoppingOutlined,
  FireOutlined,
  StarOutlined,
  TrophyOutlined,
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useGetProductsQuery, type ProductResponse } from "@/store/api/productsApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import ProductCard from "@/components/products/ProductCard";

const { Title, Text, Paragraph } = Typography;

// Configuration constants
const PRODUCT_CONFIG = {
  NEW_ARRIVALS_DAYS: 15, // Products published in last N days appear in New Arrivals
  NEW_BADGE_DAYS: 15, // "NEW" badge shows for N days after publication
} as const;

export default function Home() {
  // Get data from API
  const { data: allProducts = [], isLoading: productsLoading } = useGetProductsQuery();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();

  // Filter different product sections
  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.is_featured && p.status === "active").slice(0, 8),
    [allProducts]
  );

  const onSaleProducts = useMemo(
    () => allProducts.filter((p) => p.is_on_sale && p.status === "active").slice(0, 8),
    [allProducts]
  );

  /**
   * Get the published date of a product
   * Priority: published_at > created_at (when status is active)
   * This handles the case where a product is created but published/activated later
   */
  const getPublishedDate = (product: ProductResponse): Date | null => {
    if (product.published_at) {
      return new Date(product.published_at);
    }
    if (product.status === "active" && product.created_at) {
      return new Date(product.created_at);
    }
    return null;
  };

  /**
   * Calculate days since product was published
   */
  const getDaysSincePublished = (product: ProductResponse): number | null => {
    const publishedDate = getPublishedDate(product);
    if (!publishedDate) return null;
    
    const now = new Date();
    return Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  /**
   * Check if product was published within specified days
   * @param product - Product to check
   * @param days - Number of days to check (default: NEW_ARRIVALS_DAYS)
   */
  const isPublishedWithinDays = (product: ProductResponse, days: number = PRODUCT_CONFIG.NEW_ARRIVALS_DAYS): boolean => {
    const daysSincePublished = getDaysSincePublished(product);
    if (daysSincePublished === null) return false;
    
    return daysSincePublished <= days && daysSincePublished >= 0;
  };

  /**
   * Check if product is "New" (within configured days of publishedAt)
   * A product is "New" for configured days after publishedAt, after that badge disappears
   */
  const isProductNew = (product: ProductResponse): boolean => {
    return isPublishedWithinDays(product, PRODUCT_CONFIG.NEW_BADGE_DAYS);
  };

  const topSellers = useMemo(
    () => 
      [...allProducts]
        .filter((p) => p.status === "active" && p.total_sold > 0)
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 8),
    [allProducts]
  );

  const newArrivals = useMemo(
    () =>
      [...allProducts]
        .filter((p) => p.status === "active" && isPublishedWithinDays(p, PRODUCT_CONFIG.NEW_ARRIVALS_DAYS))
        .sort((a, b) => {
          const dateA = getPublishedDate(a);
          const dateB = getPublishedDate(b);
          
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 8),
    [allProducts]
  );

  const loading = productsLoading || categoriesLoading;

  // Calculate stats
  const stats = useMemo(() => {
    const activeProducts = allProducts.filter((p) => p.status === "active");
    const avgRating =
      activeProducts.reduce((sum, p) => sum + (p.average_rating || 0), 0) / (activeProducts.length || 1);
    const totalReviews = activeProducts.reduce((sum, p) => sum + (p.review_count || 0), 0);
    return {
      totalProducts: activeProducts.length,
      onSaleCount: onSaleProducts.length,
      avgRating: avgRating.toFixed(1),
      totalReviews,
    };
  }, [allProducts, onSaleProducts]);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "calc(100vh - 64px)" }}>
      <style jsx global>{`
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.4;
        }

        .feature-card {
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
        }

        .category-card {
          transition: all 0.3s ease;
          border: none;
          overflow: hidden;
        }

        .category-card:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .section-title {
          position: relative;
          display: inline-block;
          padding-bottom: 16px;
        }

        .section-title::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
        }

        .sale-badge {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 32px !important;
          }
          .hero-content p {
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-section" style={{ padding: "100px 24px 80px", position: "relative" }}>
        <div className="hero-content" style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center" }}>
            <Badge.Ribbon text="New Collection" color="red" style={{ fontSize: "14px" }}>
              <div style={{ paddingTop: "20px" }}>
                <Title level={1} style={{ color: "#fff", marginBottom: "16px", fontSize: "56px", fontWeight: 800 }}>
                  Discover Amazing Products
                </Title>
              </div>
            </Badge.Ribbon>
            <Paragraph style={{ color: "#fff", fontSize: "20px", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>
              Shop the latest trends with exclusive deals and unbeatable quality. Find your perfect style today!
            </Paragraph>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/products">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  style={{
                    background: "#fff",
                    color: "#667eea",
                    border: "none",
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: "0 32px",
                  }}
                >
                  Shop Now
                </Button>
              </Link>
              {onSaleProducts.length > 0 && (
                <Link href="/products">
                  <Button
                    size="large"
                    icon={<FireOutlined />}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      border: "2px solid #fff",
                      height: 48,
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 8,
                      padding: "0 32px",
                    }}
                  >
                    View Sale Items
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section style={{ padding: "40px 24px", maxWidth: "1200px", margin: "-40px auto 0", position: "relative", zIndex: 2 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <ShoppingOutlined style={{ fontSize: 32, color: "#667eea", marginBottom: 8 }} />
              <Statistic title="Products Available" value={stats.totalProducts} styles={{ content: { color: "#667eea", fontWeight: 700 } }} />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <FireOutlined style={{ fontSize: 32, color: "#ff4d4f", marginBottom: 8 }} />
              <Statistic title="Items On Sale" value={stats.onSaleCount} styles={{ content: { color: "#ff4d4f", fontWeight: 700 } }} />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <StarOutlined style={{ fontSize: 32, color: "#faad14", marginBottom: 8 }} />
              <Statistic
                title="Average Rating"
                value={stats.avgRating}
                suffix="/ 5.0"
                styles={{ content: { color: "#faad14", fontWeight: 700 } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <HeartOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }} />
              <Statistic title="Happy Customers" value={stats.totalReviews} styles={{ content: { color: "#52c41a", fontWeight: 700 } }} />
            </div>
          </Col>
        </Row>
      </section>

      {/* Flash Sale Section */}
      {onSaleProducts.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#fff", marginTop: "40px" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <Badge count={<FireOutlined style={{ color: "#ff4d4f" }} />} className="sale-badge">
                <Title level={2} className="section-title" style={{ fontSize: 42, fontWeight: 800, margin: 0 }}>
                  Flash Sale - Limited Time!
                </Title>
              </Badge>
              <Paragraph style={{ fontSize: 18, color: "#666", marginTop: 24 }}>
                Grab these amazing deals before they're gone!
              </Paragraph>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {onSaleProducts.map((product) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                      <Badge.Ribbon text="ON SALE" color="red">
                        <ProductCard product={product} viewMode="grid" />
                      </Badge.Ribbon>
                    </Col>
                  ))}
                </Row>
                {onSaleProducts.length >= 8 && (
                  <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <Link href="/products">
                      <Button size="large" type="primary" icon={<FireOutlined />} style={{ borderRadius: 8, height: 48, fontSize: 16 }}>
                        See All Sale Items
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <StarOutlined style={{ fontSize: 48, color: "#faad14", marginBottom: 16 }} />
              <Title level={2} className="section-title" style={{ fontSize: 42, fontWeight: 800 }}>
                Featured Products
              </Title>
              <Paragraph style={{ fontSize: 18, color: "#666", marginTop: 24 }}>
                Hand-picked selections just for you
              </Paragraph>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {featuredProducts.map((product) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                      <ProductCard product={product} viewMode="grid" />
                    </Col>
                  ))}
                </Row>
                {featuredProducts.length >= 8 && (
                  <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <Link href="/products">
                      <Button size="large" type="default" style={{ borderRadius: 8, height: 48, fontSize: 16 }}>
                        View All Featured
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Title level={2} className="section-title" style={{ fontSize: 42, fontWeight: 800 }}>
              Shop by Category
            </Title>
            <Paragraph style={{ fontSize: 18, color: "#666", marginTop: 24 }}>
              Explore our wide range of collections
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {categories.slice(0, 6).map((category, index) => {
              const gradients = [
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
              ];
              return (
                <Col xs={24} sm={12} md={8} key={category.id}>
                  <Link href={`/products?category=${category.id}`}>
                    <Card
                      hoverable
                      className="category-card"
                      cover={
                        <div
                          style={{
                            height: "220px",
                            background: gradients[index % gradients.length],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                          }}
                        >
                          <Text strong style={{ color: "#fff", fontSize: "32px", fontWeight: 800 }}>
                            {category.name}
                          </Text>
                          {category.description && (
                            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginTop: 8 }}>
                              {category.description.length > 50
                                ? `${category.description.substring(0, 50)}...`
                                : category.description}
                            </Text>
                          )}
                        </div>
                      }
                      style={{ borderRadius: 12, overflow: "hidden" }}
                    >
                      <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Button type="link" style={{ fontSize: 16, fontWeight: 600 }}>
                          Explore Now →
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </Col>
              );
            })}
          </Row>
        </div>
      </section>

      {/* Best Sellers Section - Only show if there are products with sales */}
      {topSellers.length > 0 && topSellers.some((p) => p.total_sold > 0) && (
        <section style={{ padding: "80px 24px", background: "#f5f5f5" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <TrophyOutlined style={{ fontSize: 48, color: "#faad14", marginBottom: 16 }} />
              <Title level={2} className="section-title" style={{ fontSize: 42, fontWeight: 800 }}>
                Best Sellers
              </Title>
              <Paragraph style={{ fontSize: 18, color: "#666", marginTop: 24 }}>
                Customer favorites - most loved products
              </Paragraph>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {topSellers.map((product, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                      <Badge.Ribbon text={`#${index + 1} Best Seller`} color="gold">
                        <ProductCard product={product} viewMode="grid" />
                      </Badge.Ribbon>
                    </Col>
                  ))}
                </Row>
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                  <Link href="/products">
                    <Button size="large" type="primary" icon={<TrophyOutlined />} style={{ borderRadius: 8, height: 48, fontSize: 16 }}>
                      View All Best Sellers
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#fff" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <RocketOutlined style={{ fontSize: 48, color: "#667eea", marginBottom: 16 }} />
              <Title level={2} className="section-title" style={{ fontSize: 42, fontWeight: 800 }}>
                New Arrivals
              </Title>
              <Paragraph style={{ fontSize: 18, color: "#666", marginTop: 24 }}>
                Just landed - check out the latest additions
              </Paragraph>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {newArrivals.map((product) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                      {isProductNew(product) ? (
                        <Badge.Ribbon text="NEW" color="blue">
                          <ProductCard product={product} viewMode="grid" />
                        </Badge.Ribbon>
                      ) : (
                        <ProductCard product={product} viewMode="grid" />
                      )}
                    </Col>
                  ))}
                </Row>
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                  <Link href="/products">
                    <Button size="large" type="default" style={{ borderRadius: 8, height: 48, fontSize: 16 }}>
                      View All New Products
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Title level={2} style={{ color: "#fff", fontSize: 42, fontWeight: 800 }}>
              Why Shop With Us?
            </Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, marginTop: 16 }}>
              We're committed to providing you the best shopping experience
            </Paragraph>
          </div>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={6}>
              <Card
                className="feature-card"
                style={{ textAlign: "center", background: "rgba(255,255,255,0.95)", borderRadius: 12 }}
              >
                <ThunderboltOutlined style={{ fontSize: 48, color: "#faad14", marginBottom: 16 }} />
                <Title level={4}>Fast Delivery</Title>
                <Text style={{ color: "#666" }}>Quick shipping on all orders</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                className="feature-card"
                style={{ textAlign: "center", background: "rgba(255,255,255,0.95)", borderRadius: 12 }}
              >
                <SafetyOutlined style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }} />
                <Title level={4}>Secure Payment</Title>
                <Text style={{ color: "#666" }}>100% secure transactions</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                className="feature-card"
                style={{ textAlign: "center", background: "rgba(255,255,255,0.95)", borderRadius: 12 }}
              >
                <StarOutlined style={{ fontSize: 48, color: "#667eea", marginBottom: 16 }} />
                <Title level={4}>Top Quality</Title>
                <Text style={{ color: "#666" }}>Premium products guaranteed</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                className="feature-card"
                style={{ textAlign: "center", background: "rgba(255,255,255,0.95)", borderRadius: 12 }}
              >
                <HeartOutlined style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }} />
                <Title level={4}>24/7 Support</Title>
                <Text style={{ color: "#666" }}>We're here to help anytime</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: "80px 24px", background: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Title level={2} style={{ fontSize: 42, fontWeight: 800, marginBottom: 24 }}>
            Ready to Start Shopping?
          </Title>
          <Paragraph style={{ fontSize: 18, color: "#666", marginBottom: 40 }}>
            Join thousands of happy customers and discover amazing products at unbeatable prices!
          </Paragraph>
          <Link href="/products">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              style={{
                height: 56,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 12,
                padding: "0 48px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              Explore All Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
