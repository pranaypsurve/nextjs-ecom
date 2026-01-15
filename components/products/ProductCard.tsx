"use client";

import { Card, Button, Typography, Badge, Rate, Space, Tag } from "antd";
import { ShoppingCartOutlined, FireOutlined, StarFilled, TrophyOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/currency";
import type { ProductResponse } from "@/store/api/productsApi";

const { Text, Paragraph } = Typography;

interface ProductCardProps {
  product: ProductResponse;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const isOutOfStock = product.inventory === 0;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const displayPrice = product.discount_price || product.price;
  const originalPrice = hasDiscount ? product.price : null;

  const rating = product.average_rating || 0;
  const reviews = product.review_count || 0;
  const isBestSeller = product.total_sold > 10; // Consider bestseller if sold more than 10

  if (viewMode === "list") {
    return (
      <Card
        hoverable
        style={{
          marginBottom: 16,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href={`/products/${product.id}`} style={{ flexShrink: 0 }}>
            <div
              style={{
                width: 200,
                height: 200,
                position: "relative",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {product.image || product.thumbnail ? (
                <Image
                  src={product.image || product.thumbnail || ""}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="200px"
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    fontSize: 48,
                  }}
                >
                  📦
                </div>
              )}
              {hasDiscount && (
                <Badge
                  count={`-${discountPercent}%`}
                  style={{
                    backgroundColor: "#ff4d4f",
                    position: "absolute",
                    top: 12,
                    right: 12,
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                />
              )}
              {isOutOfStock && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tag color="red" style={{ fontSize: 14, padding: "6px 12px" }}>
                    Out of Stock
                  </Tag>
                </div>
              )}
            </div>
          </Link>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 200 }}>
            <div>
              <Link href={`/products/${product.id}`}>
                <Text strong style={{ fontSize: 20, display: "block", marginBottom: 8, color: "#1f2937" }}>
                  {product.name}
                </Text>
              </Link>
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 12, color: "#666", fontSize: 14 }}
              >
                {product.description}
              </Paragraph>
              <Space size="small" wrap style={{ marginBottom: 12 }}>
                {rating > 0 && (
                  <Space size={4}>
                    <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 14, color: "#faad14" }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({reviews})
                    </Text>
                  </Space>
                )}
                {product.is_on_sale && (
                  <Tag color="red" icon={<FireOutlined />}>
                    On Sale
                  </Tag>
                )}
                {product.is_featured && (
                  <Tag color="gold" icon={<StarFilled />}>
                    Featured
                  </Tag>
                )}
                {isBestSeller && (
                  <Tag color="purple" icon={<TrophyOutlined />}>
                    Best Seller
                  </Tag>
                )}
                {!isOutOfStock && (
                  <Tag color="green">
                    {product.inventory} in stock
                  </Tag>
                )}
              </Space>
              {product.tags && product.tags.length > 0 && (
                <Space size={4} wrap style={{ marginTop: 8 }}>
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <Tag key={index} style={{ fontSize: 11 }}>
                      {tag}
                    </Tag>
                  ))}
                </Space>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <div>
                <Text strong style={{ color: "#667eea", fontSize: 24, display: "block" }}>
                  {formatCurrency(displayPrice)}
                </Text>
                {originalPrice && (
                  <Text delete type="secondary" style={{ fontSize: 14 }}>
                    {formatCurrency(originalPrice)}
                  </Text>
                )}
              </div>
              <Link href={`/products/${product.id}`}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  disabled={isOutOfStock}
                  style={{
                    borderRadius: 8,
                    background: isOutOfStock ? undefined : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hoverable
      className="product-card"
      style={{
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        border: "1px solid #f0f0f0",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      styles={{ 
        body: { 
          padding: 16, 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          background: "#fff"
        } 
      }}
      cover={
        <Link href={`/products/${product.id}`}>
          <div
            className="product-image-container"
            style={{
              width: "100%",
              aspectRatio: "1100 / 1400",
              position: "relative",
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              overflow: "hidden",
            }}
          >
            {product.thumbnail || product.image ? (
              <Image
                src={product.thumbnail || product.image || ""}
                alt={product.name}
                fill
                style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="product-image"
                priority={false}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  fontSize: 64,
                }}
              >
                📦
              </div>
            )}
            {hasDiscount && (
              <Badge
                count={`-${discountPercent}%`}
                style={{
                  backgroundColor: "#ff4d4f",
                  position: "absolute",
                  top: 12,
                  right: 12,
                  fontSize: 16,
                  fontWeight: "bold",
                  padding: "4px 12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  borderRadius: 4,
                }}
              />
            )}
            {product.is_featured && !hasDiscount && (
              <Badge
                count="FEATURED"
                style={{
                  backgroundColor: "#faad14",
                  position: "absolute",
                  top: 12,
                  right: 12,
                  fontSize: 12,
                  fontWeight: "bold",
                  padding: "4px 12px",
                  borderRadius: 4,
                }}
              />
            )}
            {isOutOfStock && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Tag color="red" style={{ fontSize: 16, padding: "8px 16px" }}>
                  Out of Stock
                </Tag>
              </div>
            )}
          </div>
        </Link>
      }
    >
      <style jsx global>{`
        .product-card {
          transition: all 0.3s ease;
        }

        .product-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          transform: translateY(-4px);
        }

        .product-image-container {
          position: relative;
        }
        
        .product-image-container:hover .product-image {
          transform: scale(1.05);
        }

        .product-image {
          transition: transform 0.3s ease;
        }

        .product-name {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
          .product-image-container {
            aspect-ratio: 1 / 1.2;
          }
        }

        @media (max-width: 480px) {
          .product-image-container {
            aspect-ratio: 1 / 1.1;
          }
        }
      `}</style>

      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <div
            className="product-name"
            style={{
              fontSize: 15,
              display: "block",
              marginBottom: 10,
              color: "#1f2937",
              lineHeight: 1.4,
              minHeight: "42px",
              overflow: "hidden",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            {product.name}
          </div>
        </div>
      </Link>

      <div style={{ marginBottom: 12 }}>
        {/* Rating */}
        {rating > 0 && (
          <Space size={4} style={{ marginBottom: 10 }}>
            <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 14, color: "#1890ff" }} />
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
              ({reviews})
            </Text>
          </Space>
        )}

        {/* Price Section */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          {originalPrice && (
            <Text 
              delete 
              type="secondary" 
              style={{ 
                fontSize: 15, 
                color: "#999",
                textDecorationColor: "#999"
              }}
            >
              {formatCurrency(originalPrice)}
            </Text>
          )}
          <Text
            strong
            style={{
              color: "#ff4d4f",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {formatCurrency(displayPrice)}
          </Text>
          {hasDiscount && (
            <Tag
              color="red"
              style={{
                fontSize: 12,
                fontWeight: "bold",
                padding: "2px 8px",
                borderRadius: 4,
                margin: 0,
              }}
            >
              -{discountPercent}%
            </Tag>
          )}
        </div>
      </div>

      <Link href={`/products/${product.id}`} style={{ marginTop: "auto" }}>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          block
          disabled={isOutOfStock}
          size="large"
          style={{
            borderRadius: 8,
            height: 42,
            fontWeight: 600,
            background: isOutOfStock
              ? undefined
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          {isOutOfStock ? "Out of Stock" : "View Details"}
        </Button>
      </Link>
    </Card>
  );
}
