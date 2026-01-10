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
  Steps,
  Tooltip,
  Progress,
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
  HomeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckOutlined,
  UserOutlined,
  FireOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  PercentageOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { usePlaceOrderMutation } from "@/store/api/ordersApi";
import { useGetCouponByCodeQuery } from "@/store/api/couponsApi";
import { useGetShippingAddressesQuery } from "@/store/api/shippingAddressesApi";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;

const FREE_SHIPPING_THRESHOLD = 5000;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [billingForm] = Form.useForm();
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [giftMessage, setGiftMessage] = useState("");
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  // Address management
  const { data: savedAddresses = [], isLoading: isLoadingAddresses } = useGetShippingAddressesQuery();
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string | number>("new");
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>("same");
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [saveBillingAddress, setSaveBillingAddress] = useState(false);

  // Fetch coupon if code is entered
  const {
    data: coupon,
    isLoading: isLoadingCoupon,
    error: couponError,
  } = useGetCouponByCodeQuery(couponCode, {
    skip: !couponCode || couponCode.length < 3,
  });

  // Calculations
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 50;
  const tax = useMemo(() => subtotal * 0.18, [subtotal]); // 18% GST
  const giftWrapCost = includeGiftWrap ? 25 : 0;

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
    const calculatedTotal = subtotal + shipping + tax + giftWrapCost - discount;
    return Math.max(0, calculatedTotal);
  }, [subtotal, shipping, tax, discount, giftWrapCost]);
  
  // Savings calculation
  const totalSavings = discount + (subtotal >= FREE_SHIPPING_THRESHOLD ? 50 : 0);

  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push("/products");
    }
  }, [items, router, orderSuccess]);

  // Set default to new address if no saved addresses
  useEffect(() => {
    if (savedAddresses.length === 0) {
      setUseNewAddress(true);
      setSelectedShippingAddress("new");
    } else {
      const defaultAddress = savedAddresses.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedShippingAddress(defaultAddress.id);
        setUseNewAddress(false);
        form.setFieldsValue({
          firstName: defaultAddress.first_name,
          lastName: defaultAddress.last_name,
          email: defaultAddress.email || user?.email || "",
          phone: defaultAddress.phone,
          streetAddress: defaultAddress.street_address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipCode: defaultAddress.zip_code,
          country: defaultAddress.country || "India",
        });
      }
    }
  }, [savedAddresses, form, user]);

  // Sync billing form with shipping form when "same" is selected
  useEffect(() => {
    if (selectedBillingAddress === "same") {
      const shippingValues = form.getFieldsValue();
      billingForm.setFieldsValue(shippingValues);
    }
  }, [selectedBillingAddress, form, billingForm]);

  // Auto-apply coupon when fetched successfully
  useEffect(() => {
    if (coupon && !couponError && coupon.is_active !== false) {
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
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    message.info("Coupon removed");
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedBillingAddress === "different" && !selectedBillingAddressId) {
        try {
          await billingForm.validateFields();
        } catch (error) {
          message.error("Please fill in all billing address fields");
          return;
        }
      }

      // Map cart items to order items (variantId in cart is actually productId)
      const orderItems = items.map((item) => ({
        productId: String(item.variantId), // variantId in cart is actually the product ID
        quantity: item.quantity,
      }));

      const orderPayload: any = {
        items: orderItems,
        shipping_cost: shipping,
        notes: `Payment method: ${paymentMethod}. Phone: ${values.phone}${giftMessage ? `. Gift message: ${giftMessage}` : ''}`,
        couponId: appliedCoupon ? String(appliedCoupon.id) : undefined,
      };

      if (selectedShippingAddress !== "new" && savedAddresses.length > 0) {
        const selectedAddr = savedAddresses.find((addr) => addr.id === selectedShippingAddress);
        if (selectedAddr) {
          orderPayload.shipping_address_id = String(selectedAddr.id);
        }
      } else {
        orderPayload.shipping_address = {
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
        if (saveAddress) {
          orderPayload.save_shipping_address = true;
        }
      }

      if (selectedBillingAddress === "same") {
        orderPayload.billing_same_as_shipping = true;
      } else {
        orderPayload.billing_same_as_shipping = false;
        
        if (selectedBillingAddressId) {
          orderPayload.billing_address_id = String(selectedBillingAddressId);
        } else {
          const billingValues = billingForm.getFieldsValue();
          orderPayload.billing_address = {
            first_name: billingValues.firstName,
            last_name: billingValues.lastName,
            email: billingValues.email,
            phone: billingValues.phone,
            street_address: billingValues.streetAddress,
            city: billingValues.city,
            state: billingValues.state,
            zip_code: billingValues.zipCode,
            country: billingValues.country || "India",
          };
          if (saveBillingAddress) {
            orderPayload.save_billing_address = true;
          }
        }
      }

      const result = await placeOrder(orderPayload).unwrap();
      dispatch(clearCart());

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

  const steps = [
    { title: "Address", icon: <HomeOutlined /> },
    { title: "Payment", icon: <CreditCardOutlined /> },
    { title: "Review", icon: <CheckCircleOutlined /> },
  ];

  return (
    <ProtectedRoute>
      <div className="checkout-page">
        <style jsx global>{`
          .checkout-page {
            min-height: calc(100vh - 64px);
            background: #f5f5f5;
          }
          .checkout-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 48px 24px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .checkout-hero::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.1;
          }
          .checkout-hero-content {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
          }
          .steps-container {
            max-width: 800px;
            margin: -30px auto 0;
            padding: 0 24px;
            position: relative;
            z-index: 10;
          }
          .steps-card {
            background: white;
            border-radius: 16px;
            padding: 24px 32px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          }
          .checkout-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 48px 24px;
          }
          .section-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            margin-bottom: 24px;
            overflow: hidden;
            border: 2px solid transparent;
            transition: all 0.3s ease;
          }
          .section-card:hover {
            border-color: #667eea;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          }
          .section-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px 28px;
            border-bottom: 2px solid #e8e8e8;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .section-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
          }
          .section-body {
            padding: 28px;
          }
          .address-card {
            border: 2px solid #e8e8e8;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
          }
          .address-card:hover {
            border-color: #667eea;
            background: #f0f7ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          }
          .address-card.selected {
            border-color: #667eea;
            background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
          }
          .payment-method-card {
            border: 2px solid #e8e8e8;
            border-radius: 16px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 16px;
            background: white;
          }
          .payment-method-card:hover {
            border-color: #667eea;
            background: #f0f7ff;
            transform: translateY(-2px);
          }
          .payment-method-card.selected {
            border-color: #667eea;
            background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .payment-icon-wrapper {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            background: white;
            border: 2px solid #f0f0f0;
            transition: all 0.3s ease;
          }
          .payment-method-card.selected .payment-icon-wrapper {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
          }
          .order-item-card {
            display: flex;
            gap: 16px;
            padding: 16px;
            border: 2px solid #f0f0f0;
            border-radius: 12px;
            margin-bottom: 12px;
            background: white;
            transition: all 0.3s ease;
          }
          .order-item-card:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
          }
          .item-image-wrapper {
            width: 80px;
            height: 80px;
            border-radius: 10px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            flex-shrink: 0;
            overflow: hidden;
            border: 2px solid #f0f0f0;
          }
          .summary-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            position: sticky;
            top: 24px;
            border: 2px solid #f0f0f0;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f5f5f5;
            font-size: 15px;
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .total-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .savings-badge {
            background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
          }
          .checkout-btn {
            height: 56px;
            font-size: 18px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
          }
          .checkout-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          }
          .trust-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
          }
          .trust-badge-item {
            text-align: center;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 1px solid #e8e8e8;
            transition: all 0.3s ease;
          }
          .trust-badge-item:hover {
            background: white;
            border-color: #667eea;
            transform: translateY(-2px);
          }
          .gift-wrap-section {
            background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
            border: 2px dashed #fa8c16;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
          }
          @media (max-width: 768px) {
            .checkout-content {
              padding: 24px 16px;
            }
            .steps-container {
              margin: -20px 16px 0;
            }
          }
          
          /* Success Modal Styles */
          @keyframes scaleIn {
            from {
              transform: scale(0) rotate(-180deg);
              opacity: 0;
            }
            to {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }
          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .success-modal-container {
            text-align: center;
            padding: 48px 32px;
          }
          .success-icon-wrapper {
            width: 120px;
            height: 120px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 12px 32px rgba(82, 196, 26, 0.3);
          }
          .order-number-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 28px;
            border-radius: 16px;
            margin: 28px 0;
            animation: slideUp 0.6s ease-out 0.2s both;
          }
          .order-number-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 8px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .order-number-value {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
          }
          .success-title {
            font-size: 28px;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 12px;
            animation: slideUp 0.6s ease-out 0.1s both;
          }
          .success-subtitle {
            color: #6b7280;
            font-size: 15px;
            margin-bottom: 32px;
            line-height: 1.6;
            animation: slideUp 0.6s ease-out 0.15s both;
          }
          .steps-info-card {
            background: #f8f9fa;
            border-radius: 16px;
            padding: 24px;
            margin: 24px 0;
            text-align: left;
            animation: slideUp 0.6s ease-out 0.25s both;
          }
          .info-step {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid #e8e8e8;
          }
          .info-step:last-child {
            border-bottom: none;
          }
          .step-number {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            flex-shrink: 0;
          }
          .action-buttons-row {
            display: flex;
            gap: 12px;
            margin-top: 32px;
            animation: slideUp 0.6s ease-out 0.3s both;
          }
        `}</style>

        {items.length === 0 && !orderSuccess ? (
          <div style={{ padding: "80px 24px", textAlign: "center", background: "#f5f5f5", minHeight: "60vh" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4}>Your cart is empty</Title>
                  <Text type="secondary">Add some products to continue shopping</Text>
                </div>
              }
            >
              <Button type="primary" size="large" onClick={() => router.push("/products")}>
                Continue Shopping
              </Button>
            </Empty>
            <Form form={form} style={{ display: "none" }} />
          </div>
        ) : !orderSuccess ? (
          <>
            {/* Hero Section */}
            <div className="checkout-hero">
              <div className="checkout-hero-content">
                <LockOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.9 }} />
                <Title level={1} style={{ color: "white", marginBottom: 12, fontSize: 40, fontWeight: 800 }}>
                  Secure Checkout
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: 16 }}>
                  Complete your purchase in just a few simple steps
                </Text>
              </div>
            </div>

            {/* Steps Progress */}
            <div className="steps-container">
              <Card className="steps-card" bordered={false}>
                <Steps
                  current={currentStep}
                  items={steps.map((step, index) => ({
                    title: step.title,
                    icon: currentStep > index ? <CheckCircleOutlined /> : step.icon,
                  }))}
                />
              </Card>
            </div>

            <div className="checkout-content">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                size="large"
                style={{ marginBottom: 32, fontSize: 15, fontWeight: 600 }}
              >
                Back to Cart
              </Button>

              <Row gutter={[32, 32]}>
                {/* Left Column - Forms */}
                <Col xs={24} lg={16}>
                  {/* Shipping Address Section */}
                  <div className="section-card">
                    <div className="section-header">
                      <div className="section-icon">
                        <TruckOutlined />
                      </div>
                      <Title level={4} style={{ margin: 0 }}>
                        Shipping Address
                      </Title>
                    </div>
                    <div className="section-body">
                      {savedAddresses.length > 0 && (
                        <>
                          <Radio.Group
                            value={selectedShippingAddress}
                            onChange={(e) => {
                              setSelectedShippingAddress(e.target.value);
                              setUseNewAddress(e.target.value === "new");
                              if (e.target.value !== "new") {
                                const selectedAddr = savedAddresses.find((addr) => addr.id === e.target.value);
                                if (selectedAddr) {
                                  form.setFieldsValue({
                                    firstName: selectedAddr.first_name,
                                    lastName: selectedAddr.last_name,
                                    email: selectedAddr.email || user?.email || "",
                                    phone: selectedAddr.phone,
                                    streetAddress: selectedAddr.street_address,
                                    city: selectedAddr.city,
                                    state: selectedAddr.state,
                                    zipCode: selectedAddr.zip_code,
                                    country: selectedAddr.country || "India",
                                  });
                                }
                              }
                            }}
                            style={{ width: "100%" }}
                          >
                            <Space orientation="vertical" style={{ width: "100%" }} size="middle">
                              {savedAddresses.map((address) => (
                                <Radio key={address.id} value={address.id} style={{ width: "100%" }}>
                                  <div
                                    className={`address-card ${selectedShippingAddress === address.id ? "selected" : ""}`}
                                    onClick={() => {
                                      setSelectedShippingAddress(address.id);
                                      setUseNewAddress(false);
                                      form.setFieldsValue({
                                        firstName: address.first_name,
                                        lastName: address.last_name,
                                        email: address.email || user?.email || "",
                                        phone: address.phone,
                                        streetAddress: address.street_address,
                                        city: address.city,
                                        state: address.state,
                                        zipCode: address.zip_code,
                                        country: address.country || "India",
                                      });
                                    }}
                                  >
                                    <Space align="start" size={16}>
                                      <HomeOutlined style={{ fontSize: 24, color: "#667eea" }} />
                                      <div style={{ flex: 1 }}>
                                        <Space size={8} style={{ marginBottom: 8 }}>
                                          <Text strong style={{ fontSize: 16 }}>
                                            {address.label || 
                                              (address.address_type === "home" ? "Home" : 
                                               address.address_type === "work" ? "Work" : "Other")}
                                          </Text>
                                          {address.is_default && <Tag color="blue">Default</Tag>}
                                          {selectedShippingAddress === address.id && (
                                            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
                                          )}
                                        </Space>
                                        <div>
                                          <Text style={{ display: "block", marginBottom: 4 }}>
                                            {address.first_name} {address.last_name}
                                          </Text>
                                          <Text type="secondary" style={{ fontSize: 14 }}>
                                            {address.street_address}, {address.city}, {address.state} {address.zip_code}
                                          </Text>
                                          <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                                            <PhoneOutlined /> {address.phone}
                                          </Text>
                                        </div>
                                      </div>
                                    </Space>
                                  </div>
                                </Radio>
                              ))}
                              <Radio value="new" style={{ width: "100%" }}>
                                <div
                                  className={`address-card ${selectedShippingAddress === "new" ? "selected" : ""}`}
                                  onClick={() => {
                                    setSelectedShippingAddress("new");
                                    setUseNewAddress(true);
                                    form.resetFields();
                                    form.setFieldsValue({
                                      email: user?.email || "",
                                      firstName: user?.name?.split(" ")[0] || "",
                                      lastName: user?.name?.split(" ").slice(1).join(" ") || "",
                                      country: "India",
                                    });
                                  }}
                                  style={{ textAlign: "center", padding: "32px" }}
                                >
                                  <PlusOutlined style={{ fontSize: 32, color: "#667eea", marginBottom: 12 }} />
                                  <Text strong style={{ display: "block", fontSize: 16, color: "#667eea" }}>
                                    Add New Address
                                  </Text>
                                </div>
                              </Radio>
                            </Space>
                          </Radio.Group>
                          <Divider />
                        </>
                      )}

                      {(useNewAddress || savedAddresses.length === 0) && (
                        <Form
                          form={form}
                          layout="vertical"
                          onFinish={handleSubmit}
                          initialValues={{
                            email: user?.email || "",
                            firstName: user?.name?.split(" ")[0] || "",
                            lastName: user?.name?.split(" ").slice(1).join(" ") || "",
                            country: "India",
                          }}
                        >
                          <Row gutter={[16, 0]}>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                name="firstName"
                                label={<Text strong><UserOutlined /> First Name</Text>}
                                rules={[{ required: true, message: "Required" }]}
                              >
                                <Input size="large" placeholder="John" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                name="lastName"
                                label={<Text strong><UserOutlined /> Last Name</Text>}
                                rules={[{ required: true, message: "Required" }]}
                              >
                                <Input size="large" placeholder="Doe" />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={[16, 0]}>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                name="email"
                                label={<Text strong><MailOutlined /> Email</Text>}
                                rules={[
                                  { required: true, message: "Required" },
                                  { type: "email", message: "Invalid email" },
                                ]}
                              >
                                <Input size="large" placeholder="john@example.com" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                name="phone"
                                label={<Text strong><PhoneOutlined /> Phone</Text>}
                                rules={[{ required: true, message: "Required" }]}
                              >
                                <Input size="large" placeholder="+91 9876543210" />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item
                            name="streetAddress"
                            label={<Text strong><EnvironmentOutlined /> Street Address</Text>}
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input size="large" placeholder="123 Main Street, Apartment 4B" />
                          </Form.Item>

                          <Row gutter={[16, 0]}>
                            <Col xs={24} sm={8}>
                              <Form.Item
                                name="city"
                                label={<Text strong>City</Text>}
                                rules={[{ required: true, message: "Required" }]}
                              >
                                <Input size="large" placeholder="Mumbai" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item
                                name="state"
                                label={<Text strong>State</Text>}
                                rules={[{ required: true, message: "Required" }]}
                              >
                                <Input size="large" placeholder="Maharashtra" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item
                                name="zipCode"
                                label={<Text strong>Zip Code</Text>}
                                rules={[
                                  { required: true, message: "Required" },
                                  { pattern: /^[0-9]{6}$/, message: "Invalid zip" },
                                ]}
                              >
                                <Input size="large" placeholder="400001" />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item
                            name="country"
                            label={<Text strong>Country</Text>}
                            rules={[{ required: true, message: "Required" }]}
                            initialValue="India"
                          >
                            <Input size="large" placeholder="India" />
                          </Form.Item>

                          <Form.Item>
                            <Checkbox
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                            >
                              <Text strong>Save this address for future orders</Text>
                            </Checkbox>
                          </Form.Item>
                        </Form>
                      )}
                    </div>
                  </div>

                  {/* Billing Address Section */}
                  <div className="section-card">
                    <div className="section-header">
                      <div className="section-icon">
                        <CreditCardOutlined />
                      </div>
                      <Title level={4} style={{ margin: 0 }}>
                        Billing Address
                      </Title>
                    </div>
                    <div className="section-body">
                      <Radio.Group
                        value={selectedBillingAddress}
                        onChange={(e) => setSelectedBillingAddress(e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <Space orientation="vertical" style={{ width: "100%" }} size="middle">
                          <Radio value="same" style={{ width: "100%" }}>
                            <div className={`address-card ${selectedBillingAddress === "same" ? "selected" : ""}`}>
                              <Space>
                                <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                                <div>
                                  <Text strong style={{ display: "block", fontSize: 16 }}>
                                    Same as shipping address
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 13 }}>
                                    Use the same address for billing
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Radio>
                          <Radio value="different" style={{ width: "100%" }}>
                            <div className={`address-card ${selectedBillingAddress === "different" ? "selected" : ""}`}>
                              <Space>
                                <CreditCardOutlined style={{ fontSize: 24, color: "#667eea" }} />
                                <div>
                                  <Text strong style={{ display: "block", fontSize: 16 }}>
                                    Use a different billing address
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 13 }}>
                                    Specify a different address
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div className="section-card">
                    <div className="section-header">
                      <div className="section-icon">
                        <LockOutlined />
                      </div>
                      <Title level={4} style={{ margin: 0 }}>
                        Payment Method
                      </Title>
                    </div>
                    <div className="section-body">
                      <Radio.Group
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <Space orientation="vertical" style={{ width: "100%" }} size="middle">
                          <Radio value="cod" style={{ width: "100%" }}>
                            <div
                              className={`payment-method-card ${paymentMethod === "cod" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("cod")}
                            >
                              <div className="payment-icon-wrapper">
                                <WalletOutlined />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Space size={8}>
                                  <Text strong style={{ fontSize: 16 }}>Cash on Delivery</Text>
                                  <Tag color="green">Popular</Tag>
                                </Space>
                                <Text type="secondary" style={{ display: "block", fontSize: 13 }}>
                                  Pay when you receive your order
                                </Text>
                              </div>
                            </div>
                          </Radio>

                          <Radio value="gpay" style={{ width: "100%" }}>
                            <div
                              className={`payment-method-card ${paymentMethod === "gpay" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("gpay")}
                            >
                              <div className="payment-icon-wrapper" style={{ color: "#4285F4" }}>
                                <QrcodeOutlined />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Text strong style={{ fontSize: 16, display: "block" }}>Google Pay</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>Fast & secure UPI payment</Text>
                              </div>
                            </div>
                          </Radio>

                          <Radio value="phonepe" style={{ width: "100%" }}>
                            <div
                              className={`payment-method-card ${paymentMethod === "phonepe" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("phonepe")}
                            >
                              <div className="payment-icon-wrapper" style={{ color: "#5F259F" }}>
                                <MobileOutlined />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Text strong style={{ fontSize: 16, display: "block" }}>PhonePe</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>Pay with PhonePe UPI</Text>
                              </div>
                            </div>
                          </Radio>

                          <Radio value="card" style={{ width: "100%" }}>
                            <div
                              className={`payment-method-card ${paymentMethod === "card" ? "selected" : ""}`}
                              onClick={() => setPaymentMethod("card")}
                            >
                              <div className="payment-icon-wrapper" style={{ color: "#667eea" }}>
                                <CreditCardOutlined />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Text strong style={{ fontSize: 16, display: "block" }}>Credit/Debit Card</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>Visa, Mastercard, Amex accepted</Text>
                              </div>
                            </div>
                          </Radio>
                        </Space>
                      </Radio.Group>

                      <div className="trust-section">
                        <div className="trust-badge-item">
                          <SafetyOutlined style={{ fontSize: 24, color: "#52c41a", marginBottom: 8 }} />
                          <Text style={{ fontSize: 12, display: "block", fontWeight: 600 }}>SSL Encrypted</Text>
                        </div>
                        <div className="trust-badge-item">
                          <LockOutlined style={{ fontSize: 24, color: "#667eea", marginBottom: 8 }} />
                          <Text style={{ fontSize: 12, display: "block", fontWeight: 600 }}>100% Secure</Text>
                        </div>
                        <div className="trust-badge-item">
                          <CheckCircleOutlined style={{ fontSize: 24, color: "#fa8c16", marginBottom: 8 }} />
                          <Text style={{ fontSize: 12, display: "block", fontWeight: 600 }}>Money Back</Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gift Wrap Option */}
                  <div className="gift-wrap-section">
                    <Checkbox
                      checked={includeGiftWrap}
                      onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                      style={{ marginBottom: 12 }}
                    >
                      <Space>
                        <GiftOutlined style={{ fontSize: 20, color: "#fa8c16" }} />
                        <Text strong style={{ fontSize: 16 }}>
                          Add Gift Wrap (+{formatCurrency(25)})
                        </Text>
                      </Space>
                    </Checkbox>
                    {includeGiftWrap && (
                      <Input.TextArea
                        placeholder="Add a gift message (optional)"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        rows={3}
                        maxLength={200}
                        showCount
                        style={{ marginTop: 12 }}
                      />
                    )}
                  </div>
                </Col>

                {/* Right Column - Order Summary */}
                <Col xs={24} lg={8}>
                  <div className="summary-card">
                    <div className="section-header">
                      <div className="section-icon">
                        <ShoppingOutlined />
                      </div>
                      <Title level={4} style={{ margin: 0 }}>
                        Order Summary
                      </Title>
                    </div>
                    <div className="section-body">
                      {/* Order Items */}
                      <div style={{ marginBottom: 20 }}>
                        {items.map((item) => (
                          <div key={item.id} className="order-item-card">
                            <div className="item-image-wrapper">
                              {item.productImage ? (
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  width={80}
                                  height={80}
                                  style={{ objectFit: "cover", borderRadius: 8 }}
                                  preview={false}
                                />
                              ) : (
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "center", 
                                  height: "100%", 
                                  fontSize: 32 
                                }}>
                                  📦
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Text strong style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
                                {item.productName}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                Qty: {item.quantity} × {formatCurrency(item.price)}
                              </Text>
                            </div>
                            <Text strong style={{ fontSize: 15 }}>
                              {formatCurrency(item.price * item.quantity)}
                            </Text>
                          </div>
                        ))}
                      </div>

                      <Divider style={{ margin: "20px 0" }} />

                      {/* Coupon Section */}
                      <div style={{ marginBottom: 20 }}>
                        <Text strong style={{ display: "block", marginBottom: 12, fontSize: 15 }}>
                          <PercentageOutlined /> Have a Coupon Code?
                        </Text>
                        {!appliedCoupon ? (
                          <Space.Compact style={{ width: "100%" }}>
                            <Input
                              size="large"
                              placeholder="Enter code"
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
                            >
                              Apply
                            </Button>
                          </Space.Compact>
                        ) : (
                          <div style={{ 
                            background: "#f6ffed", 
                            border: "2px solid #b7eb8f", 
                            borderRadius: 10, 
                            padding: 16 
                          }}>
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <Space>
                                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
                                <div>
                                  <Text strong style={{ display: "block" }}>{appliedCoupon.code}</Text>
                                  <Tag color="green" style={{ marginTop: 4 }}>
                                    {appliedCoupon.type === "percentage"
                                      ? `${appliedCoupon.value}% OFF`
                                      : `${formatCurrency(appliedCoupon.value)} OFF`}
                                  </Tag>
                                </div>
                              </Space>
                              <Button
                                type="text"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={handleRemoveCoupon}
                              />
                            </Space>
                          </div>
                        )}
                      </div>

                      <Divider style={{ margin: "20px 0" }} />

                      {/* Price Breakdown */}
                      <div>
                        <div className="summary-row">
                          <Text>Subtotal ({items.length} items)</Text>
                          <Text strong>{formatCurrency(subtotal)}</Text>
                        </div>
                        <div className="summary-row">
                          <Text>
                            <TruckOutlined /> Shipping
                          </Text>
                          <Text strong style={{ color: shipping === 0 ? "#52c41a" : undefined }}>
                            {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                          </Text>
                        </div>
                        {includeGiftWrap && (
                          <div className="summary-row">
                            <Text>
                              <GiftOutlined /> Gift Wrap
                            </Text>
                            <Text strong>{formatCurrency(giftWrapCost)}</Text>
                          </div>
                        )}
                        <div className="summary-row">
                          <Text>Tax (GST 18%)</Text>
                          <Text strong>{formatCurrency(tax)}</Text>
                        </div>
                        {discount > 0 && (
                          <div className="summary-row">
                            <Text style={{ color: "#52c41a" }}>
                              <TagOutlined /> Discount
                            </Text>
                            <Text strong style={{ color: "#52c41a" }}>
                              -{formatCurrency(discount)}
                            </Text>
                          </div>
                        )}
                      </div>

                      {/* Savings Badge */}
                      {totalSavings > 0 && (
                        <div className="savings-badge">
                          <FireOutlined style={{ fontSize: 20 }} />
                          <div style={{ flex: 1 }}>
                            <Text style={{ color: "white", fontWeight: 700 }}>
                              You're saving {formatCurrency(totalSavings)}!
                            </Text>
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="total-banner">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Text strong style={{ fontSize: 18, color: "white" }}>
                            Total Amount
                          </Text>
                          <Text strong style={{ fontSize: 28, color: "white", fontWeight: 800 }}>
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
                        className="checkout-btn"
                        icon={<ThunderboltOutlined />}
                      >
                        {isPlacingOrder
                          ? "Processing..."
                          : paymentMethod === "cod"
                            ? `Place Order`
                            : `Pay ${formatCurrency(total)}`}
                      </Button>

                      <Alert
                        title="100% Secure Checkout"
                        description="Your payment info is encrypted and secure"
                        type="success"
                        showIcon
                        icon={<LockOutlined />}
                        style={{ marginTop: 16, borderRadius: 10 }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        ) : null}

        {/* Order Success Modal */}
        <Modal
          open={orderSuccess}
          footer={null}
          closable={false}
          width={640}
          centered
          styles={{ body: { padding: 0 } }}
        >
          <div className="success-modal-container">
            <div className="success-icon-wrapper">
              <CheckCircleOutlined style={{ fontSize: 64, color: "white" }} />
            </div>

            <div className="success-title">
              🎉 Order Placed Successfully!
            </div>
            <div className="success-subtitle">
              Thank you for your purchase! We're excited to process your order and get it to you soon.
            </div>

            <div className="order-number-card">
              <div className="order-number-label">Your Order Number</div>
              <div className="order-number-value">{orderNumber}</div>
            </div>

            <div className="steps-info-card">
              <Text strong style={{ display: "block", marginBottom: 20, fontSize: 17 }}>
                What happens next?
              </Text>
              <div className="info-step">
                <div className="step-number">1</div>
                <div>
                  <Text strong style={{ display: "block", marginBottom: 4, fontSize: 15 }}>
                    Order Confirmation
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    We've sent a confirmation email with all your order details
                  </Text>
                </div>
              </div>
              <div className="info-step">
                <div className="step-number">2</div>
                <div>
                  <Text strong style={{ display: "block", marginBottom: 4, fontSize: 15 }}>
                    Processing & Packaging
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Your order is being prepared for shipment
                  </Text>
                </div>
              </div>
              <div className="info-step">
                <div className="step-number">3</div>
                <div>
                  <Text strong style={{ display: "block", marginBottom: 4, fontSize: 15 }}>
                    Track Delivery
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Get real-time updates on your order status
                  </Text>
                </div>
              </div>
            </div>

            <div className="action-buttons-row">
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
                icon={<ThunderboltOutlined />}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  height: 52,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                View Order Details
              </Button>
              <Button
                size="large"
                block
                onClick={() => router.push("/products")}
                style={{ height: 52, fontSize: 16, fontWeight: 600 }}
              >
                Continue Shopping
              </Button>
            </div>

            <Divider style={{ margin: "32px 0" }} />

            <div style={{ paddingTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Need help? <Link href="/contact" style={{ color: "#667eea", fontWeight: 600 }}>Contact our support team</Link>
              </Text>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

