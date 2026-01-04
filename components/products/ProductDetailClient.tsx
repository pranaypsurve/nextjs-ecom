"use client";

import { useState } from "react";
import { Row, Col, Card, Button, Typography, InputNumber, Space, Tag, Divider, Image as AntImage, App } from "antd";
import { ShoppingCartOutlined, CheckOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { addToCart, openCart } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/lib/data";

const { Title, Text, Paragraph } = Typography;

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    dispatch(openCart());
    message.success("Product added to cart!");
  };

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
      <Row gutter={[32, 32]}>
        {/* Product Images */}
        <Col xs={24} md={12}>
          <div style={{ position: "sticky", top: "80px" }}>
            <Card style={{ marginBottom: "16px" }}>
              <div style={{ width: "100%", height: "500px", position: "relative", background: "#f5f5f5" }}>
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImageIndex] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Text style={{ fontSize: "72px" }}>📦</Text>
                  </div>
                )}
              </div>
            </Card>

            {product.images.length > 1 && (
              <Space size="small" wrap>
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      width: "80px",
                      height: "80px",
                      border: selectedImageIndex === index ? "2px solid var(--color-primary)" : "1px solid #d9d9d9",
                      borderRadius: "4px",
                      cursor: "pointer",
                      position: "relative",
                      background: "#f5f5f5",
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="80px"
                    />
                  </div>
                ))}
              </Space>
            )}
          </div>
        </Col>

        {/* Product Details */}
        <Col xs={24} md={12}>
          <div>
            <Title level={1} style={{ marginBottom: "16px" }}>
              {product.name}
            </Title>

            {product.rating && (
              <div style={{ marginBottom: "16px" }}>
                <Space>
                  <Text strong>Rating:</Text>
                  <Tag color="gold">{product.rating}/5</Tag>
                  {product.reviews && <Text type="secondary">({product.reviews} reviews)</Text>}
                </Space>
              </div>
            )}

            <Divider />

            <div style={{ marginBottom: "24px" }}>
              <Space align="baseline" size="large">
                <Text strong style={{ fontSize: "32px", color: "var(--color-primary)" }}>
                  {formatCurrency(product.price)}
                </Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <Text delete type="secondary" style={{ fontSize: "20px" }}>
                      {formatCurrency(product.originalPrice)}
                    </Text>
                    <Tag color="red">-{discount}%</Tag>
                  </>
                )}
              </Space>
            </div>

            <Paragraph style={{ fontSize: "16px", marginBottom: "24px" }}>{product.description}</Paragraph>

            <Divider />

            <div style={{ marginBottom: "24px" }}>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div>
                  <Text strong style={{ display: "block", marginBottom: "8px" }}>
                    Quantity:
                  </Text>
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                    size="large"
                    style={{ width: "120px" }}
                  />
                  <Text type="secondary" style={{ marginLeft: "16px" }}>
                    {product.stock} available
                  </Text>
                </div>

                <Space size="middle">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </Button>
                  {product.stock === 0 && <Tag color="red">Out of Stock</Tag>}
                </Space>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={5}>Product Information</Title>
              <Space direction="vertical" size="small">
                <Text>
                  <strong>SKU:</strong> {product.id}
                </Text>
                <Text>
                  <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </Text>
                <Text>
                  <strong>Category:</strong> {product.categoryId}
                </Text>
              </Space>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

