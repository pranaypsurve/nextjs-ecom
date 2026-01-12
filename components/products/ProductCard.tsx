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
      style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        border: "none",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      styles={{ body: { padding: 16, flex: 1, display: "flex", flexDirection: "column" } }}
      cover={
        <Link href={`/products/${product.id}`}>
          <div
            style={{
              width: "100%",
              height: "280px",
              position: "relative",
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              overflow: "hidden",
            }}
          >
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="product-image"
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
                  fontSize: 14,
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
        .product-image:hover {
          transform: scale(1.05);
        }
      `}</style>

      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 16,
              display: "block",
              marginBottom: 8,
              color: "#1f2937",
              lineHeight: 1.4,
              height: "44px",
              overflow: "hidden",
              fontWeight: 600,
            }}
          >
            {product.name}
          </div>
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 12, color: "#6b7280", fontSize: 13, minHeight: 40 }}
          >
            {product.description}
          </Paragraph>
        </div>
      </Link>

      <div style={{ marginBottom: 12 }}>
        {rating > 0 && (
          <Space size={4} style={{ marginBottom: 8 }}>
            <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 12, color: "#faad14" }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({reviews})
            </Text>
          </Space>
        )}
        
        {/* Tags */}
        <Space size={4} wrap style={{ marginBottom: 8 }}>
          {product.is_on_sale && (
            <Tag color="red" icon={<FireOutlined />} style={{ fontSize: 11 }}>
              Sale
            </Tag>
          )}
          {isBestSeller && (
            <Tag color="purple" icon={<TrophyOutlined />} style={{ fontSize: 11 }}>
              Best Seller
            </Tag>
          )}
          {!isOutOfStock && product.inventory < product.low_stock_threshold && (
            <Tag color="orange" style={{ fontSize: 11 }}>
              Low Stock
            </Tag>
          )}
        </Space>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <Text
            strong
            style={{
              color: "#667eea",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {formatCurrency(displayPrice)}
          </Text>
          {originalPrice && (
            <Text delete type="secondary" style={{ fontSize: 14 }}>
              {formatCurrency(originalPrice)}
            </Text>
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
