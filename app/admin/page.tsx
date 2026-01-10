"use client";

import { useMemo } from "react";
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, Space, Progress, Alert, Badge, Tooltip } from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  ProductOutlined,
  FileTextOutlined,
  GiftOutlined,
  TagOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import { useGetProductsAdminQuery } from "@/store/api/productsApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { useGetCategoriesAdminQuery } from "@/store/api/categoriesApi";
import { useGetCouponsAdminQuery } from "@/store/api/couponsApi";
import { useGetGiftVouchersQuery } from "@/store/api/giftVouchersApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

export default function AdminDashboard() {
  // Fetch all data
  const { data: orders = [], isLoading: ordersLoading } = useGetOrdersQuery();
  const { data: products = [], isLoading: productsLoading } = useGetProductsAdminQuery();
  const { data: users = [], isLoading: usersLoading } = useGetUsersQuery();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesAdminQuery();
  const { data: coupons = [], isLoading: couponsLoading } = useGetCouponsAdminQuery();
  const { data: giftVouchers = [], isLoading: giftVouchersLoading } = useGetGiftVouchersQuery();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
    const processingOrders = orders.filter((o) => o.status === "processing").length;
    const shippedOrders = orders.filter((o) => o.status === "shipped").length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, order) => sum + parseFloat(String(order.total || "0")), 0);

    const todayRevenue = orders
      .filter((o: any) => {
        if (o.status === "cancelled") return false;
        const orderDate = dayjs((o as any).createdAt || (o as any).created_at);
        return orderDate.isSame(dayjs(), "day");
      })
      .reduce((sum, order) => sum + parseFloat(String(order.total || "0")), 0);

    const activeProducts = products.filter((p) => p.status === "active").length;
    const inactiveProducts = products.filter((p) => p.status !== "active").length;
    const lowStockProducts = products.filter((p) => {
      const stock = p.inventory || 0;
      const threshold = p.low_stock_threshold || 10;
      return stock > 0 && stock <= threshold;
    }).length;
    const outOfStockProducts = products.filter((p) => (p.inventory || 0) === 0).length;

    const activeUsers = users.filter((u) => u.is_active !== false).length;
    const inactiveUsers = users.filter((u) => u.is_active === false).length;
    const newUsersToday = users.filter((u) => {
      const userDate = dayjs(u.created_at);
      return userDate.isSame(dayjs(), "day");
    }).length;

    const activeCoupons = coupons.filter((c) => c.is_active !== false).length;
    const expiredCoupons = coupons.filter((c) => {
      if (!c.valid_until && !c.validUntil) return false;
      const expiryDate = dayjs(c.valid_until || c.validUntil);
      return expiryDate.isBefore(dayjs());
    }).length;

    const activeGiftVouchers = giftVouchers.filter((gv) => gv.is_active !== false && !gv.is_used).length;
    const usedGiftVouchers = giftVouchers.filter((gv) => gv.is_used).length;

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayRevenue,
      totalProducts: products.length,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      outOfStockProducts,
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      newUsersToday,
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.is_active !== false).length,
      totalCoupons: coupons.length,
      activeCoupons,
      expiredCoupons,
      totalGiftVouchers: giftVouchers.length,
      activeGiftVouchers,
      usedGiftVouchers,
    };
  }, [orders, products, users, categories, coupons, giftVouchers]);

  // Get recent orders (last 10)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a: any, b: any) => {
        const dateA = dayjs(a.createdAt || a.created_at);
        const dateB = dayjs(b.createdAt || b.created_at);
        return dateB.diff(dateA);
      })
      .slice(0, 10);
  }, [orders]);

  // Get low stock products
  const lowStockItems = useMemo(() => {
    return products
      .filter((p) => {
        const stock = p.inventory || 0;
        const threshold = p.low_stock_threshold || 10;
        return stock > 0 && stock <= threshold;
      })
      .sort((a, b) => (a.inventory || 0) - (b.inventory || 0)) // Sort by stock level (lowest first)
      .slice(0, 5);
  }, [products]);

  // Get out of stock products
  const outOfStockItems = useMemo(() => {
    return products
      .filter((p) => (p.inventory || 0) === 0)
      .slice(0, 5);
  }, [products]);

  // Order status color mapping
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "orange",
      confirmed: "blue",
      processing: "cyan",
      shipped: "purple",
      delivered: "green",
      cancelled: "red",
    };
    return statusMap[status] || "default";
  };

  // Order status label mapping
  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labelMap[status] || status;
  };

  // Recent orders columns
  const recentOrdersColumns = [
    {
      title: "Order #",
      key: "order_number",
      render: (_: any, record: any) => (
        <Text strong style={{ fontFamily: "monospace" }}>
          {record.order_number || `ORD-${String(record.id).slice(0, 8).toUpperCase()}`}
        </Text>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.user?.name || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.user?.email || ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "total",
      key: "total",
      render: (total: string | number) => (
        <Text strong style={{ color: "#1890ff" }}>
          ₹{parseFloat(String(total || "0")).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Date",
      key: "date",
      render: (_: any, record: any) => {
        const createdAt = record.createdAt || record.created_at;
        return (
          <div>
            <Text>{dayjs(createdAt).format("MMM DD, YYYY")}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(createdAt).fromNow()}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Link href={`/admin/orders`}>
          <Button type="link" icon={<EyeOutlined />} size="small">
            View
          </Button>
        </Link>
      ),
    },
  ];

  const isLoading = ordersLoading || productsLoading || usersLoading || categoriesLoading || couponsLoading || giftVouchersLoading;

  return (
      <div className="admin-dashboard">
        <style jsx>{`
          .admin-dashboard {
            padding: 24px;
            max-width: 1600px;
            margin: 0 auto;
          }

          .dashboard-header {
            margin-bottom: 32px;
            padding: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          }

          .dashboard-header h1 {
            color: white;
            margin: 0;
            font-size: 32px;
            font-weight: 700;
          }

          .dashboard-header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 8px 0 0 0;
            font-size: 16px;
          }

          .stat-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            height: 100%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
          }

          .stat-card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
          }

          .stat-card-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .stat-card-primary :global(.ant-statistic-title) {
            color: rgba(255, 255, 255, 0.9);
          }

          .stat-card-primary :global(.ant-statistic-content) {
            color: white;
          }

          .stat-card-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
          }

          .stat-card-success :global(.ant-statistic-title) {
            color: rgba(255, 255, 255, 0.9);
          }

          .stat-card-success :global(.ant-statistic-content) {
            color: white;
          }

          .stat-card-warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }

          .stat-card-warning :global(.ant-statistic-title) {
            color: rgba(255, 255, 255, 0.9);
          }

          .stat-card-warning :global(.ant-statistic-content) {
            color: white;
          }

          .stat-card-info {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }

          .stat-card-info :global(.ant-statistic-title) {
            color: rgba(255, 255, 255, 0.9);
          }

          .stat-card-info :global(.ant-statistic-content) {
            color: white;
          }

          .section-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #f0f0f0;
            height: 100%;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #f0f0f0;
          }

          .quick-action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .quick-action-card {
            padding: 20px;
            border-radius: 8px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border: 1px solid #e8e8e8;
            transition: all 0.3s ease;
            cursor: pointer;
            text-align: center;
          }

          .quick-action-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .quick-action-card:hover :global(.ant-typography) {
            color: white;
          }

          .quick-action-card :global(.anticon) {
            font-size: 32px;
            margin-bottom: 12px;
            color: #667eea;
          }

          .quick-action-card:hover :global(.anticon) {
            color: white;
          }

          .alert-section {
            margin-top: 24px;
          }

          .stock-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin-bottom: 8px;
            background: #fff7e6;
            border-left: 4px solid #fa8c16;
            border-radius: 4px;
          }

          .out-of-stock-item {
            background: #fff1f0;
            border-left-color: #ff4d4f;
          }

          @media (max-width: 768px) {
            .admin-dashboard {
              padding: 16px;
            }

            .dashboard-header {
              padding: 16px;
            }

            .quick-action-grid {
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
          }
        `}</style>

        {/* Header */}
        <div className="dashboard-header">
          <Title level={1}>Admin Control Center</Title>
          <Text>Welcome back! Here's what's happening with your business today.</Text>
        </div>

        {/* Key Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <div className="stat-card stat-card-primary">
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                precision={2}
                styles={{ content: { color: "white" } }}
              />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8, display: "block" }}>
                Today: ₹{stats.todayRevenue.toFixed(2)}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="stat-card stat-card-success">
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingOutlined />}
                styles={{ content: { color: "white" } }}
              />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8, display: "block" }}>
                {stats.deliveredOrders} delivered
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="stat-card stat-card-warning">
              <Statistic
                title="Active Products"
                value={stats.activeProducts}
                prefix={<ProductOutlined />}
                styles={{ content: { color: "white" } }}
              />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8, display: "block" }}>
                {stats.lowStockProducts} low stock
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="stat-card stat-card-info">
              <Statistic
                title="Active Users"
                value={stats.activeUsers}
                prefix={<UserOutlined />}
                styles={{ content: { color: "white" } }}
              />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8, display: "block" }}>
                {stats.newUsersToday} new today
              </Text>
            </div>
          </Col>
        </Row>

        {/* Order Status Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={stats.pendingOrders}
                prefix={<ClockCircleOutlined />}
                styles={{ content: { color: "#fa8c16" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Processing"
                value={stats.processingOrders}
                prefix={<TruckOutlined />}
                styles={{ content: { color: "#13c2c2" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Shipped"
                value={stats.shippedOrders}
                prefix={<TruckOutlined />}
                styles={{ content: { color: "#722ed1" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Delivered"
                value={stats.deliveredOrders}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Grid */}
        <Row gutter={[16, 16]}>
          {/* Recent Orders */}
          <Col xs={24} lg={16}>
            <div className="section-card">
              <div className="section-header">
                <Title level={4} style={{ margin: 0 }}>
                  Recent Orders
                </Title>
                <Link href="/admin/orders">
                  <Button type="link">View All</Button>
                </Link>
              </div>
              <Table
                dataSource={recentOrders}
                columns={recentOrdersColumns}
                rowKey={(record) => String(record.id)}
                pagination={false}
                loading={ordersLoading}
                size="small"
              />
            </div>
          </Col>

          {/* Quick Actions & Alerts */}
          <Col xs={24} lg={8}>
            <div className="section-card">
              <div className="section-header">
                <Title level={4} style={{ margin: 0 }}>
                  Quick Actions
                </Title>
              </div>
              <div className="quick-action-grid">
                <Link href="/admin/products">
                  <div className="quick-action-card">
                    <ProductOutlined />
                    <Title level={5} style={{ margin: 0, marginTop: 8 }}>
                      Products
                    </Title>
                  </div>
                </Link>
                <Link href="/admin/orders">
                  <div className="quick-action-card">
                    <ShoppingOutlined />
                    <Title level={5} style={{ margin: 0, marginTop: 8 }}>
                      Orders
                    </Title>
                  </div>
                </Link>
                <Link href="/admin/users">
                  <div className="quick-action-card">
                    <UserOutlined />
                    <Title level={5} style={{ margin: 0, marginTop: 8 }}>
                      Users
                    </Title>
                  </div>
                </Link>
                <Link href="/admin/categories">
                  <div className="quick-action-card">
                    <FileTextOutlined />
                    <Title level={5} style={{ margin: 0, marginTop: 8 }}>
                      Categories
                    </Title>
                  </div>
                </Link>
                <Link href="/admin/coupons">
                  <div className="quick-action-card">
                    <TagOutlined />
                    <Title level={5} style={{ margin: 0, marginTop: 8 }}>
                      Coupons
                    </Title>
                  </div>
                </Link>
                <Link href="/admin/gift-cards">
                  <div className="quick-action-card">
                    <GiftOutlined />
                    <Title level={5} style={{ margin: 0, marginTop: 8 }}>
                      Gift Cards
                    </Title>
                  </div>
                </Link>
              </div>

              {/* Stock Alerts */}
              {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
                <div className="alert-section">
                  {outOfStockItems.length > 0 && (
                    <Alert
                      title={`${outOfStockItems.length} Product(s) Out of Stock`}
                      description={
                        <div style={{ marginTop: 8 }}>
                          {outOfStockItems.map((item) => (
                            <div key={item.id} className="stock-item out-of-stock-item">
                              <div>
                                <Text strong style={{ display: "block" }}>{item.name}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  SKU: {item.sku}
                                </Text>
                              </div>
                              <Badge count={0} showZero style={{ backgroundColor: "#ff4d4f" }} />
                            </div>
                          ))}
                          <Link href="/admin/products">
                            <Button type="link" size="small" style={{ marginTop: 8, padding: 0 }}>
                              View all out of stock products →
                            </Button>
                          </Link>
                        </div>
                      }
                      type="error"
                      icon={<WarningOutlined />}
                      style={{ marginBottom: 12 }}
                      action={
                        <Link href="/admin/products">
                          <Button size="small" danger>
                            Manage
                          </Button>
                        </Link>
                      }
                    />
                  )}
                  {lowStockItems.length > 0 && (
                    <Alert
                      title={`${lowStockItems.length} Product(s) Low Stock`}
                      description={
                        <div style={{ marginTop: 8 }}>
                          {lowStockItems.map((item) => (
                            <div key={item.id} className="stock-item">
                              <div>
                                <Text strong style={{ display: "block" }}>{item.name}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  SKU: {item.sku} • Threshold: {item.low_stock_threshold || 10}
                                </Text>
                              </div>
                              <Badge 
                                count={item.inventory || 0} 
                                style={{ 
                                  backgroundColor: (item.inventory || 0) <= 5 ? "#ff4d4f" : "#fa8c16" 
                                }} 
                              />
                            </div>
                          ))}
                          <Link href="/admin/products">
                            <Button type="link" size="small" style={{ marginTop: 8, padding: 0 }}>
                              View all low stock products →
                            </Button>
                          </Link>
                        </div>
                      }
                      type="warning"
                      icon={<WarningOutlined />}
                      action={
                        <Link href="/admin/products">
                          <Button size="small" type="primary">
                            Manage
                          </Button>
                        </Link>
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Additional Stats Row */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Categories"
                value={stats.totalCategories}
                prefix={<FileTextOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    ({stats.activeCategories} active)
                  </Text>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Coupons"
                value={stats.totalCoupons}
                prefix={<TagOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    ({stats.activeCoupons} active)
                  </Text>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Gift Vouchers"
                value={stats.totalGiftVouchers}
                prefix={<GiftOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    ({stats.activeGiftVouchers} active)
                  </Text>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Cancelled Orders"
                value={stats.cancelledOrders}
                prefix={<ShoppingOutlined />}
                styles={{ content: { color: "#ff4d4f" } }}
              />
            </Card>
          </Col>
        </Row>
      </div>
  );
}
