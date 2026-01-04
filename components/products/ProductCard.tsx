"use client";

import { Card, Button, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/lib/data";

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card
      hoverable
      cover={
        <Link href={`/products/${product.id}`}>
          <div
            style={{
              width: "100%",
              height: "250px",
              position: "relative",
              background: "#f5f5f5",
            }}
          >
            {product.images.length > 0 ? (
              <Image
                src="https://plus.unsplash.com/premium_photo-1682091872078-46c5ed6a006d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Text style={{ fontSize: "48px" }}>📦</Text>
              </div>
            )}
          </div>
        </Link>
      }
      actions={[
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => onAddToCart(product)}
          block
          disabled={product.stock === 0}
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
              {product.originalPrice && product.originalPrice > product.price && (
                <Text delete type="secondary" style={{ marginLeft: "8px", fontSize: "14px" }}>
                  {formatCurrency(product.originalPrice)}
                </Text>
              )}
              <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: "8px", marginBottom: 0, color: "#666" }}>
                {product.description}
              </Paragraph>
            </div>
          }
        />
      </Link>
    </Card>
  );
}

