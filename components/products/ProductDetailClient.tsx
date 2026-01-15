"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Row,
  Col,
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
  Card,
  Tabs,
  Collapse,
  Timeline,
  Statistic,
  Avatar,
  Progress,
} from "antd";
import {
  ShoppingCartOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  StarFilled,
  FireOutlined,
  SafetyOutlined,
  TruckOutlined,
  ReloadOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  TagOutlined,
  DollarOutlined,
  ShopOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { addToCart, openCart } from "@/store/slices/cartSlice";
import { useGetProductByIdQuery } from "@/store/api/productsApi";
import { formatCurrency } from "@/lib/utils/currency";

const { Title, Text, Paragraph } = Typography;

interface ProductDetailClientProps {
  productId: string;
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();

  // Fetch product data
  const { data: product, isLoading, error } = useGetProductByIdQuery(productId);

  // State management
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Calculate values
  const isOutOfStock = product ? product.inventory === 0 : false;
  const hasDiscount = product ? product.discount_price && product.discount_price < product.price : false;
  const discountPercent = hasDiscount && product
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;
  const displayPrice = product ? (product.discount_price || product.price) : 0;
  const originalPrice = hasDiscount && product ? product.price : null;
  const rating = product?.average_rating || 0;
  const reviews = product?.review_count || 0;
  const totalSold = product?.total_sold || 0;
  const isLowStock = product ? product.inventory < product.low_stock_threshold : false;

  // Helper function to validate URL
  const isValidUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string' || !url.trim()) return false;
    try {
      // Check if it's a valid absolute URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url);
        return true;
      }
      // Allow relative paths starting with /
      if (url.startsWith('/')) {
        return true;
      }
      // Allow data URLs
      if (url.startsWith('data:')) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Images handling - use images array, fallback to image/thumbnail
  const productImages = useMemo(() => {
    if (!product) return [];
    
    // Prefer images array if available
    if (product.images && product.images.length > 0) {
      return product.images.filter((img) => {
        if (!img || typeof img !== 'string') return false;
        return isValidUrl(img);
      });
    }
    // Fallback to single image or thumbnail
    const images = [];
    if (product.image && isValidUrl(product.image)) images.push(product.image);
    if (product.thumbnail && product.thumbnail !== product.image && isValidUrl(product.thumbnail)) {
      images.push(product.thumbnail);
    }
    return images.length > 0 ? images : [];
  }, [product]);

  const selectedImage = productImages[selectedImageIndex] || productImages[0];
  const hasMultipleImages = productImages.length > 1;
  
  // Reset selectedImageIndex if it's out of bounds
  useEffect(() => {
    if (selectedImageIndex >= productImages.length && productImages.length > 0) {
      setSelectedImageIndex(0);
    }
  }, [productImages.length, selectedImageIndex]);
  
  // Validate selectedImage before using
  const validSelectedImage = selectedImage && isValidUrl(selectedImage) ? selectedImage : undefined;

  // Navigation handlers
  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  // Handle share product
  const handleShare = async () => {
    if (!product) return;

    const productUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/products/${product.id}`
      : `/products/${product.id}`;
    
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - ${product.description?.substring(0, 100)}...`,
      url: productUrl,
    };

    // Check if Web Share API is available (mobile devices)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        message.success("Shared successfully!");
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          // Fallback to copy link if share fails
          await handleCopyLink(productUrl);
        }
      }
    } else {
      // Desktop fallback - copy link to clipboard
      await handleCopyLink(productUrl);
    }
  };

  // Handle copy link to clipboard
  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      message.success("Product link copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        message.success("Product link copied to clipboard!");
      } catch (err) {
        message.error("Failed to copy link");
      }
      document.body.removeChild(textArea);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    if (isOutOfStock) {
      message.warning("This product is out of stock");
      return;
    }

    if (quantity > product.inventory) {
      message.warning(`Only ${product.inventory} items available`);
      return;
    }

    dispatch(
      addToCart({
        variantId: String(product.id),
        quantity,
        price: displayPrice,
        productName: product.name,
        productImage: product.thumbnail || "",
      })
    );
    dispatch(openCart());
    message.success("Product added to cart!");
  };

  // Handle buy now - add to cart and redirect to checkout
  const handleBuyNow = () => {
    if (!product) return;

    if (isOutOfStock) {
      message.warning("This product is out of stock");
      return;
    }

    if (quantity > product.inventory) {
      message.warning(`Only ${product.inventory} items available`);
      return;
    }

    // Add to cart
    dispatch(
      addToCart({
        variantId: String(product.id),
        quantity,
        price: displayPrice,
        productName: product.name,
        productImage: product.thumbnail || "",
      })
    );
    
    // Show success message
    message.success("Redirecting to checkout...");
    
    // Redirect to checkout after a brief delay
    setTimeout(() => {
      router.push("/checkout");
    }, 500);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", background: "#f5f5f5", minHeight: "60vh" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Title level={4}>Product not found</Title>
              <Text type="secondary">The product you're looking for doesn't exist or has been removed</Text>
            </div>
          }
        >
          <Button type="primary" size="large" icon={<ArrowLeftOutlined />} onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </Empty>
      </div>
    );
  }

  // Mock reviews data (replace with real data when available)
  const mockReviews = [
    { id: 1, name: "John Doe", rating: 5, comment: "Excellent product! Highly recommended.", date: "2 days ago", avatar: "JD" },
    { id: 2, name: "Jane Smith", rating: 4, comment: "Good quality, fast delivery.", date: "1 week ago", avatar: "JS" },
    { id: 3, name: "Mike Johnson", rating: 5, comment: "Amazing! Exactly as described.", date: "2 weeks ago", avatar: "MJ" },
  ];

  return (
    <div className="product-detail-page">
      <style jsx global>{`
        .product-detail-page {
          min-height: calc(100vh - 64px);
          background: #f5f5f5;
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
        }

        .breadcrumb-section {
          background: white;
          padding: 16px 0;
          border-bottom: 1px solid #e8e8e8;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .breadcrumb-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .image-gallery-section {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 80px;
        }

        .main-image-container {
          width: 100%;
          height: 500px;
          position: relative;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
          cursor: zoom-in;
        }

        .main-image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .main-image-wrapper:hover .main-image {
          transform: scale(1.5);
        }

        .main-image {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center center;
        }

        .image-navigation {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .image-navigation:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .image-navigation.prev {
          left: 16px;
        }

        .image-navigation.next {
          right: 16px;
        }

        .image-counter {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          z-index: 10;
        }

        .zoom-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .main-image-container:hover .zoom-indicator {
          opacity: 1;
        }

        .thumbnail-container {
          position: relative;
          margin-bottom: 16px;
        }

        .thumbnail-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 4px 0;
          scrollbar-width: thin;
          scrollbar-color: #667eea #f0f0f0;
        }

        .thumbnail-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .thumbnail-scroll::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }

        .thumbnail-scroll::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 10px;
        }

        .thumbnail-scroll::-webkit-scrollbar-thumb:hover {
          background: #5568d3;
        }

        .thumbnail {
          min-width: 90px;
          width: 90px;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          background: #f5f5f5;
          border: 3px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .thumbnail.active {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2), 0 4px 12px rgba(102, 126, 234, 0.3);
          transform: scale(1.05);
        }

        .thumbnail:hover {
          transform: scale(1.08);
          border-color: #667eea;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
        }

        .thumbnail img {
          transition: transform 0.3s ease;
        }

        .thumbnail:hover img {
          transform: scale(1.1);
        }

        .product-info-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }

        .price-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 12px;
          margin: 24px 0;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin: 24px 0;
        }

        .feature-card {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e8e8e8;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          background: white;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .action-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          padding: 24px;
          border-radius: 12px;
          border: 2px dashed #e8e8e8;
          margin: 24px 0;
        }

        .info-tabs {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          margin-top: 32px;
        }

        .review-card {
          padding: 16px;
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 12px;
          border-left: 4px solid #667eea;
        }

        .rating-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .product-title {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }

        @media (max-width: 768px) {
          .breadcrumb-container {
            padding: 0 16px;
          }

          .content-wrapper {
            padding: 16px 12px;
          }

          .image-gallery-section {
            position: relative;
            top: 0;
            padding: 16px;
          }

          .main-image-container {
            height: 350px;
            cursor: default;
          }

          .main-image-wrapper:hover .main-image {
            transform: scale(1);
          }

          .image-navigation {
            width: 40px;
            height: 40px;
          }

          .image-navigation.prev {
            left: 8px;
          }

          .image-navigation.next {
            right: 8px;
          }

          .zoom-indicator {
            display: none;
          }

          .thumbnail {
            min-width: 70px;
            width: 70px;
          }

          .product-info-card {
            padding: 20px 16px;
          }

          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .info-tabs {
            padding: 16px;
            margin-top: 24px;
          }
        }

        @media (max-width: 480px) {
          .breadcrumb-container {
            padding: 0 12px;
          }

          .content-wrapper {
            padding: 12px 8px;
          }

          .image-gallery-section {
            padding: 12px;
          }

          .main-image-container {
            height: 280px;
            margin-bottom: 12px;
          }

          .image-navigation {
            width: 36px;
            height: 36px;
          }

          .image-navigation.prev {
            left: 4px;
          }

          .image-navigation.next {
            right: 4px;
          }

          .thumbnail {
            min-width: 60px;
            width: 60px;
          }

          .thumbnail-scroll {
            gap: 8px;
          }

          .product-info-card {
            padding: 16px 12px;
          }

          .price-badge {
            padding: 16px;
            margin: 16px 0;
          }

          .action-section {
            padding: 16px;
            margin: 16px 0;
          }

          .feature-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .feature-card {
            padding: 16px;
          }

          .info-tabs {
            padding: 12px;
            margin-top: 16px;
          }
        }

        @media (max-width: 360px) {
          .breadcrumb-container {
            padding: 0 8px;
          }

          .content-wrapper {
            padding: 8px 4px;
          }

          .image-gallery-section {
            padding: 8px;
          }

          .main-image-container {
            height: 240px;
            border-radius: 12px;
          }

          .image-navigation {
            width: 32px;
            height: 32px;
          }

          .image-counter {
            bottom: 8px;
            right: 8px;
            padding: 4px 12px;
            font-size: 12px;
          }

          .thumbnail {
            min-width: 50px;
            width: 50px;
          }

          .product-info-card {
            padding: 12px 8px;
            border-radius: 12px;
          }

          .price-badge {
            padding: 12px;
            border-radius: 8px;
          }

          .action-section {
            padding: 12px;
            border-radius: 8px;
          }

          .feature-card {
            padding: 12px;
          }

          .info-tabs {
            padding: 8px;
          }

          .product-title {
            font-size: 24px !important;
          }

          .price-label {
            font-size: 12px !important;
          }

          .price-amount {
            font-size: 32px !important;
          }

          .price-original {
            font-size: 20px !important;
          }

          .price-save-tag {
            font-size: 14px !important;
            padding: 4px 12px !important;
          }

          .price-container {
            gap: 8px !important;
          }

          .action-buttons {
            flex-direction: column;
            width: 100% !important;
          }

          .add-to-cart-btn,
          .buy-now-btn {
            width: 100% !important;
            min-width: 100% !important;
            height: 48px !important;
            font-size: 16px !important;
          }

          .action-buttons .ant-space-item {
            width: 100%;
          }

          .ant-row {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }

          .ant-col {
            padding-left: 4px !important;
            padding-right: 4px !important;
          }

          .ant-space {
            flex-wrap: wrap;
          }

          .ant-tag {
            font-size: 12px !important;
            padding: 2px 8px !important;
            margin: 2px !important;
          }
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-container">
          <Breadcrumb
            items={[
              { title: <Link href="/"><HomeOutlined /> Home</Link> },
              { title: <Link href="/products">Products</Link> },
              {
                title: product.category?.name ? (
                  <Link href={`/products?category=${product.categoryId}`}>{product.category.name}</Link>
                ) : (
                  "Product"
                ),
              },
              { title: product.name },
            ]}
          />
        </div>
      </div>

      <div className="content-wrapper">
        <Row gutter={[32, 32]}>
          {/* Left Column - Images */}
          <Col xs={24} lg={10}>
            <div className="image-gallery-section">
              {/* Main Image with Zoom */}
              <div className="main-image-container">
                {validSelectedImage ? (
                  <>
                    <div className="main-image-wrapper">
                      <Image
                        src={validSelectedImage}
                        alt={product.name}
                        fill
                        className="main-image"
                        style={{ objectFit: "contain", padding: 20 }}
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    
                    {/* Zoom Indicator */}
                    <div className="zoom-indicator">
                      <ZoomInOutlined />
                      <span>Hover to zoom</span>
                    </div>

                    {/* Navigation Arrows */}
                    {hasMultipleImages && (
                      <>
                        <Button
                          className="image-navigation prev"
                          icon={<LeftOutlined />}
                          onClick={handlePreviousImage}
                          aria-label="Previous image"
                        />
                        <Button
                          className="image-navigation next"
                          icon={<RightOutlined />}
                          onClick={handleNextImage}
                          aria-label="Next image"
                        />
                        <div className="image-counter">
                          {selectedImageIndex + 1} / {productImages.length}
                        </div>
                      </>
                    )}
                  </>
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
                
                {/* Badges on Image */}
                {hasDiscount && (
                  <Badge
                    count={`-${discountPercent}%`}
                    style={{
                      backgroundColor: "#ff4d4f",
                      position: "absolute",
                      top: 20,
                      left: hasMultipleImages ? 70 : 20,
                      fontSize: 20,
                      fontWeight: "bold",
                      padding: "8px 16px",
                      boxShadow: "0 4px 12px rgba(255,77,79,0.3)",
                      zIndex: 10,
                    }}
                  />
                )}
                {product.is_featured && (
                  <Tag
                    color="gold"
                    icon={<CrownOutlined />}
                    style={{
                      position: "absolute",
                      top: 20,
                      left: hasDiscount && hasMultipleImages ? 70 : hasDiscount ? 20 : hasMultipleImages ? 70 : 20,
                      fontSize: 14,
                      padding: "6px 12px",
                      zIndex: 10,
                    }}
                  >
                    FEATURED
                  </Tag>
                )}
              </div>

              {/* Thumbnails Carousel */}
              {hasMultipleImages && (
                <div className="thumbnail-container">
                  <div className="thumbnail-scroll">
                    {productImages.map((image, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                        onClick={() => setSelectedImageIndex(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedImageIndex(index);
                          }
                        }}
                        aria-label={`View image ${index + 1}`}
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
                </div>
              )}

              {/* Share Section */}
              <Divider />
              <div style={{ textAlign: "center" }}>
                <Space size="large">
                  <Button
                    icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
                    size="large"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    style={{
                      color: isWishlisted ? "#ff4d4f" : undefined,
                      borderColor: isWishlisted ? "#ff4d4f" : undefined,
                    }}
                  >
                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </Button>
                  <Button 
                    icon={<ShareAltOutlined />} 
                    size="large"
                    onClick={handleShare}
                  >
                    Share
                  </Button>
                </Space>
              </div>
            </div>
          </Col>

          {/* Right Column - Product Info */}
          <Col xs={24} lg={14}>
            {/* Product Title & Basic Info */}
            <div className="product-info-card">
              <Space orientation="vertical" size="small" style={{ width: "100%", marginBottom: 16 }}>
                <Space size="small" wrap>
                  {product.is_on_sale && (
                    <Tag color="red" icon={<FireOutlined />}>
                      ON SALE
                    </Tag>
                  )}
                  {totalSold > 10 && (
                    <Tag color="purple" icon={<ThunderboltOutlined />}>
                      BEST SELLER ({totalSold} sold)
                    </Tag>
                  )}
                  {isLowStock && !isOutOfStock && (
                    <Tag color="orange">
                      ONLY {product.inventory} LEFT
                    </Tag>
                  )}
                </Space>
                <Title level={1} style={{ margin: 0, fontSize: 36, fontWeight: 800 }} className="product-title">
                  {product.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  SKU: {product.sku}
                </Text>
              </Space>

              {/* Rating & Reviews */}
              {rating > 0 && (
                <Space size="large" style={{ marginBottom: 24 }}>
                  <Space size={8}>
                    <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 20, color: "#faad14" }} />
                    <Text strong style={{ fontSize: 18 }}>
                      {rating > 0 ? rating.toFixed(1) : "0.0"}
                    </Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    ({reviews} {reviews === 1 ? "review" : "reviews"})
                  </Text>
                </Space>
              )}

              {/* Stock Status */}
              <div style={{ marginBottom: 24 }}>
                {isOutOfStock ? (
                  <Tag color="red" icon={<FireOutlined />} style={{ fontSize: 16, padding: "8px 20px" }}>
                    OUT OF STOCK
                  </Tag>
                ) : (
                  <Tag color="green" icon={<CheckOutlined />} style={{ fontSize: 16, padding: "8px 20px" }}>
                    IN STOCK - {product.inventory} Available
                  </Tag>
                )}
              </div>

              <Divider />

              {/* Price Section */}
              <div className="price-badge">
                <Space orientation="vertical" size="small" style={{ width: "100%"}}>
                  <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }} className="price-label">Price:</Text>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }} className="price-container">
                    <Text
                      strong
                      className="price-amount"
                      style={{
                        fontSize: 48,
                        fontWeight: 800,
                        color: "white",
                        lineHeight: 1,
                      }}
                    >
                      {formatCurrency(displayPrice)}
                    </Text>
                    {hasDiscount && originalPrice && (
                      <>
                        <Text
                          delete
                          className="price-original"
                          style={{
                            fontSize: 28,
                            color: "rgba(255, 255, 255, 0.7)",
                          }}
                        >
                          {formatCurrency(originalPrice)}
                        </Text>
                        <Tag
                          color="red"
                          className="price-save-tag"
                          style={{
                            fontSize: 18,
                            padding: "6px 16px",
                            fontWeight: "bold",
                          }}
                        >
                          Save {formatCurrency(originalPrice - displayPrice)}
                        </Tag>
                      </>
                    )}
                  </div>
                </Space>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>Description</Title>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "#4b5563" }}>
                  {product.description}
                </Paragraph>
              </div>

              {/* Product Details */}
              {(product.color || product.material || product.weight) && (
                <>
                  <Divider />
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {product.color && (
                      <Col span={12}>
                        <Space orientation="vertical" size={4}>
                          <Text type="secondary">Color:</Text>
                          <Tag color={product.color.toLowerCase()} style={{ fontSize: 14, padding: "4px 12px" }}>
                            {product.color}
                          </Tag>
                        </Space>
                      </Col>
                    )}
                    {product.material && (
                      <Col span={12}>
                        <Space orientation="vertical" size={4}>
                          <Text type="secondary">Material:</Text>
                          <Text strong>{product.material}</Text>
                        </Space>
                      </Col>
                    )}
                    {product.weight && (
                      <Col span={12}>
                        <Space orientation="vertical" size={4}>
                          <Text type="secondary">Weight:</Text>
                          <Text strong>{product.weight} kg</Text>
                        </Space>
                      </Col>
                    )}
                  </Row>
                </>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <Space size={[8, 8]} wrap>
                    <TagOutlined style={{ color: "#667eea" }} />
                    {product.tags.map((tag, index) => (
                      <Tag key={index} style={{ fontSize: 13 }}>
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              <Divider />

              {/* Quantity & Add to Cart */}
              <div className="action-section">
                <Space orientation="vertical" size="large" style={{ width: "100%" }}>
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 12, fontSize: 16 }}>
                      Quantity:
                    </Text>
                    <Space size="large" align="center">
                      <InputNumber
                        min={1}
                        max={product.inventory}
                        value={quantity}
                        onChange={(value) => setQuantity(value || 1)}
                        size="large"
                        style={{ width: 140 }}
                        disabled={isOutOfStock}
                      />
                      {!isOutOfStock && (
                        <Text type="secondary">Maximum: {product.inventory} items</Text>
                      )}
                    </Space>
                  </div>

                  <Space size="middle" style={{ width: "100%" }} className="action-buttons">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      block
                      className="add-to-cart-btn"
                      style={{
                        height: 56,
                        fontSize: 18,
                        fontWeight: 600,
                        background: isOutOfStock
                          ? undefined
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: 12,
                        flex: 1,
                      }}
                    >
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <Button
                      size="large"
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                      className="buy-now-btn"
                      style={{
                        height: 56,
                        fontSize: 16,
                        fontWeight: 600,
                        borderRadius: 12,
                        minWidth: 140,
                      }}
                    >
                      Buy Now
                    </Button>
                  </Space>
                </Space>
              </div>
            </div>

            {/* Trust Features */}
            <div className="feature-grid">
              <div className="feature-card">
                <TruckOutlined style={{ fontSize: 32, color: "#667eea", marginBottom: 8 }} />
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  Fast Delivery
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  2-4 days shipping
                </Text>
              </div>
              <div className="feature-card">
                <SafetyOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }} />
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  Secure Payment
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  100% secure
                </Text>
              </div>
              <div className="feature-card">
                <ReloadOutlined style={{ fontSize: 32, color: "#faad14", marginBottom: 8 }} />
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  {product.is_returnable ? "Easy Returns" : "No Returns"}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {product.is_returnable ? "7 days return" : "Final sale"}
                </Text>
              </div>
              <div className="feature-card">
                <CheckOutlined style={{ fontSize: 32, color: "#13c2c2", marginBottom: 8 }} />
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  Quality Check
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Verified quality
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        {/* Additional Information Tabs */}
        <div className="info-tabs">
          <Tabs
            defaultActiveKey="description"
            size="large"
            items={[
              {
                key: "description",
                label: <span><FileTextOutlined /> Description</span>,
                children: (
                  <div style={{ padding: 16 }}>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                      {product.description}
                    </Paragraph>
                    {(product.color || product.material || product.weight) && (
                      <>
                        <Title level={5} style={{ marginTop: 24 }}>
                          Specifications
                        </Title>
                        <Row gutter={[16, 16]}>
                          {product.color && (
                            <Col span={8}>
                              <Card size="small">
                                <Statistic title="Color" value={product.color} />
                              </Card>
                            </Col>
                          )}
                          {product.material && (
                            <Col span={8}>
                              <Card size="small">
                                <Statistic title="Material" value={product.material} />
                              </Card>
                            </Col>
                          )}
                          {product.weight && (
                            <Col span={8}>
                              <Card size="small">
                                <Statistic title="Weight" value={`${product.weight} kg`} />
                              </Card>
                            </Col>
                          )}
                        </Row>
                      </>
                    )}
                  </div>
                ),
              },
              {
                key: "reviews",
                label: (
                  <span>
                    <StarFilled /> Reviews ({reviews})
                  </span>
                ),
                children: (
                  <div style={{ padding: 16 }}>
                    {/* Rating Overview */}
                    <Row gutter={[32, 32]} style={{ marginBottom: 32 }}>
                      <Col xs={24} md={8}>
                        <div style={{ textAlign: "center", padding: 24, background: "#f8f9fa", borderRadius: 12 }}>
                          <Title level={1} style={{ margin: 0, fontSize: 64, color: "#667eea" }}>
                            {rating > 0 ? rating.toFixed(1) : "0.0"}
                          </Title>
                          <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 24 }} />
                          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                            Based on {reviews} reviews
                          </Text>
                        </div>
                      </Col>
                      <Col xs={24} md={16}>
                        <div style={{ padding: "16px 0" }}>
                          {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="rating-bar">
                              <Text style={{ minWidth: 60 }}>{star} stars</Text>
                              <Progress
                                percent={star === 5 ? 70 : star === 4 ? 20 : 10}
                                strokeColor="#faad14"
                                style={{ flex: 1 }}
                              />
                              <Text type="secondary" style={{ minWidth: 40, textAlign: "right" }}>
                                {star === 5 ? 70 : star === 4 ? 20 : 10}%
                              </Text>
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>

                    {/* Reviews List */}
                    <Title level={5} style={{ marginBottom: 16 }}>
                      Customer Reviews
                    </Title>
                    {mockReviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <Space align="start" style={{ width: "100%" }}>
                          <Avatar size={48} style={{ background: "#667eea" }}>
                            {review.avatar}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                                <Text strong>{review.name}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {review.date}
                                </Text>
                              </Space>
                              <Rate disabled defaultValue={review.rating} style={{ fontSize: 14 }} />
                              <Paragraph style={{ margin: "8px 0 0 0" }}>{review.comment}</Paragraph>
                            </Space>
                          </div>
                        </Space>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: "shipping",
                label: <span><TruckOutlined /> Shipping</span>,
                children: (
                  <div style={{ padding: 16 }}>
                    <Timeline
                      items={[
                        {
                          icon: <ShopOutlined style={{ fontSize: 16 }} />,
                          content: (
                            <div>
                              <Text strong>Order Processing</Text>
                              <br />
                              <Text type="secondary">1-2 business days</Text>
                            </div>
                          ),
                        },
                        {
                          icon: <TruckOutlined style={{ fontSize: 16 }} />,
                          content: (
                            <div>
                              <Text strong>In Transit</Text>
                              <br />
                              <Text type="secondary">2-4 business days</Text>
                            </div>
                          ),
                        },
                        {
                          icon: <EnvironmentOutlined style={{ fontSize: 16 }} />,
                          content: (
                            <div>
                              <Text strong>Delivered</Text>
                              <br />
                              <Text type="secondary">Delivered to your doorstep</Text>
                            </div>
                          ),
                        },
                      ]}
                    />
                    <Divider />
                    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
                      <Card size="small">
                        <Text strong>Free Shipping</Text>
                        <br />
                        <Text type="secondary">On orders over {formatCurrency(1000)}</Text>
                      </Card>
                      {product.is_returnable && (
                        <Card size="small">
                          <Text strong>Easy Returns</Text>
                          <br />
                          <Text type="secondary">7-day return policy</Text>
                        </Card>
                      )}
                    </Space>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
