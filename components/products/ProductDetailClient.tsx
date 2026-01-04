"use client";

import { useState } from "react";
import { Row, Col, Card, Button, Typography, InputNumber, Space, Tag, Divider, Image as AntImage, App, Spin, Empty } from "antd";
import { ShoppingCartOutlined, CheckOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { addToCart, openCart } from "@/store/slices/cartSlice";
import { useGetProductByIdQuery } from "@/store/api/productsApi";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/lib/data";

const { Title, Text, Paragraph } = Typography;

interface ProductDetailClientProps {
  productId: string;
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const { data: apiProduct, isLoading, error } = useGetProductByIdQuery(productId);

  // Transform API product to match Product interface
  // API: price = original, discount_price = discounted
  // Product: price = current (discounted if available), originalPrice = original
  const product: Product | null = apiProduct
    ? {
        id: String(apiProduct.id),
        name: apiProduct.name,
        description: apiProduct.description,
        price: apiProduct.discount_price || apiProduct.price, // Use discount_price if available, else original price
        originalPrice: apiProduct.discount_price ? apiProduct.price : undefined, // Original price only if there's a discount
        images: apiProduct.images || [],
        categoryId: String(apiProduct.categoryId),
        stock: apiProduct.inventory_total,
        featured: false,
        rating: apiProduct.rating,
        reviews: apiProduct.reviews,
        createdAt: apiProduct.createdAt || new Date().toISOString(),
        updatedAt: apiProduct.updatedAt || new Date().toISOString(),
      }
    : null;
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    dispatch(openCart());
    message.success("Product added to cart!");
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Empty description="Product not found">
          <Button type="primary" onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </Empty>
      </div>
    );
  }

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
                    src="https://plus.unsplash.com/premium_photo-1682091872078-46c5ed6a006d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
                      src="https://plus.unsplash.com/premium_photo-1682091872078-46c5ed6a006d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
              <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
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
              <Space orientation="vertical" size="small">
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

