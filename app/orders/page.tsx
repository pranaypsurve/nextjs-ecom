"use client";

import { useState, useMemo } from "react";
import {
  Card,
  Tag,
  Button,
  Typography,
  Empty,
  Space,
  Badge,
  Statistic,
  Row,
  Col,
  Select,
  Input,
  Image,
  Timeline,
  Divider,
  Skeleton,
} from "antd";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  DollarOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useGetMyOrdersQuery } from "@/store/api/ordersApi";
import { formatCurrency } from "@/lib/utils/currency";
import type { Order } from "@/lib/data";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

export default function OrdersPage() {
  const { data: orders = [], isLoading: loading } = useGetMyOrdersQuery();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order: any) => {
      const total = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
      return sum + total;
    }, 0);
    const pendingOrders = orders.filter(
      (o: any) => o.status === "pending" || o.status === "processing"
    ).length;
    const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;

    return { totalOrders, totalSpent, pendingOrders, deliveredOrders };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      // Use order_number from API if available, otherwise generate it
      const orderNumber = order.order_number || `ORD-${String(order.id).slice(0, 8).toUpperCase()}`;
      const matchesSearch =
        !searchText ||
        orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        String(order.id).includes(searchText);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      // Payment status might not exist in API, so make it optional
      const matchesPayment =
        paymentFilter === "all" || !order.paymentStatus || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchText, statusFilter, paymentFilter]);

  const getStatusColor = (status: string | undefined) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: "#faad14", icon: <ClockCircleOutlined /> },
      confirmed: { color: "#1890ff", icon: <CheckCircleOutlined /> },
      processing: { color: "#13c2c2", icon: <ClockCircleOutlined /> },
      shipped: { color: "#722ed1", icon: <TruckOutlined /> },
      delivered: { color: "#52c41a", icon: <CheckCircleOutlined /> },
      cancelled: { color: "#ff4d4f", icon: <FileTextOutlined /> },
    };
    return statusMap[status || "pending"] || statusMap.pending;
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    const statusMap: Record<string, string> = {
      pending: "#faad14",
      paid: "#52c41a",
      failed: "#ff4d4f",
      refunded: "#8c8c8c",
    };
    return statusMap[status || "pending"] || "#faad14";
  };

  const getOrderItemsPreview = (order: any) => {
    // Handle both API structure (orderItems) and local structure (items)
    const items = (order.orderItems || order.items || []);
    if (items.length === 0) return [];
    return items.slice(0, 3);
  };

  return (
    <ProtectedRoute>
      <div className="orders-page">
        <style jsx>{`
          .orders-page {
            min-height: calc(100vh - 64px);
            background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          }
          .orders-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 24px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .orders-hero::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            border-radius: 50%;
          }
          .orders-hero::after {
            content: "";
            position: absolute;
            bottom: -30%;
            left: -5%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
            border-radius: 50%;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-top: 40px;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
          }
          .stat-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
          }
          .stat-card:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.2);
          }
          .orders-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 24px;
          }
          .filters-section {
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            margin-bottom: 32px;
          }
          .order-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            margin-bottom: 40px;
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid #e8e8e8;
          }
          .order-card:not(:last-child){
            margin-bottom: 56px;
          }
          .order-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            border-color: #667eea;
          }
          .order-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px 24px;
            border-bottom: 2px solid #e8e8e8;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
          }
          .order-body {
            padding: 24px;
          }
          .order-items-preview {
            display: flex;
            gap: 12px;
            margin: 16px 0;
            flex-wrap: wrap;
          }
          .item-preview {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            flex: 1;
            min-width: 200px;
          }
          .item-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
          }
          .order-footer {
            padding: 20px 24px;
            background: #fafafa;
            border-top: 1px solid #e8e8e8;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
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
          .timeline-container {
            margin-top: 16px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 12px;
          }
          .gold-accent {
            color: #ffd700;
            text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
          }
          .premium-badge {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #1f2937;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          @media (max-width: 768px) {
            .order-header {
              flex-direction: column;
              align-items: flex-start;
            }
            .order-footer {
              flex-direction: column;
              align-items: stretch;
            }
            .stats-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        {/* Hero Section */}
        <div className="orders-hero" style={{ position: "relative", zIndex: 1 }}>
          <Title
            level={1}
            style={{
              color: "white",
              marginBottom: 16,
              fontSize: 48,
              fontWeight: 700,
              position: "relative",
              zIndex: 2,
            }}
          >
            <span className="gold-accent">My Orders</span>
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: 18,
              position: "relative",
              zIndex: 2,
            }}
          >
            Track and manage all your orders in one place
          </Text>

          {/* Statistics */}
          <div className="stats-grid" style={{ position: "relative", zIndex: 2 }}>
            <div className="stat-card">
              <Statistic
                title={<span style={{ color: "rgba(255,255,255,0.9)" }}>Total Orders</span>}
                value={stats.totalOrders}
                prefix={<ShoppingOutlined />}
                styles={{ content: { color: "#ffd700", fontSize: 32, fontWeight: 700 } }}
              />
            </div>
            <div className="stat-card">
              <Statistic
                title={<span style={{ color: "rgba(255,255,255,0.9)" }}>Total Spent</span>}
                value={formatCurrency(stats.totalSpent)}
                prefix={<DollarOutlined />}
                styles={{ content: { color: "#ffd700", fontSize: 28, fontWeight: 700 } }}
              />
            </div>
            <div className="stat-card">
              <Statistic
                title={<span style={{ color: "rgba(255,255,255,0.9)" }}>Pending</span>}
                value={stats.pendingOrders}
                prefix={<ClockCircleOutlined />}
                styles={{ content: { color: "#ffd700", fontSize: 32, fontWeight: 700 } }}
              />
            </div>
            <div className="stat-card">
              <Statistic
                title={<span style={{ color: "rgba(255,255,255,0.9)" }}>Delivered</span>}
                value={stats.deliveredOrders}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#ffd700", fontSize: 32, fontWeight: 700 } }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="orders-content">
          {/* Filters */}
          <div className="filters-section">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Search by order number..."
                  allowClear
                  size="large"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Order Status"
                  size="large"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Select.Option value="all">All Status</Select.Option>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="confirmed">Confirmed</Select.Option>
                  <Select.Option value="processing">Processing</Select.Option>
                  <Select.Option value="shipped">Shipped</Select.Option>
                  <Select.Option value="delivered">Delivered</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Payment Status"
                  size="large"
                  style={{ width: "100%" }}
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Select.Option value="all">All Payments</Select.Option>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="paid">Paid</Select.Option>
                  <Select.Option value="failed">Failed</Select.Option>
                  <Select.Option value="refunded">Refunded</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} style={{ textAlign: "right" }}>
                <Text type="secondary">
                  Showing {filteredOrders.length} of {orders.length} orders
                </Text>
              </Col>
            </Row>
          </div>

          {/* Orders List */}
          {loading ? (
            <Row gutter={[24, 24]}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Col xs={24} key={index}>
                  <Card>
                    <Skeleton active paragraph={{ rows: 4 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : filteredOrders.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "60px 20px" }}>
              <Empty
                description={
                  <div>
                    <Text strong style={{ fontSize: 18, display: "block", marginBottom: 8 }}>
                      {orders.length === 0
                        ? "You haven't placed any orders yet"
                        : "No orders match your filters"}
                    </Text>
                    <Text type="secondary">
                      {orders.length === 0
                        ? "Start shopping to see your orders here"
                        : "Try adjusting your search or filters"}
                    </Text>
                  </div>
                }
              >
                {orders.length === 0 && (
                  <Link href="/products">
                    <Button type="primary" size="large" style={{ marginTop: 16 }}>
                      Start Shopping
                    </Button>
                  </Link>
                )}
              </Empty>
            </Card>
          ) : (
            <div>
              {filteredOrders.map((order: any) => {
                // Use order_number from API if available, otherwise generate it
                const orderNumber = order.order_number || `ORD-${String(order.id).slice(0, 8).toUpperCase()}`;
                // Handle both created_at (API) and createdAt (local)
                const orderDate = dayjs(order.created_at || order.createdAt);
                // Handle both orderItems (API) and items (local)
                const orderItems = order.orderItems || order.items || [];
                const statusInfo = getStatusColor(order.status);
                const totalAmount = parseFloat(order.total || order.subtotal || 0);
                const subtotal = parseFloat(order.subtotal || totalAmount);
                const discount = parseFloat(order.discount || 0);
                const shippingCost = parseFloat(order.shipping_cost || 0);

                return (
                  <Card key={order.id} className="order-card" hoverable>
                    {/* Order Header */}
                    <div className="order-header">
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <Space size="middle" wrap>
                              <Text strong style={{ fontSize: 18, color: "#1f2937" }}>
                                Order #{orderNumber}
                              </Text>
                              <Tag
                                color={statusInfo.color}
                                icon={statusInfo.icon}
                                style={{
                                  padding: "6px 16px",
                                  borderRadius: 20,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.5,
                                }}
                              >
                                {order.status || "Pending"}
                              </Tag>
                            </Space>
                            <div style={{ marginTop: 12 }}>
                              <Space size="small">
                                <CalendarOutlined style={{ color: "#8c8c8c" }} />
                                <Text type="secondary" style={{ fontSize: 14 }}>
                                  Placed on {orderDate.format("MMMM DD, YYYY [at] hh:mm A")}
                                </Text>
                              </Space>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
                              Total Amount
                            </Text>
                            <Text
                              strong
                              style={{
                                fontSize: 24,
                                color: "#667eea",
                                fontWeight: 700,
                                display: "block",
                                marginTop: 4,
                              }}
                            >
                              {formatCurrency(totalAmount)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="order-body">
                      {/* Order Items Preview */}
                      {orderItems.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
                            Items ({orderItems.length})
                          </Text>
                          <div className="order-items-preview">
                            {orderItems.slice(0, 3).map((item: any, index: number) => {
                              const product = item.product || {};
                              const productImage = product.thumbnail || product.image || product.thumbnail || "";
                              const productName = product.name || "Product";
                              const itemQuantity = item.quantity || 1;
                              const itemPrice = parseFloat(item.price || product.price || product.discount_price || 0);
                              const itemTotal = parseFloat(item.total || itemPrice * itemQuantity);

                              return (
                                <div key={index} className="item-preview">
                                  {productImage ? (
                                    <Image
                                      src={productImage}
                                      alt={productName}
                                      width={60}
                                      height={60}
                                      style={{
                                        borderRadius: 8,
                                        objectFit: "cover",
                                      }}
                                      fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                                    />
                                  ) : (
                                    <div className="item-image">
                                      <ShoppingOutlined style={{ fontSize: 24, color: "#bfbfbf" }} />
                                    </div>
                                  )}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text
                                      strong
                                      style={{
                                        fontSize: 14,
                                        display: "block",
                                        marginBottom: 4,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {productName}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                                      Qty: {itemQuantity} × {formatCurrency(itemPrice)}
                                    </Text>
                                    <Text strong style={{ fontSize: 13, color: "#667eea", display: "block", marginTop: 4 }}>
                                      {formatCurrency(itemTotal)}
                                    </Text>
                                  </div>
                                </div>
                              );
                            })}
                            {orderItems.length > 3 && (
                              <div
                                style={{
                                  padding: 16,
                                  background: "#f0f5ff",
                                  borderRadius: 8,
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  minWidth: 120,
                                }}
                              >
                                <Text strong style={{ color: "#667eea", fontSize: 14 }}>
                                  +{orderItems.length - 3} more
                                </Text>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Timeline */}
                      <div className="timeline-container">
                        <Timeline
                          items={[
                            {
                              color: "green",
                              content: (
                                <div>
                                  <Text strong style={{ display: "block", fontSize: 14 }}>
                                    Order Placed
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {orderDate.format("MMM DD, YYYY [at] hh:mm A")}
                                  </Text>
                                </div>
                              ),
                            },
                            {
                              color: ["confirmed", "processing", "shipped", "delivered"].includes(order.status || "") ? "blue" : "gray",
                              content: (
                                <div>
                                  <Text
                                    strong
                                    style={{
                                      display: "block",
                                      fontSize: 14,
                                      color: ["confirmed", "processing", "shipped", "delivered"].includes(order.status || "")
                                        ? undefined
                                        : "#bfbfbf",
                                    }}
                                  >
                                    {order.status === "confirmed"
                                      ? "Order Confirmed"
                                      : order.status === "processing"
                                        ? "Processing"
                                        : order.status === "shipped"
                                          ? "Shipped"
                                          : order.status === "delivered"
                                            ? "Delivered"
                                            : "Pending Confirmation"}
                                  </Text>
                                  {order.status === "shipped" && order.updated_at && (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {dayjs(order.updated_at).format("MMM DD, YYYY")}
                                    </Text>
                                  )}
                                </div>
                              ),
                            },
                            {
                              color: order.status === "delivered" ? "green" : "gray",
                              content: (
                                <div>
                                  <Text
                                    strong
                                    style={{
                                      display: "block",
                                      fontSize: 14,
                                      color: order.status === "delivered" ? undefined : "#bfbfbf",
                                    }}
                                  >
                                    Delivered
                                  </Text>
                                  {order.status === "delivered" && order.updated_at && (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {dayjs(order.updated_at).format("MMM DD, YYYY [at] hh:mm A")}
                                    </Text>
                                  )}
                                </div>
                              ),
                            },
                          ]}
                        />
                      </div>

                      {/* Price Breakdown */}
                      <Divider style={{ margin: "20px 0" }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary">Subtotal:</Text>
                          <Text strong>{formatCurrency(subtotal)}</Text>
                        </div>
                        {discount > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text type="secondary">Discount:</Text>
                            <Text type="danger">-{formatCurrency(discount)}</Text>
                          </div>
                        )}
                        {shippingCost > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text type="secondary">Shipping:</Text>
                            <Text>{formatCurrency(shippingCost)}</Text>
                          </div>
                        )}
                        <Divider style={{ margin: "8px 0" }} />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                            borderRadius: 8,
                          }}
                        >
                          <Text strong style={{ fontSize: 16 }}>Total:</Text>
                          <Text strong style={{ fontSize: 18, color: "#667eea" }}>
                            {formatCurrency(totalAmount)}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="order-footer">
                      <div>
                        {order.paymentStatus && (
                          <Space size="small">
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Payment:
                            </Text>
                            <Tag
                              color={getPaymentStatusColor(order.paymentStatus)}
                              style={{
                                borderRadius: 6,
                                padding: "2px 10px",
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {order.paymentStatus.toUpperCase()}
                            </Tag>
                          </Space>
                        )}
                      </div>
                      <Link href={`/orders/${order.id}`}>
                        <Button
                          type="primary"
                          size="large"
                          icon={<EyeOutlined />}
                          style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                            borderRadius: 8,
                            height: 44,
                            fontWeight: 600,
                          }}
                        >
                          View Order Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

