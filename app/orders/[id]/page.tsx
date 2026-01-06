"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Timeline,
  Divider,
  Row,
  Col,
  Empty,
  App,
  Spin,
  Image,
  Badge,
  Descriptions,
  Skeleton,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  HomeOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  CopyOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";
import { formatCurrency } from "@/lib/utils/currency";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();

  // Get order from API
  const { data: order, isLoading: loading, error } = useGetOrderByIdQuery(params.id as string);

  const getStatusColor = (status: string | undefined) => {
    const colorMap: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: "#faad14", icon: <ClockCircleOutlined /> },
      confirmed: { color: "#1890ff", icon: <CheckCircleOutlined /> },
      processing: { color: "#13c2c2", icon: <ClockCircleOutlined /> },
      shipped: { color: "#722ed1", icon: <TruckOutlined /> },
      delivered: { color: "#52c41a", icon: <CheckCircleOutlined /> },
      cancelled: { color: "#ff4d4f", icon: <FileTextOutlined /> },
    };
    return colorMap[status || "pending"] || colorMap.pending;
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    const colorMap: Record<string, string> = {
      pending: "#faad14",
      paid: "#52c41a",
      failed: "#ff4d4f",
      refunded: "#8c8c8c",
    };
    return colorMap[status || "pending"] || "#faad14";
  };

  const getTimelineItems = () => {
    if (!order) return [];

    const status = order.status || "pending";
    const orderDate = dayjs((order as any).created_at || order.createdAt);

    const items = [
      {
        color: status === "pending" ? "gold" : "green",
        dot: status === "pending" ? <ClockCircleOutlined /> : <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong style={{ display: "block", fontSize: 15 }}>
              Order Placed
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {orderDate.format("MMMM DD, YYYY [at] hh:mm A")}
            </Text>
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
            <Text strong style={{ display: "block", fontSize: 15 }}>
              Order Confirmed
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Your order has been confirmed
            </Text>
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
            <Text strong style={{ display: "block", fontSize: 15 }}>
              Processing
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Your order is being prepared
            </Text>
          </div>
        ),
      });
    }

    if (["shipped", "delivered"].includes(status)) {
      items.push({
        color: status === "delivered" ? "green" : "blue",
        dot: <TruckOutlined />,
        children: (
          <div>
            <Text strong style={{ display: "block", fontSize: 15 }}>
              Shipped
            </Text>
            {(order as any).trackingNumber && (
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Tracking: {(order as any).trackingNumber}
              </Text>
            )}
            <Text type="secondary" style={{ fontSize: 12 }}>
              Your order is on the way
            </Text>
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
            <Text strong style={{ display: "block", fontSize: 15 }}>
              Delivered
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Your order has been delivered
            </Text>
          </div>
        ),
      });
    }

    return items;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="order-detail-page">
          <style jsx>{`
            .order-detail-page {
              min-height: calc(100vh - 64px);
              background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
            }
          `}</style>
          <div style={{ padding: "40px 24px", maxWidth: "1400px", margin: "0 auto" }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <div className="order-detail-page">
          <style jsx>{`
            .order-detail-page {
              min-height: calc(100vh - 64px);
              background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
            }
          `}</style>
          <div style={{ padding: "40px 24px", maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
            <Empty description="Order not found">
              <Button type="primary" onClick={() => router.push("/orders")}>
                Back to Orders
              </Button>
            </Empty>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const orderNumber = (order as any).order_number || `ORD-${String(order.id).slice(0, 8).toUpperCase()}`;
  const orderDate = dayjs((order as any).created_at || order.createdAt);
  const orderItems = (order as any).orderItems || order.items || [];
  const shippingAddress = (order as any).shipping_address || order.shippingAddress;
  const statusInfo = getStatusColor(order.status);
  const paymentColor = getPaymentStatusColor(order.paymentStatus);

  return (
    <ProtectedRoute>
      <div className="order-detail-page">
        <style jsx>{`
          .order-detail-page {
            min-height: calc(100vh - 64px);
            background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          }
          .order-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 24px;
            position: relative;
            overflow: hidden;
          }
          .order-hero::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            border-radius: 50%;
          }
          .order-content {
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
            border: 1px solid #e8e8e8;
          }
          .section-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px 24px;
            border-bottom: 2px solid #e8e8e8;
          }
          .section-body {
            padding: 24px;
          }
          .order-item-card {
            display: flex;
            gap: 16px;
            padding: 20px;
            border: 1px solid #e8e8e8;
            border-radius: 12px;
            margin-bottom: 16px;
            transition: all 0.3s ease;
          }
          .order-item-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #667eea;
          }
          .item-image {
            width: 100px;
            height: 100px;
            border-radius: 12px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
          }
          .status-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
          .address-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e8e8e8;
          }
          .action-buttons {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 24px;
          }
          @media (max-width: 768px) {
            .order-item-card {
              flex-direction: column;
            }
            .item-image {
              width: 100%;
              height: 200px;
            }
            .action-buttons {
              flex-direction: column;
            }
            .action-buttons button {
              width: 100%;
            }
          }
        `}</style>

        {/* Hero Section */}
        <div className="order-hero" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/orders")}
              style={{ color: "white", marginBottom: 24 }}
            >
              Back to Orders
            </Button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
              <div>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, display: "block", marginBottom: 8 }}>
                  Order Number
                </Text>
                <Title
                  level={1}
                  style={{
                    color: "white",
                    margin: 0,
                    fontSize: 36,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    letterSpacing: 2,
                  }}
                >
                  {orderNumber}
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, display: "block", marginTop: 12 }}>
                  <ClockCircleOutlined style={{ marginRight: 6 }} />
                  Placed on {orderDate.format("MMMM DD, YYYY [at] hh:mm A")}
                </Text>
              </div>
              <Space direction="vertical" align="end" size="middle">
                <Tag
                  className="status-badge"
                  style={{
                    background: statusInfo.color,
                    color: "white",
                    border: "none",
                    fontSize: 13,
                    padding: "10px 20px",
                  }}
                >
                  {statusInfo.icon} {order.status?.toUpperCase() || "PENDING"}
                </Tag>
                <Tag
                  className="status-badge"
                  style={{
                    background: paymentColor,
                    color: "white",
                    border: "none",
                    fontSize: 13,
                    padding: "10px 20px",
                  }}
                >
                  <DollarOutlined /> {(order.paymentStatus || "pending").toUpperCase()}
                </Tag>
              </Space>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="order-content">
          <Row gutter={[24, 24]}>
            {/* Left Column */}
            <Col xs={24} lg={16}>
              {/* Order Tracking */}
              <div className="section-card">
                <div className="section-header">
                  <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <TruckOutlined /> Order Tracking
                  </Title>
                </div>
                <div className="section-body">
                  <Timeline items={getTimelineItems()} />
                </div>
              </div>

              {/* Order Items */}
              <div className="section-card">
                <div className="section-header">
                  <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <ShoppingOutlined /> Order Items ({orderItems.length})
                  </Title>
                </div>
                <div className="section-body">
                  {orderItems.length === 0 ? (
                    <Empty description="No items found" />
                  ) : (
                    orderItems.map((item: any, index: number) => {
                      const product = item.product || {};
                      const productName = product.name || "Product";
                      const productPrice = parseFloat(product.discount_price || product.price || item.discount || item.price || 0);
                      const quantity = item.quantity || 1;
                      const itemTotal = parseFloat(item.total || productPrice * quantity);

                      return (
                        <div key={index} className="order-item-card">
                          <div className="item-image" style={{ position: "relative" }}>
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={productName}
                                width={100}
                                height={100}
                                style={{ objectFit: "cover", borderRadius: 12 }}
                              />
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  height: "100%",
                                  fontSize: 40,
                                }}
                              >
                                📦
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                              {productName}
                            </Title>
                            {product.description && (
                              <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
                                {product.description}
                              </Text>
                            )}
                            <Space size="middle" wrap>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                Quantity: <Text strong>{quantity}</Text>
                              </Text>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                Price: <Text strong>{formatCurrency(productPrice)}</Text>
                              </Text>
                            </Space>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <Text strong style={{ fontSize: 18, color: "#667eea", display: "block" }}>
                              {formatCurrency(itemTotal)}
                            </Text>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Notes */}
              {(order as any).notes && (
                <div className="section-card">
                  <div className="section-header">
                    <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <FileTextOutlined /> Order Notes
                    </Title>
                  </div>
                  <div className="section-body">
                    <Text>{(order as any).notes}</Text>
                  </div>
                </div>
              )}
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={8}>
              {/* Shipping Address */}
              {shippingAddress && (
                <div className="section-card" style={{ marginBottom: 24 }}>
                  <div className="section-header">
                    <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <HomeOutlined /> Shipping Address
                    </Title>
                  </div>
                  <div className="section-body">
                    <div className="address-card">
                      <Text strong style={{ display: "block", fontSize: 15, marginBottom: 12 }}>
                        {shippingAddress.first_name || shippingAddress.firstName || ""}{" "}
                        {shippingAddress.last_name || shippingAddress.lastName || ""}
                      </Text>
                      <Paragraph style={{ margin: 0, fontSize: 14 }}>
                        {shippingAddress.street_address || shippingAddress.street || ""}
                        <br />
                        {shippingAddress.city || ""}, {shippingAddress.state || ""} {shippingAddress.zip_code || shippingAddress.zipCode || ""}
                        <br />
                        {shippingAddress.country || ""}
                        <br />
                        <br />
                        <Space>
                          <PhoneOutlined />
                          <Text>{shippingAddress.phone || "N/A"}</Text>
                        </Space>
                        <br />
                        <Space>
                          <MailOutlined />
                          <Text>{shippingAddress.email || "N/A"}</Text>
                        </Space>
                      </Paragraph>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="section-card">
                <div className="section-header">
                  <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <DollarOutlined /> Order Summary
                  </Title>
                </div>
                <div className="section-body">
                  <div className="summary-row">
                    <Text>Subtotal</Text>
                    <Text>{formatCurrency(typeof order.subtotal === 'string' ? parseFloat(order.subtotal) : (order.subtotal || 0))}</Text>
                  </div>
                  {order.discount && parseFloat(String(order.discount)) > 0 && (
                    <div className="summary-row">
                      <Text type="success">Discount</Text>
                      <Text type="success" strong>
                        -{formatCurrency(typeof order.discount === 'string' ? parseFloat(order.discount) : order.discount)}
                      </Text>
                    </div>
                  )}
                  <div className="summary-row">
                    <Text>Shipping</Text>
                    <Text>
                      {formatCurrency(
                        typeof (order as any).shipping_cost === 'string'
                          ? parseFloat((order as any).shipping_cost)
                          : (order as any).shipping_cost || order.shipping || 0
                      )}
                    </Text>
                  </div>
                  {order.tax && (
                    <div className="summary-row">
                      <Text>Tax</Text>
                      <Text>{formatCurrency(typeof order.tax === 'string' ? parseFloat(order.tax) : order.tax)}</Text>
                    </div>
                  )}
                  <Divider style={{ margin: "16px 0" }} />
                  <div className="total-row">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Text strong style={{ fontSize: 18, color: "white" }}>
                        Total Amount
                      </Text>
                      <Text strong style={{ fontSize: 24, color: "white" }}>
                        {formatCurrency(typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0))}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <Button
                  icon={<PrinterOutlined />}
                  block
                  size="large"
                  style={{ borderRadius: 8 }}
                  onClick={() => window.print()}
                >
                  Print Invoice
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  block
                  size="large"
                  style={{ borderRadius: 8 }}
                  onClick={() => message.info("Download feature coming soon")}
                >
                  Download Invoice
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </ProtectedRoute>
  );
}
