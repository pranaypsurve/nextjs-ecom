"use client";

import { useState } from "react";
import {
  Drawer,
  Button,
  InputNumber,
  Typography,
  Empty,
  Divider,
  Space,
  Image,
  Badge,
  Tag,
  Popconfirm,
  App,
  Progress,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  CloseOutlined,
  ShoppingOutlined,
  LockOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  HeartOutlined,
  PercentageOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeCart, removeFromCart, updateQuantity } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

const { Title, Text } = Typography;

const FREE_SHIPPING_THRESHOLD = 5000;

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { isOpen, items } = useAppSelector((state) => state.cart);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 50;
  const total = subtotal + estimatedShipping;
  
  // Free shipping progress
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountNeededForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  const handleClose = () => {
    dispatch(closeCart());
  };

  const handleRemove = (id: string) => {
    setRemovingId(id);
    dispatch(removeFromCart(id));
    message.success("Item removed from cart");
    setTimeout(() => setRemovingId(null), 300);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(id);
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleIncrement = (id: string, currentQty: number) => {
    handleQuantityChange(id, currentQty + 1);
  };

  const handleDecrement = (id: string, currentQty: number) => {
    if (currentQty > 1) {
      handleQuantityChange(id, currentQty - 1);
    } else {
      handleRemove(id);
    }
  };

  return (
    <Drawer
      title={
        <div className="cart-drawer-header">
          <style jsx global>{`
            .cart-drawer-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .cart-title-section {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .cart-icon-wrapper {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            @media (max-width: 768px) {
              .cart-icon-wrapper {
                width: 32px;
                height: 32px;
              }
            }
            .cart-badge {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            @media (max-width: 768px) {
              .cart-badge {
                font-size: 10px;
                padding: 3px 8px;
              }
            }
            .cart-drawer-content {
              display: flex;
              flex-direction: column;
              height: 100%;
            }
            @media (max-width: 768px) {
              :global(.ant-drawer-content-wrapper) {
                max-width: 100% !important;
                width: 100% !important;
              }
              :global(.ant-drawer-header) {
                padding: 16px 16px 12px !important;
              }
              :global(.ant-drawer-body) {
                padding: 0 !important;
              }
            }
            
            /* Free Shipping Banner */
            .free-shipping-banner {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 16px 20px;
              margin: 0 0px;
              margin-bottom: 16px;
            }
            .free-shipping-banner.unlocked {
              background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
            }
            @media (max-width: 768px) {
              .free-shipping-banner {
                padding: 12px 16px;
                margin-bottom: 12px;
              }
            }
            
            /* Cart Items Section */
            .cart-items-section {
              flex: 1;
              overflow-y: auto;
              padding: 0 24px 16px;
              margin-top: -8px;
            }
            @media (max-width: 768px) {
              .cart-items-section {
                padding: 0 12px 12px;
                margin-top: -4px;
              }
            }
            .cart-items-section::-webkit-scrollbar {
              width: 6px;
            }
            .cart-items-section::-webkit-scrollbar-track {
              background: #f5f5f5;
              border-radius: 10px;
            }
            .cart-items-section::-webkit-scrollbar-thumb {
              background: #d9d9d9;
              border-radius: 10px;
            }
            .cart-items-section::-webkit-scrollbar-thumb:hover {
              background: #bfbfbf;
            }
            
            /* Cart Item Card */
            .cart-item-card {
              background: white;
              border: 2px solid #f0f0f0;
              border-radius: 16px;
              padding: 16px;
              margin-bottom: 16px;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
            }
            @media (max-width: 768px) {
              .cart-item-card {
                padding: 12px;
                margin-bottom: 12px;
                border-radius: 12px;
                border-width: 1px;
              }
            }
            .cart-item-card:hover {
              box-shadow: 0 8px 24px rgba(102, 126, 234, 0.12);
              border-color: #667eea;
              transform: translateY(-2px);
            }
            @media (max-width: 768px) {
              .cart-item-card:hover {
                transform: none;
              }
            }
            .cart-item-card.removing {
              opacity: 0;
              transform: translateX(-30px) scale(0.95);
            }
            .item-content {
              display: flex;
              gap: 12px;
            }
            @media (max-width: 768px) {
              .item-content {
                gap: 10px;
              }
            }
            .item-image-container {
              width: 90px;
              height: 90px;
              border-radius: 12px;
              overflow: hidden;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              flex-shrink: 0;
              position: relative;
              border: 2px solid #f0f0f0;
            }
            @media (max-width: 768px) {
              .item-image-container {
                width: 70px;
                height: 70px;
                border-radius: 8px;
                border-width: 1px;
              }
            }
            .item-details {
              flex: 1;
              min-width: 0;
              display: flex;
              flex-direction: column;
            }
            .item-name {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 6px;
              color: #1f2937;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              line-height: 1.4;
            }
            @media (max-width: 768px) {
              .item-name {
                font-size: 13px;
                margin-bottom: 4px;
                -webkit-line-clamp: 2;
              }
            }
            .item-price-row {
              display: flex;
              align-items: center;
              gap: 8px;
              margin: 8px 0;
            }
            @media (max-width: 768px) {
              .item-price-row {
                margin: 6px 0;
              }
            }
            .current-price {
              font-size: 18px;
              font-weight: 700;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            @media (max-width: 768px) {
              .current-price {
                font-size: 16px;
              }
            }
            .quantity-section {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: auto;
              padding-top: 8px;
            }
            @media (max-width: 768px) {
              .quantity-section {
                padding-top: 6px;
              }
            }
            .quantity-controls {
              display: flex;
              align-items: center;
              gap: 4px;
              background: #f5f5f5;
              border-radius: 8px;
              padding: 4px;
            }
            @media (max-width: 768px) {
              .quantity-controls {
                padding: 3px;
                gap: 2px;
                border-radius: 6px;
              }
            }
            .quantity-btn {
              width: 30px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 6px;
              border: none;
              background: white;
              cursor: pointer;
              transition: all 0.2s;
              color: #667eea;
              font-weight: 600;
            }
            @media (max-width: 768px) {
              .quantity-btn {
                width: 26px;
                height: 26px;
                border-radius: 4px;
              }
            }
            .quantity-btn:hover {
              background: #667eea;
              color: white;
              transform: scale(1.1);
            }
            .quantity-btn:disabled {
              opacity: 0.4;
              cursor: not-allowed;
              transform: none;
            }
            .quantity-btn:disabled:hover {
              background: white;
              color: #667eea;
            }
            .quantity-display {
              min-width: 40px;
              text-align: center;
              font-weight: 700;
              font-size: 14px;
              color: #1f2937;
            }
            @media (max-width: 768px) {
              .quantity-display {
                min-width: 32px;
                font-size: 13px;
              }
            }
            .item-actions {
              position: absolute;
              top: 12px;
              right: 12px;
              display: flex;
              gap: 6px;
            }
            @media (max-width: 768px) {
              .item-actions {
                top: 8px;
                right: 8px;
                gap: 4px;
              }
            }
            .action-btn {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              border: 1px solid #e8e8e8;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
              color: #8c8c8c;
            }
            @media (max-width: 768px) {
              .action-btn {
                width: 28px;
                height: 28px;
                border-radius: 6px;
              }
            }
            .action-btn:hover {
              background: #fff1f0;
              border-color: #ff4d4f;
              color: #ff4d4f;
              transform: scale(1.1);
            }
            .action-btn.wishlist:hover {
              background: #fff7e6;
              border-color: #fa8c16;
              color: #fa8c16;
            }
            .item-subtotal {
              font-size: 13px;
              font-weight: 600;
              color: #595959;
            }
            @media (max-width: 768px) {
              .item-subtotal {
                font-size: 12px;
              }
            }
            
            /* Cart Summary */
            .cart-summary {
              border-top: 2px solid #f0f0f0;
              background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
              padding: 20px 24px 24px;
              box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
            }
            @media (max-width: 768px) {
              .cart-summary {
                padding: 16px 12px 16px;
                border-top-width: 1px;
              }
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              font-size: 14px;
            }
            @media (max-width: 768px) {
              .summary-row {
                font-size: 13px;
                margin-bottom: 10px;
              }
            }
            .summary-row.total {
              font-size: 20px;
              font-weight: 700;
              color: #1f2937;
              margin-top: 12px;
              padding-top: 12px;
              border-top: 2px solid #e8e8e8;
            }
            @media (max-width: 768px) {
              .summary-row.total {
                font-size: 18px;
                margin-top: 10px;
                padding-top: 10px;
                border-top-width: 1px;
              }
            }
            .summary-label {
              color: #595959;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .summary-value {
              font-weight: 600;
              color: #1f2937;
            }
            .summary-value.savings {
              color: #52c41a;
            }
            .summary-value.total {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-size: 24px;
            }
            @media (max-width: 768px) {
              .summary-value.total {
                font-size: 20px;
              }
            }
            .trust-badges {
              display: flex;
              gap: 12px;
              justify-content: center;
              margin: 16px 0;
              padding: 12px 0;
              border-top: 1px solid #f0f0f0;
            }
            @media (max-width: 768px) {
              .trust-badges {
                display: none;
              }
            }
            .trust-badge {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 11px;
              color: #8c8c8c;
              padding: 6px 12px;
              background: white;
              border-radius: 20px;
              border: 1px solid #f0f0f0;
            }
            .checkout-btn {
              height: 52px;
              font-size: 16px;
              font-weight: 700;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
              border-radius: 12px;
              box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
              transition: all 0.3s ease;
            }
            @media (max-width: 768px) {
              .checkout-btn {
                height: 48px;
                font-size: 15px;
                border-radius: 10px;
              }
            }
            .checkout-btn:hover {
              background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
            }
            .continue-shopping-btn {
              width: 100%;
              height: 44px;
              margin-top: 12px;
              border-radius: 12px;
              border: 2px solid #e8e8e8;
              font-weight: 600;
              transition: all 0.3s;
            }
            @media (max-width: 768px) {
              .continue-shopping-btn {
                height: 42px;
                margin-top: 10px;
                border-radius: 10px;
                font-size: 14px;
              }
            }
            .continue-shopping-btn:hover {
              border-color: #667eea;
              color: #667eea;
              background: #f0f7ff;
            }
            
            /* Empty State */
            .empty-cart-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 80px 24px;
              min-height: 500px;
            }
            .empty-cart-icon {
              font-size: 100px;
              color: #d9d9d9;
              margin-bottom: 24px;
              animation: float 3s ease-in-out infinite;
            }
            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-20px);
              }
            }
            .empty-cart-subtitle {
              max-width: 300px;
              text-align: center;
              margin-bottom: 32px;
              line-height: 1.6;
            }
            
            /* Promo Banner */
            .promo-banner {
              background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
              border: 2px dashed #ff9800;
              border-radius: 12px;
              padding: 12px 16px;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            @media (max-width: 768px) {
              .promo-banner {
                padding: 10px 12px;
                margin-bottom: 12px;
                border-radius: 8px;
                border-width: 1px;
                gap: 8px;
              }
            }
            .promo-icon {
              font-size: 24px;
              color: #ff9800;
            }
            @media (max-width: 768px) {
              .promo-icon {
                font-size: 20px;
              }
            }
            .promo-text {
              flex: 1;
              font-size: 13px;
              font-weight: 600;
              color: #e65100;
            }
            @media (max-width: 768px) {
              .promo-text {
                font-size: 11px;
              }
            }
            @media (max-width: 480px) {
              .promo-banner-container {
                display: none;
              }
            }
            @media (max-width: 768px) {
              .promo-banner-container {
                padding: 0 12px 12px !important;
              }
            }
          `}</style>
          <div className="cart-title-section">
            <div className="cart-icon-wrapper">
              <ShoppingCartOutlined style={{ fontSize: 20, color: "white" }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontSize: 18 }}>
                Shopping Cart
              </Title>
              {items.length > 0 && (
                <span className="cart-badge">
                  {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"}
                </span>
              )}
            </div>
          </div>
        </div>
      }
      placement="right"
      onClose={handleClose}
      open={isOpen}
      width={516}
      closable={false}
      styles={{
        body: { padding: 0 },
        header: { 
          padding: "24px 24px 20px", 
          borderBottom: "2px solid #f0f0f0" 
        },
      }}
      extra={
        <Button
          type="text"
          shape="circle"
          icon={<CloseOutlined />}
          onClick={handleClose}
          style={{ 
            color: "#8c8c8c",
            fontSize: 16,
          }}
        />
      }
    >
      <div className="cart-drawer-content">
        {items.length === 0 ? (
          <div className="empty-cart-container">
            <ShoppingCartOutlined className="empty-cart-icon" />
            <Title level={3} style={{ color: "#595959", marginBottom: 12 }}>
              Your Cart is Empty
            </Title>
            <Text type="secondary" className="empty-cart-subtitle">
              Discover amazing products and add them to your cart to get started!
            </Text>
            <Link href="/products" onClick={handleClose}>
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingOutlined />}
                className="checkout-btn"
                style={{ width: 240 }}
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Banner */}
            <div className={`free-shipping-banner ${freeShippingProgress >= 100 ? "unlocked" : ""}`}>
              <div style={{ marginBottom: 12 }}>
                {freeShippingProgress >= 100 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircleOutlined style={{ fontSize: 20, color: "white" }} />
                    <Text strong style={{ color: "white", fontSize: 15, lineHeight: 1.5 }}>
                      🎉 You've unlocked FREE shipping!
                    </Text>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <TruckOutlined style={{ fontSize: 18, color: "white", flexShrink: 0 }} />
                    <Text style={{ color: "white", fontSize: 13, lineHeight: 1.5, flex: 1 }}>
                      Add <Text strong style={{ color: "white", whiteSpace: "nowrap" }}>{formatCurrency(amountNeededForFreeShipping)}</Text> more for FREE shipping
                    </Text>
                  </div>
                )}
              </div>
              <Progress
                percent={freeShippingProgress}
                strokeColor={{
                  '0%': '#ffffff',
                  '100%': '#f0f0f0',
                }}
                railColor="rgba(255, 255, 255, 0.3)"
                showInfo={false}
                size={8}
                style={{ marginBottom: 0 }}
              />
            </div>

            {/* Promo Banner - Hidden on mobile to save space */}
            <div className="promo-banner-container" style={{ padding: "0 24px 16px" }}>
              <div className="promo-banner">
                <div className="promo-icon">
                  <PercentageOutlined />
                </div>
                <div className="promo-text">
                  Use code "SAVE10" for 10% off your first order!
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart-items-section">
              {items.map((item) => {
                const itemSubtotal = item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className={`cart-item-card ${removingId === item.id ? "removing" : ""}`}
                  >
                    <div className="item-content">
                      <div className="item-image-container">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={90}
                            height={90}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            preview={false}
                          />
                        ) : (
                          <div style={{ 
                            width: "100%", 
                            height: "100%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontSize: 36 
                          }}>
                            📦
                          </div>
                        )}
                      </div>

                      <div className="item-details">
                        <div className="item-name">
                          {item.productName}
                        </div>

                        {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                          <div style={{ marginBottom: 4 }}>
                            {Object.entries(item.variantOptions).map(([key, value]) => (
                              <Tag key={key} color="blue" style={{ fontSize: 11, marginRight: 4 }}>
                                {value}
                              </Tag>
                            ))}
                          </div>
                        )}

                        <div className="item-price-row">
                          <span className="current-price">{formatCurrency(item.price)}</span>
                        </div>

                        <div className="quantity-section">
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn"
                              onClick={() => handleDecrement(item.id, item.quantity)}
                              disabled={item.quantity <= 1}
                            >
                              <MinusOutlined style={{ fontSize: 12 }} />
                            </button>
                            <div className="quantity-display">{item.quantity}</div>
                            <button
                              className="quantity-btn"
                              onClick={() => handleIncrement(item.id, item.quantity)}
                            >
                              <PlusOutlined style={{ fontSize: 12 }} />
                            </button>
                          </div>
                          <div className="item-subtotal">
                            {formatCurrency(itemSubtotal)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="item-actions">
                      <Tooltip title="Save for later">
                        <button className="action-btn wishlist">
                          <HeartOutlined />
                        </button>
                      </Tooltip>
                      <Popconfirm
                        title="Remove item?"
                        description="Remove this item from your cart?"
                        onConfirm={() => handleRemove(item.id)}
                        okText="Remove"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <button className="action-btn">
                          <DeleteOutlined />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span className="summary-label">
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <span className="summary-value">{formatCurrency(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">
                  <TruckOutlined />
                  Shipping
                </span>
                <span className={`summary-value ${estimatedShipping === 0 ? "savings" : ""}`}>
                  {estimatedShipping === 0 ? "FREE" : formatCurrency(estimatedShipping)}
                </span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span className="summary-value total">{formatCurrency(total)}</span>
              </div>

              <div className="trust-badges">
                <div className="trust-badge">
                  <LockOutlined />
                  <span>Secure</span>
                </div>
                <div className="trust-badge">
                  <TruckOutlined />
                  <span>Fast Delivery</span>
                </div>
                <div className="trust-badge">
                  <GiftOutlined />
                  <span>Gift Wrap</span>
                </div>
              </div>

              <Link href="/checkout" style={{ display: "block" }} onClick={handleClose}>
                <Button type="primary" block size="large" className="checkout-btn">
                  <Space size={8}>
                    <ThunderboltOutlined />
                    <span>Proceed to Checkout</span>
                  </Space>
                </Button>
              </Link>

              <Link href="/products" onClick={handleClose}>
                <Button block className="continue-shopping-btn">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
