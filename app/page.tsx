"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Typography, Spin } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/lib/data";

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

export default function Home() {
  const dispatch = useAppDispatch();

  // Get data from API
  const { data: allProducts = [], isLoading: productsLoading } = useGetProductsQuery();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();

  // Transform API products to match Product interface and filter featured
  // API: price = original, discount_price = discounted
  // Product: price = current (discounted if available), originalPrice = original
  const featuredProducts: Product[] = allProducts
    .filter((p) => p.is_active !== false)
    .slice(0, 8) // Get first 8 active products as featured
    .map((p) => ({
      id: String(p.id),
      name: p.name,
      description: p.description,
      price: p.discount_price || p.price, // Use discount_price if available, else original price
      originalPrice: p.discount_price ? p.price : undefined, // Original price only if there's a discount
      images: p.images || [],
      categoryId: String(p.categoryId),
      stock: p.inventory_total,
      featured: true,
      rating: p.rating,
      reviews: p.reviews,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    }));

  const loading = productsLoading || categoriesLoading;

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "calc(100vh - 64px)" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #52c41a 100%)",
          color: "#fff",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <Title level={1} style={{ color: "#fff", marginBottom: "16px" }}>
          Welcome to Our Store
        </Title>
        <Paragraph style={{ color: "#fff", fontSize: "18px", marginBottom: "32px" }}>
          Discover amazing products at great prices
        </Paragraph>
        <Link href="/products">
          <Button type="primary" size="large" style={{ background: "#fff", color: "var(--color-primary)" }}>
            Shop Now
          </Button>
        </Link>
      </section>

      {/* Categories Section */}
      <section style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          Shop by Category
        </Title>
        <Row gutter={[24, 24]}>
          {categories.map((category) => (
            <Col xs={24} sm={12} md={8} key={category.id}>
              <Link href={`/products?category=${category.id}`}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: "200px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text strong style={{ color: "#fff", fontSize: "24px" }}>
                        {category.name}
                      </Text>
                    </div>
                  }
                >
                  <Meta title={category.name} description={category.description} />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: "60px 24px", background: "#fff", maxWidth: "1200px", margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          Featured Products
        </Title>
        {(loading || categoriesLoading) ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {featuredProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: "250px",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <Text style={{ fontSize: "48px" }}>📦</Text>
                    </div>
                  }
                  actions={[
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleAddToCart(product)}
                      block
                    >
                      Add to Cart
                    </Button>,
                  ]}
                >
                  <Link href={`/products/${product.id}`}>
                    <Meta
                      title={product.name}
                      description={
                        <div>
                          <Text strong style={{ color: "var(--color-primary)", fontSize: "18px" }}>
                            {formatCurrency(product.price)}
                          </Text>
                          {product.originalPrice && (
                            <Text
                              delete
                              type="secondary"
                              style={{ marginLeft: "8px", fontSize: "14px" }}
                            >
                              {formatCurrency(product.originalPrice)}
                            </Text>
                          )}
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ marginTop: "8px", marginBottom: 0, color: "#666" }}
                          >
                            {product.description}
                          </Paragraph>
                        </div>
                      }
                    />
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/products">
            <Button size="large">View All Products</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
