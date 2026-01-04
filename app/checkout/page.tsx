"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, Radio, Space, Divider, Empty, App, Row, Col } from "antd";
import { CreditCardOutlined, DollarOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/utils/currency";

const { Title, Text } = Typography;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { items } = useAppSelector((state) => state.cart);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 10; // Mock shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (items.length === 0) {
      router.push("/products");
    }
  }, [items, router]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create mock order
      const order = {
        id: `order-${Date.now()}`,
        items,
        total,
        subtotal,
        shipping,
        tax,
        paymentMethod,
        shippingAddress: values,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // In real app, save order to backend
      console.log("Order created:", order);

      // Clear cart
      dispatch(clearCart());

      message.success("Order placed successfully!");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      message.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <ProtectedRoute>
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
          <Empty description="Your cart is empty">
            <Button type="primary" onClick={() => router.push("/products")}>
              Continue Shopping
            </Button>
          </Empty>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Title level={1} style={{ marginBottom: "32px" }}>
          Checkout
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Shipping Information" style={{ marginBottom: "24px" }}>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                  <Input size="large" />
                </Form.Item>

                <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>

                <Form.Item name="address" label="Street Address" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="city" label="City" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="state" label="State" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="zipCode" label="Zip Code" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <div style={{ marginBottom: "24px" }}>
                  <Text strong style={{ display: "block", marginBottom: "16px" }}>
                    Payment Method
                  </Text>
                  <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <Space direction="vertical">
                      <Radio value="card">
                        <CreditCardOutlined /> Credit/Debit Card
                      </Radio>
                      <Radio value="paypal">
                        <DollarOutlined /> PayPal
                      </Radio>
                    </Space>
                  </Radio.Group>
                </div>

                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  Place Order & Pay {formatCurrency(total)}
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Order Summary">
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>
                      {item.product.name} x{item.quantity}
                    </Text>
                    <Text>{formatCurrency(item.price * item.quantity)}</Text>
                  </div>
                ))}

                <Divider style={{ margin: "16px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Subtotal</Text>
                  <Text>{formatCurrency(subtotal)}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Shipping</Text>
                  <Text>{formatCurrency(shipping)}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Tax</Text>
                  <Text>{formatCurrency(tax)}</Text>
                </div>

                <Divider style={{ margin: "16px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: "18px" }}>
                    Total
                  </Text>
                  <Text strong style={{ fontSize: "18px", color: "var(--color-primary)" }}>
                    {formatCurrency(total)}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </ProtectedRoute>
  );
}

