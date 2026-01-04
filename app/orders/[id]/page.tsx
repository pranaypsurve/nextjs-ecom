"use client";


import { useParams, useRouter } from "next/navigation";
import { Card, Typography, Tag, Space, Button, Timeline, Divider, Row, Col, Empty, App, Spin } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";
import { formatCurrency } from "@/lib/utils/currency";
import type { Order } from "@/lib/data";

const { Title, Text, Paragraph } = Typography;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  
  // Get order from API
  const { data: order, isLoading: loading, error } = useGetOrderByIdQuery(params.id as string);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "orange",
      confirmed: "blue",
      processing: "cyan",
      shipped: "purple",
      delivered: "green",
      cancelled: "red",
    };
    return colorMap[status] || "default";
  };

  const getPaymentStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "orange",
      paid: "green",
      failed: "red",
      refunded: "default",
    };
    return colorMap[status] || "default";
  };

  const getTimelineItems = () => {
    if (!order) return [];
    
    const status = order.status || "pending";
    
    const items = [
      {
        color: status === "pending" ? "blue" : "green",
        dot: status === "pending" ? <ClockCircleOutlined /> : <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>Order Placed</Text>
            <br />
            <Text type="secondary">{new Date(order.createdAt).toLocaleString()}</Text>
          </div>
        ),
      },
    ];

    if (status !== "pending") {
      items.push({
        color: ["shipped", "delivered"].includes(status) ? "green" : "blue",
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>Order Confirmed</Text>
            <br />
            <Text type="secondary">Order has been confirmed</Text>
          </div>
        ),
      });
    }

    if (["processing", "shipped", "delivered"].includes(status)) {
      items.push({
        color: ["shipped", "delivered"].includes(status) ? "green" : "blue",
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>Processing</Text>
            <br />
            <Text type="secondary">Order is being processed</Text>
          </div>
        ),
      });
    }

    if (["shipped", "delivered"].includes(status)) {
      items.push({
        color: status === "delivered" ? "green" : "blue",
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>Shipped</Text>
            <br />
            {order.trackingNumber && (
              <>
                <Text type="secondary">Tracking: {order.trackingNumber}</Text>
                <br />
              </>
            )}
            <Text type="secondary">Order has been shipped</Text>
          </div>
        ),
      });
    }

    if (status === "delivered") {
      items.push({
        color: "green",
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>Delivered</Text>
            <br />
            <Text type="secondary">Order has been delivered</Text>
          </div>
        ),
      });
    }

    return items;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <Spin size="large" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
          <Empty description="Order not found">
            <Button type="primary" onClick={() => router.push("/orders")}>
              Back to Orders
            </Button>
          </Empty>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Space style={{ marginBottom: "24px" }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/orders")}>
            Back to Orders
          </Button>
        </Space>

        <Title level={1} style={{ marginBottom: "32px" }}>
          Order Details
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Order Information" style={{ marginBottom: "24px" }}>
              <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                <div>
                  <Text strong>Order Number: </Text>
                  <Text>ORD-{String(order.id).slice(0, 8).toUpperCase()}</Text>
                </div>
                <div>
                  <Text strong>Order Date: </Text>
                  <Text>{new Date(order.createdAt).toLocaleString()}</Text>
                </div>
                <div>
                  <Text strong>Status: </Text>
                  <Tag color={getStatusColor(order.status || "pending")}>
                    {(order.status || "pending").toUpperCase()}
                  </Tag>
                </div>
                <div>
                  <Text strong>Payment Status: </Text>
                  <Tag color={getPaymentStatusColor(order.paymentStatus || "pending")}>
                    {(order.paymentStatus || "pending").toUpperCase()}
                  </Tag>
                </div>
                {order.trackingNumber && (
                  <div>
                    <Text strong>Tracking Number: </Text>
                    <Text copyable>{order.trackingNumber}</Text>
                  </div>
                )}
              </Space>
            </Card>

            <Card title="Order Tracking" style={{ marginBottom: "24px" }}>
              <Timeline items={getTimelineItems()} />
            </Card>

            <Card title="Order Items">
              <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                {order?.items?.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Text strong>{item.product?.name || "Product"}</Text>
                      <br />
                      <Text type="secondary">Quantity: {item.quantity}</Text>
                    </div>
                    <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Shipping Address" style={{ marginBottom: "24px" }}>
              <Paragraph>
                {order.shippingAddress?.firstName || "N/A"} {order.shippingAddress?.lastName || "N/A"}
                <br />
                {order.shippingAddress?.street || "N/A"}
                <br />
                {order.shippingAddress?.city || "N/A"}, {order.shippingAddress?.state || "N/A"} {order.shippingAddress?.zipCode || "N/A"}
                <br />
                {order.shippingAddress?.country || "N/A"}
                <br />
                Phone: {order.shippingAddress?.phone || "N/A"}
              </Paragraph>
            </Card>

            <Card title="Order Summary">
              <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Subtotal</Text>
                  <Text>{formatCurrency(order.subtotal)}</Text>
                </div>
                {order.discount && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Discount</Text>
                    <Text type="success">-{formatCurrency(order.discount)}</Text>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Shipping</Text>
                  <Text>{formatCurrency(order.shipping)}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Tax</Text>
                  <Text>{formatCurrency(order.tax)}</Text>
                </div>
                <Divider />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: "18px" }}>
                    Total
                  </Text>
                  <Text strong style={{ fontSize: "18px", color: "var(--color-primary)" }}>
                    {formatCurrency(order.total)}
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

