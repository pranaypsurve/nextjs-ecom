"use client";

import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  InputNumber,
  Space,
  Tag,
  Divider,
  App,
  Spin,
  Empty,
  Rate,
  Badge,
  Breadcrumb,
} from "antd";
import {
  ShoppingCartOutlined,
  CheckOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  StarFilled,
  FireOutlined,
  SafetyOutlined,
  TruckOutlined,
  ReloadOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
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
    if (!product) return;
    dispatch(addToCart({ product, quantity }));
    dispatch(openCart());
    message.success("Product added to cart!");
  };

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <Empty description="Product not found">
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => router.push("/products")}>
              Back to Products
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  const hasDiscount = discount > 0;
  const isOutOfStock = product.stock === 0;
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;
  const selectedImage = product.images[selectedImageIndex] || product.images[0];

  return (
    <div className="product-detail-page">
      <style jsx>{`
        .product-detail-page {
          min-height: calc(100vh - 64px);
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
        }
        .breadcrumb-section {
          background: white;
          padding: 16px 0;
          border-bottom: 1px solid #e8e8e8;
        }
        .breadcrumb-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .image-gallery {
          position: sticky;
          top: 80px;
        }
        .main-image {
          width: 100%;
          height: 600px;
          position: relative;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 16px;
          overflow: "hidden";
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        .thumbnail-list {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .thumbnail {
          width: 90px;
          height: 90px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          background: #f5f5f5;
          border: 3px solid transparent;
          transition: all 0.3s;
        }
        .thumbnail.active {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        .thumbnail:hover {
          transform: scale(1.05);
        }
        .product-info {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
        .price-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 12px;
          margin: 24px 0;
        }
        .trust-badges {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        .trust-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e8e8e8;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .info-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-top: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        @media (max-width: 768px) {
          .image-gallery {
            position: relative;
            top: 0;
          }
          .main-image {
            height: 400px;
          }
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-container">
          <Breadcrumb
            items={[
              { title: <Link href="/">Home</Link> },
              { title: <Link href="/products">Products</Link> },
              { title: product.name },
            ]}
          />
        </div>
      </div>

      <div className="content-wrapper">
        <Row gutter={[48, 48]}>
          {/* Product Images */}
          <Col xs={24} lg={12}>
            <div className="image-gallery">
              <div className="main-image">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      fontSize: 96,
                    }}
                  >
                    📦
                  </div>
                )}
                {hasDiscount && (
                  <Badge
                    count={`-${discount}%`}
                    style={{
                      backgroundColor: "#ff4d4f",
                      position: "absolute",
                      top: 20,
                      right: 20,
                      fontSize: 18,
                      fontWeight: "bold",
                      padding: "8px 16px",
                    }}
                  />
                )}
              </div>

              {product.images.length > 1 && (
                <div className="thumbnail-list">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="90px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Product Details */}
          <Col xs={24} lg={12}>
            <div className="product-info">
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.back()}
                  style={{ marginBottom: 16 }}
                >
                  Back
                </Button>
                <Title level={1} style={{ marginBottom: 16, fontSize: 36, fontWeight: 700 }}>
                  {product.name}
                </Title>

                {/* Rating */}
                {rating > 0 && (
                  <Space size="middle" style={{ marginBottom: 16 }}>
                    <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 18 }} />
                    <Text strong style={{ fontSize: 16 }}>
                      {rating.toFixed(1)}
                    </Text>
                    <Text type="secondary">({reviews} {reviews === 1 ? "review" : "reviews"})</Text>
                  </Space>
                )}

                {/* Stock Status */}
                <div style={{ marginBottom: 16 }}>
                  {isOutOfStock ? (
                    <Tag color="red" icon={<FireOutlined />} style={{ fontSize: 14, padding: "4px 12px" }}>
                      Out of Stock
                    </Tag>
                  ) : (
                    <Tag color="green" icon={<CheckOutlined />} style={{ fontSize: 14, padding: "4px 12px" }}>
                      In Stock ({product.stock} available)
                    </Tag>
                  )}
                </div>
              </div>

              <Divider />

              {/* Price Section */}
              <div className="price-section">
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
                  <Text
                    strong
                    style={{
                      fontSize: 42,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {formatCurrency(product.price)}
                  </Text>
                  {hasDiscount && (
                    <>
                      <Text
                        delete
                        style={{
                          fontSize: 24,
                          color: "rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        {formatCurrency(product.originalPrice!)}
                      </Text>
                      <Tag
                        color="red"
                        style={{
                          fontSize: 16,
                          padding: "4px 12px",
                          fontWeight: "bold",
                        }}
                      >
                        Save {formatCurrency(product.originalPrice! - product.price)}
                      </Tag>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "#4b5563", marginBottom: 24 }}>
                {product.description}
              </Paragraph>

              {/* Quantity & Actions */}
              <div style={{ marginBottom: 24 }}>
                <Text strong style={{ display: "block", marginBottom: 12, fontSize: 16 }}>
                  Quantity:
                </Text>
                <Space size="large" align="center">
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                    size="large"
                    style={{ width: 120 }}
                  />
                  <Text type="secondary">Max: {product.stock} items</Text>
                </Space>
              </div>

              <div className="action-buttons">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  block
                  style={{
                    height: 50,
                    fontSize: 16,
                    fontWeight: 600,
                    background: isOutOfStock
                      ? undefined
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 8,
                  }}
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  size="large"
                  icon={<HeartOutlined />}
                  style={{ height: 50, borderRadius: 8 }}
                >
                  Wishlist
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="trust-badge">
                  <TruckOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
                  <div>
                    <Text strong style={{ display: "block", fontSize: 12 }}>
                      Free Shipping
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      On orders over ₹500
                    </Text>
                  </div>
                </div>
                <div className="trust-badge">
                  <ReloadOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
                  <div>
                    <Text strong style={{ display: "block", fontSize: 12 }}>
                      Easy Returns
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      30-day return policy
                    </Text>
                  </div>
                </div>
                <div className="trust-badge">
                  <SafetyOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
                  <div>
                    <Text strong style={{ display: "block", fontSize: 12 }}>
                      Secure Payment
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      SSL encrypted
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="info-section">
              <Title level={4} style={{ marginBottom: 16 }}>
                Product Information
              </Title>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <Text type="secondary">SKU:</Text>
                  <Text strong>{product.id}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <Text type="secondary">Stock:</Text>
                  <Text strong>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <Text type="secondary">Category ID:</Text>
                  <Text strong>{product.categoryId}</Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

