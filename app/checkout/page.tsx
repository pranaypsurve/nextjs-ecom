"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Radio,
  Space,
  Divider,
  Empty,
  App,
  Row,
  Col,
  Tag,
  Badge,
  Alert,
  Image,
  Modal,
  Result,
  Checkbox,
} from "antd";
import {
  CreditCardOutlined,
  DollarOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  TruckOutlined,
  SafetyOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  WalletOutlined,
  MobileOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { usePlaceOrderMutation } from "@/store/api/ordersApi";
import { useGetCouponByCodeQuery } from "@/store/api/couponsApi";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Fetch coupon if code is entered
  const {
    data: coupon,
    isLoading: isLoadingCoupon,
    error: couponError,
  } = useGetCouponByCodeQuery(couponCode, {
    skip: !couponCode || couponCode.length < 3,
  });

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const shipping = 50; // Fixed shipping cost
  const tax = useMemo(() => subtotal * 0.18, [subtotal]); // 18% GST

  // Calculate discount
  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;

    const minAmount = appliedCoupon.minimum_amount || 0;
    if (subtotal < minAmount) return 0;

    let discountAmount = 0;
    if (appliedCoupon.type === "percentage") {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maximum_discount) {
        discountAmount = Math.min(discountAmount, appliedCoupon.maximum_discount);
      }
    } else if (appliedCoupon.type === "fixed") {
      discountAmount = appliedCoupon.value;
    }

    return discountAmount;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    const calculatedTotal = subtotal + shipping + tax - discount;
    return Math.max(0, calculatedTotal);
  }, [subtotal, shipping, tax, discount]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/products");
    }
  }, [items, router]);

  // Auto-apply coupon when fetched successfully
  useEffect(() => {
    if (coupon && !couponError && coupon.is_active !== false) {
      // Check if coupon is valid
      const now = new Date();
      const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

      if (
        (!validFrom || now >= validFrom) &&
        (!validUntil || now <= validUntil) &&
        (!coupon.minimum_amount || subtotal >= coupon.minimum_amount)
      ) {
        setAppliedCoupon(coupon);
        message.success(`Coupon "${coupon.code}" applied successfully!`);
      } else {
        message.error("This coupon is not valid for your order");
      }
    } else if (couponError && couponCode) {
      message.error("Invalid coupon code");
    }
  }, [coupon, couponError, couponCode, subtotal, message]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      message.warning("Please enter a coupon code");
      return;
    }
    // The useEffect will handle applying the coupon when it's fetched
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    message.info("Coupon removed");
  };

  const handleSubmit = async (values: any) => {
    try {
      // Transform cart items to API format
      const orderItems = items.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      }));

      // Build shipping address object matching API structure
      const shippingAddress = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        street_address: values.streetAddress,
        city: values.city,
        state: values.state,
        zip_code: values.zipCode,
        country: values.country || "India",
      };

      // Prepare order payload
      const orderPayload = {
        items: orderItems,
        shipping_cost: shipping,
        shipping_address: shippingAddress,
        save_address: saveAddress,
        notes: `Payment method: ${paymentMethod}. Phone: ${values.phone}`,
        couponId: appliedCoupon ? Number(appliedCoupon.id) : undefined,
      };

      // Place order via API
      const result = await placeOrder(orderPayload).unwrap();

      // Clear cart on success
      dispatch(clearCart());

      // Set order success state
      if (result.data?.id) {
        const orderIdStr = String(result.data.id);
        setOrderId(orderIdStr);
        setOrderNumber(`ORD-${orderIdStr.slice(0, 8).toUpperCase()}`);
        setOrderSuccess(true);
      } else {
        message.success(result.message || "Order placed successfully!");
        router.push("/orders");
      }
    } catch (error: any) {
      console.error("Order placement error:", error);
      const errorMessage = 
        error?.data?.message || 
        error?.data?.error || 
        error?.message || 
        "Failed to place order. Please try again.";
      message.error(errorMessage);
    }
  };

  return (
    <ProtectedRoute>
      <div className="checkout-page">
        <style jsx>{`
          .checkout-page {
            min-height: calc(100vh - 64px);
            background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          }
          .checkout-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 24px;
            text-align: center;
          }
          .checkout-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 24px;
          }
          .section-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            margin-bottom: 24px;
            overflow: hidden;
          }
          .section-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px 24px;
            border-bottom: 2px solid #e8e8e8;
          }
          .section-body {
            padding: 24px;
          }
          .order-item {
            display: flex;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .order-item:last-child {
            border-bottom: none;
          }
          .item-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            flex-shrink: 0;
          }
          .coupon-input-group {
            display: flex;
            gap: 8px;
          }
          .coupon-applied {
            background: #f6ffed;
            border: 1px solid #b7eb8f;
            border-radius: 8px;
            padding: 12px 16px;
            margin-top: 12px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .total-row {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 24px;
            border-radius: 12px;
            margin-top: 16px;
          }
          .payment-option {
            border: 2px solid #e8e8e8;
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 12px;
          }
          .payment-option:hover {
            border-color: var(--color-primary);
            background: #f0f7ff;
          }
          .payment-option.selected {
            border-color: var(--color-primary);
            background: #e6f4ff;
          }
          .trust-indicators {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e8e8e8;
          }
          .trust-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            font-size: 13px;
          }
        `}</style>

        {items.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Empty description="Your cart is empty">
              <Button type="primary" size="large" onClick={() => router.push("/products")}>
                Continue Shopping
              </Button>
            </Empty>
            <Form form={form} style={{ display: "none" }} />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="checkout-header">
              <Title level={1} style={{ color: "white", marginBottom: 8, fontSize: 36, fontWeight: 700 }}>
                Secure Checkout
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
                Complete your order in just a few steps
              </Text>
            </div>

            <div className="checkout-content">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                style={{ marginBottom: 24 }}
              >
                Back to Cart
              </Button>

              <Row gutter={[32, 32]}>
                {/* Left Column - Forms */}
                <Col xs={24} lg={16}>
                  {/* Shipping Information */}
                  <div className="section-card">
                    <div className="section-header">
                      <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <TruckOutlined /> Shipping Information
                      </Title>
                    </div>
                    <div className="section-body">
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                          email: user?.email || "",
                          firstName: user?.name?.split(" ")[0] || "",
                          lastName: user?.name?.split(" ").slice(1).join(" ") || "",
                        }}
                      >
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="firstName"
                              label="First Name"
                              rules={[{ required: true, message: "Please enter your first name" }]}
                            >
                              <Input size="large" placeholder="John" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="lastName"
                              label="Last Name"
                              rules={[{ required: true, message: "Please enter your last name" }]}
                            >
                              <Input size="large" placeholder="Doe" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          name="email"
                          label="Email Address"
                          rules={[
                            { required: true, message: "Please enter your email" },
                            { type: "email", message: "Please enter a valid email" },
                          ]}
                        >
                          <Input size="large" placeholder="john.doe@example.com" />
                        </Form.Item>

                        <Form.Item
                          name="phone"
                          label="Phone Number"
                          rules={[
                            { required: true, message: "Please enter your phone number" },
                            { pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, message: "Please enter a valid phone number" },
                          ]}
                        >
                          <Input size="large" placeholder="+91 9876543210" />
                        </Form.Item>

                        <Form.Item
                          name="streetAddress"
                          label="Street Address"
                          rules={[{ required: true, message: "Please enter your street address" }]}
                        >
                          <Input size="large" placeholder="123 Main Street, Apartment 4B" />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              name="city"
                              label="City"
                              rules={[{ required: true, message: "Please enter your city" }]}
                            >
                              <Input size="large" placeholder="Mumbai" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              name="state"
                              label="State"
                              rules={[{ required: true, message: "Please enter your state" }]}
                            >
                              <Input size="large" placeholder="Maharashtra" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              name="zipCode"
                              label="Zip Code"
                              rules={[
                                { required: true, message: "Please enter zip code" },
                                { pattern: /^[0-9]{6}$/, message: "Please enter a valid 6-digit zip code" },
                              ]}
                            >
                              <Input size="large" placeholder="400001" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          name="country"
                          label="Country"
                          rules={[{ required: true, message: "Please enter your country" }]}
                          initialValue="India"
                        >
                          <Input size="large" placeholder="India" />
                        </Form.Item>

                        <Form.Item>
                          <Checkbox
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            style={{ marginTop: 8 }}
                          >
                            <Text>Save this address for future orders</Text>
                          </Checkbox>
                        </Form.Item>
                      </Form>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="section-card">
                    <div className="section-header">
                      <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <LockOutlined /> Payment Method
                      </Title>
                    </div>
                    <div className="section-body">
                      <Radio.Group
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <Space direction="vertical" style={{ width: "100%" }} size="middle">
                          <Radio value="cod">
                            <div
                              className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("cod")}
                            >
                              <Space>
                                <WalletOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                                <div style={{ flex: 1 }}>
                                  <Space>
                                    <Text strong style={{ display: "block" }}>
                                      Cash on Delivery (COD)
                                    </Text>
                                    <Tag color="green" style={{ marginLeft: 8 }}>
                                      Popular
                                    </Tag>
                                  </Space>
                                  <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                                    Pay when you receive your order
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Radio>
                          <Radio value="gpay">
                            <div
                              className={`payment-option ${paymentMethod === "gpay" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("gpay")}
                            >
                              <Space>
                                <QrcodeOutlined style={{ fontSize: 24, color: "#4285F4" }} />
                                <div>
                                  <Text strong style={{ display: "block" }}>
                                    Google Pay
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Pay instantly with Google Pay
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Radio>
                          <Radio value="phonepe">
                            <div
                              className={`payment-option ${paymentMethod === "phonepe" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("phonepe")}
                            >
                              <Space>
                                <MobileOutlined style={{ fontSize: 24, color: "#5F259F" }} />
                                <div>
                                  <Text strong style={{ display: "block" }}>
                                    PhonePe
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Pay with PhonePe UPI
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Radio>
                          <Radio value="card">
                            <div
                              className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("card")}
                            >
                              <Space>
                                <CreditCardOutlined style={{ fontSize: 24, color: "var(--color-primary)" }} />
                                <div>
                                  <Text strong style={{ display: "block" }}>
                                    Credit/Debit Card
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Pay securely with your card
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Radio>
                          <Radio value="paypal">
                            <div
                              className={`payment-option ${paymentMethod === "paypal" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("paypal")}
                            >
                              <Space>
                                <DollarOutlined style={{ fontSize: 24, color: "var(--color-primary)" }} />
                                <div>
                                  <Text strong style={{ display: "block" }}>
                                    PayPal
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Pay with your PayPal account
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Radio>
                        </Space>
                      </Radio.Group>

                      <div className="trust-indicators">
                        <div className="trust-item">
                          <SafetyOutlined />
                          <Text>SSL Encrypted</Text>
                        </div>
                        <div className="trust-item">
                          <LockOutlined />
                          <Text>Secure Payment</Text>
                        </div>
                        <div className="trust-item">
                          <CheckCircleOutlined />
                          <Text>Money Back Guarantee</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right Column - Order Summary */}
                <Col xs={24} lg={8}>
                  <div className="section-card" style={{ position: "sticky", top: 80 }}>
                    <div className="section-header">
                      <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <ShoppingOutlined /> Order Summary
                      </Title>
                    </div>
                    <div className="section-body">
                      {/* Order Items */}
                      <div style={{ marginBottom: 24 }}>
                        {items.map((item) => (
                          <div key={item.id} className="order-item">
                            <div className="item-image" style={{ position: "relative", overflow: "hidden" }}>
                              {item.product.images?.[0] ? (
                                <Image
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  width={80}
                                  height={80}
                                  style={{ objectFit: "cover", borderRadius: 8 }}
                                />
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    fontSize: 32,
                                  }}
                                >
                                  📦
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Text strong style={{ display: "block", marginBottom: 4 }}>
                                {item.product.name}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Qty: {item.quantity} × {formatCurrency(item.price)}
                              </Text>
                            </div>
                            <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                          </div>
                        ))}
                      </div>

                      <Divider style={{ margin: "16px 0" }} />

                      {/* Coupon Section */}
                      <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ display: "block", marginBottom: 12 }}>
                          <TagOutlined /> Coupon Code
                        </Text>
                        {!appliedCoupon ? (
                          <div className="coupon-input-group">
                            <Input
                              size="large"
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              onPressEnter={handleApplyCoupon}
                              disabled={isLoadingCoupon}
                            />
                            <Button
                              type="primary"
                              size="large"
                              onClick={handleApplyCoupon}
                              loading={isLoadingCoupon}
                              style={{ borderRadius: 8 }}
                            >
                              Apply
                            </Button>
                          </div>
                        ) : (
                          <div className="coupon-applied">
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <Space>
                                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                                <Text strong>{appliedCoupon.code}</Text>
                                <Tag color="green">
                                  {appliedCoupon.type === "percentage"
                                    ? `${appliedCoupon.value}% OFF`
                                    : `${formatCurrency(appliedCoupon.value)} OFF`}
                                </Tag>
                              </Space>
                              <Button
                                type="text"
                                size="small"
                                icon={<CloseCircleOutlined />}
                                onClick={handleRemoveCoupon}
                              >
                                Remove
                              </Button>
                            </Space>
                          </div>
                        )}
                      </div>

                      <Divider style={{ margin: "16px 0" }} />

                      {/* Price Breakdown */}
                      <div>
                        <div className="summary-row">
                          <Text>Subtotal</Text>
                          <Text>{formatCurrency(subtotal)}</Text>
                        </div>
                        <div className="summary-row">
                          <Text>Shipping</Text>
                          <Text>{formatCurrency(shipping)}</Text>
                        </div>
                        <div className="summary-row">
                          <Text>Tax (GST 18%)</Text>
                          <Text>{formatCurrency(tax)}</Text>
                        </div>
                        {discount > 0 && (
                          <div className="summary-row">
                            <Text type="success">
                              <TagOutlined /> Discount
                            </Text>
                            <Text type="success" strong>
                              -{formatCurrency(discount)}
                            </Text>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="total-row">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Text strong style={{ fontSize: 18, color: "white" }}>
                            Total Amount
                          </Text>
                          <Text strong style={{ fontSize: 24, color: "white" }}>
                            {formatCurrency(total)}
                          </Text>
                        </div>
                      </div>

                      {/* Place Order Button */}
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        loading={isPlacingOrder}
                        onClick={() => form.submit()}
                        style={{
                          marginTop: 24,
                          height: 50,
                          fontSize: 16,
                          fontWeight: 600,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none",
                          borderRadius: 8,
                        }}
                      >
                        {isPlacingOrder
                          ? "Processing..."
                          : paymentMethod === "cod"
                            ? `Place Order (Pay ₹${total.toFixed(0)} on Delivery)`
                            : `Place Order & Pay ${formatCurrency(total)}`}
                      </Button>

                      <Alert
                        message="Secure Checkout"
                        description="Your payment information is encrypted and secure"
                        type="info"
                        showIcon
                        style={{ marginTop: 16, borderRadius: 8 }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        )}

        {/* Order Success Modal */}
        <Modal
          open={orderSuccess}
          footer={null}
          closable={false}
          width={600}
          centered
          styles={{
            body: { padding: 0 },
          }}
        >
          <style>{`
            @keyframes scaleIn {
              from {
                transform: scale(0);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
            .order-success-modal {
              text-align: center;
              padding: 40px 24px;
            }
            .success-icon {
              width: 120px;
              height: 120px;
              margin: 0 auto 24px;
              background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: scaleIn 0.5s ease-out;
            }
            .order-id-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 24px;
              border-radius: 12px;
              margin: 24px 0;
            }
            .order-id-text {
              font-size: 14px;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .order-id-value {
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 2px;
              font-family: monospace;
            }
            .success-message {
              font-size: 20px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 12px;
            }
            .success-subtitle {
              color: #6b7280;
              font-size: 15px;
              margin-bottom: 32px;
            }
            .next-steps {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              text-align: left;
            }
            .step-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 0;
              border-bottom: 1px solid #e8e8e8;
            }
            .step-item:last-child {
              border-bottom: none;
            }
            .step-number {
              width: 32px;
              height: 32px;
              background: var(--color-primary);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              flex-shrink: 0;
            }
            .action-buttons {
              display: flex;
              gap: 12px;
              margin-top: 24px;
            }
          `}</style>
          <div className="order-success-modal">

            <div className="success-icon">
              <CheckCircleOutlined style={{ fontSize: 64, color: "white" }} />
            </div>

            <div className="success-message">
              🎉 Thank You for Your Order!
            </div>
            <div className="success-subtitle">
              We're thrilled to have you as our valued customer. Your order has been confirmed and is being processed.
            </div>

            <div className="order-id-box">
              <div className="order-id-text">Your Order Number</div>
              <div className="order-id-value">{orderNumber}</div>
            </div>

            <div className="next-steps">
              <Text strong style={{ display: "block", marginBottom: 16, fontSize: 16 }}>
                What's Next?
              </Text>
              <div className="step-item">
                <div className="step-number">1</div>
                <div>
                  <Text strong style={{ display: "block" }}>
                    Order Confirmation Email
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    We've sent a confirmation email with order details
                  </Text>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div>
                  <Text strong style={{ display: "block" }}>
                    Track Your Order
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    You can track your order status in real-time
                  </Text>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div>
                  <Text strong style={{ display: "block" }}>
                    Delivery Updates
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    We'll notify you when your order is shipped
                  </Text>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => {
                  if (orderId) {
                    router.push(`/orders/${orderId}`);
                  } else {
                    router.push("/orders");
                  }
                }}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                View Order Details
              </Button>
              <Button
                size="large"
                block
                onClick={() => router.push("/products")}
                style={{ height: 48, fontSize: 16 }}
              >
                Continue Shopping
              </Button>
            </div>

            <div style={{ marginTop: 24, padding: "16px 0", borderTop: "1px solid #e8e8e8" }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Need help?{" "}
                <Link href="/contact" style={{ color: "var(--color-primary)" }}>
                  Contact our support team
                </Link>
              </Text>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

