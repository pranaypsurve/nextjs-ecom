"use client";

import { Card, Button, Typography, Badge, Rate, Space, Tag } from "antd";
import { ShoppingCartOutlined, StarFilled, FireOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/lib/data";

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, onAddToCart, viewMode = "grid" }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;
  const isOutOfStock = product.stock === 0;
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;

  if (viewMode === "list") {
    return (
      <Card
        hoverable
        style={{
          marginBottom: 16,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
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
              {product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
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
                  }}
                />
              )}
            </div>
          </Link>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <Link href={`/products/${product.id}`}>
                <Text strong style={{ fontSize: 20, display: "block", marginBottom: 8 }}>
                  {product.name}
                </Text>
              </Link>
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 12, color: "#666", fontSize: 14 }}
              >
                {product.description}
              </Paragraph>
              <Space size="middle" style={{ marginBottom: 12 }}>
                {rating > 0 && (
                  <Space size={4}>
                    <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 14 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({reviews})
                    </Text>
                  </Space>
                )}
                {!isOutOfStock && (
                  <Tag color="green" icon={<FireOutlined />}>
                    In Stock
                  </Tag>
                )}
              </Space>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong style={{ color: "var(--color-primary)", fontSize: 24, display: "block" }}>
                  {formatCurrency(product.price)}
                </Text>
                {hasDiscount && (
                  <Text delete type="secondary" style={{ fontSize: 14 }}>
                    {formatCurrency(product.originalPrice!)}
                  </Text>
                )}
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => onAddToCart(product)}
                disabled={isOutOfStock}
                style={{ borderRadius: 8 }}
              >
                Add to Cart
              </Button>
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
      }}
      bodyStyle={{ padding: 16 }}
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
            {product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                  background: "rgba(0,0,0,0.5)",
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
      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ marginBottom: 12 }}>
          <Text
            strong
            style={{
              fontSize: 16,
              display: "block",
              marginBottom: 8,
              color: "#1f2937",
              lineHeight: 1.4,
            }}
            ellipsis
          >
            {product.name}
          </Text>
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
            <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({reviews})
            </Text>
          </Space>
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <Text
            strong
            style={{
              color: "var(--color-primary)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {formatCurrency(product.price)}
          </Text>
          {hasDiscount && (
            <Text delete type="secondary" style={{ fontSize: 14 }}>
              {formatCurrency(product.originalPrice!)}
            </Text>
          )}
        </div>
      </div>

      <Button
        type="primary"
        icon={<ShoppingCartOutlined />}
        onClick={(e) => {
          e.preventDefault();
          onAddToCart(product);
        }}
        block
        disabled={isOutOfStock}
        size="large"
        style={{
          borderRadius: 8,
          height: 40,
          fontWeight: 600,
          background: isOutOfStock
            ? undefined
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
        }}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </Card>
  );
}

