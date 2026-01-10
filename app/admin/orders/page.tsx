"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Select,
  Typography,
  Space,
  Button,
  App,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Badge,
  Tooltip,
  Drawer,
  Descriptions,
  Divider,
  Timeline,
  Empty,
} from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  DollarOutlined,
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  GiftOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "@/store/api/ordersApi";
import { formatCurrency } from "@/lib/utils/currency";
import dayjs from "dayjs";
import Link from "next/link";

const { Title, Text } = Typography;
const { Search } = Input;

export default function AdminOrdersPage() {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // API hooks
  const { data: orders = [], isLoading, refetch } = useGetOrdersQuery();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o: any) => o.status === "pending" || o.status === "confirmed").length;
    const processing = orders.filter((o: any) => o.status === "processing").length;
    const shipped = orders.filter((o: any) => o.status === "shipped").length;
    const delivered = orders.filter((o: any) => o.status === "delivered").length;
    const cancelled = orders.filter((o: any) => o.status === "cancelled").length;
    const totalRevenue = orders
      .filter((o: any) => o.status !== "cancelled")
      .reduce((sum: number, order: any) => sum + parseFloat(String(order.total || "0")), 0);

    return { total, pending, processing, shipped, delivered, cancelled, totalRevenue };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const orderNumber = order.order_number || `ORD-${String(order.id).slice(0, 8).toUpperCase()}`;
      const matchesSearch =
        !searchText ||
        orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        String(order.id).includes(searchText) ||
        order.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "all" || !order.paymentStatus || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchText, statusFilter, paymentFilter]);

  const handleStatusChange = async (orderId: string | number, status: string) => {
    try {
      await updateOrder({
        id: orderId,
        data: { status: status as any },
      }).unwrap();
      message.success("Order status updated successfully");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to update order status";
      message.error(errorMessage);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteOrder(id).unwrap();
      message.success("Order deleted successfully");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete order";
      message.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "warning",
      confirmed: "processing",
      processing: "cyan",
      shipped: "purple",
      delivered: "success",
      cancelled: "error",
    };
    return statusMap[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pending: <ClockCircleOutlined />,
      confirmed: <CheckCircleOutlined />,
      processing: <ShoppingCartOutlined />,
      shipped: <TruckOutlined />,
      delivered: <CheckCircleOutlined />,
      cancelled: <CloseCircleOutlined />,
    };
    return iconMap[status] || <ShoppingOutlined />;
  };

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

  const columns: ColumnsType<any> = [
    {
      title: "Order #",
      key: "order_number",
      width: 150,
      fixed: "left",
      render: (_: any, record: any) => (
        <Tooltip title="Click to view details">
          <Button
            type="link"
            style={{ 
              fontFamily: "monospace", 
              fontWeight: 600,
              fontSize: 14,
              padding: 0,
              height: "auto"
            }}
            onClick={() => {
              setSelectedOrder(record);
              setDrawerOpen(true);
            }}
          >
            #{record.order_number || `${String(record.id).slice(0, 8).toUpperCase()}`}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 220,
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: 16,
          }}>
            {(record.user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <Text strong style={{ display: "block", fontSize: 14 }}>
              {record.user?.name || "N/A"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user?.email || ""}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Items",
      key: "items",
      width: 100,
      align: "center",
      render: (_: any, record: any) => (
        <Badge 
          count={record.orderItems?.length || 0} 
          showZero 
          style={{ backgroundColor: "#667eea" }}
        />
      ),
    },
    {
      title: "Amount",
      key: "total",
      width: 130,
      align: "right",
      render: (_: any, record: any) => (
        <div>
          <Text strong style={{ color: "#52c41a", fontSize: 16, fontWeight: 600 }}>
            ₹{parseFloat(String(record.total || "0")).toFixed(2)}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: string, record: any) => (
        <Select
          value={status || "pending"}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: "100%" }}
          disabled={isUpdating}
          suffixIcon={getStatusIcon(status)}
        >
          <Select.Option value="pending">
            <Space><ClockCircleOutlined style={{ color: "#fa8c16" }} />Pending</Space>
          </Select.Option>
          <Select.Option value="confirmed">
            <Space><CheckCircleOutlined style={{ color: "#1890ff" }} />Confirmed</Space>
          </Select.Option>
          <Select.Option value="processing">
            <Space><ShoppingCartOutlined style={{ color: "#13c2c2" }} />Processing</Space>
          </Select.Option>
          <Select.Option value="shipped">
            <Space><TruckOutlined style={{ color: "#722ed1" }} />Shipped</Space>
          </Select.Option>
          <Select.Option value="delivered">
            <Space><CheckCircleOutlined style={{ color: "#52c41a" }} />Delivered</Space>
          </Select.Option>
          <Select.Option value="cancelled">
            <Space><CloseCircleOutlined style={{ color: "#ff4d4f" }} />Cancelled</Space>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 120,
      align: "center",
      render: (status: string) => {
        if (!status) {
          return <Tag color="default">N/A</Tag>;
        }
        const colorMap: Record<string, string> = {
          pending: "warning",
          paid: "success",
          failed: "error",
          refunded: "default",
        };
        const iconMap: Record<string, React.ReactNode> = {
          pending: <ClockCircleOutlined />,
          paid: <CheckCircleOutlined />,
          failed: <CloseCircleOutlined />,
          refunded: <DollarOutlined />,
        };
        return (
          <Tag 
            color={colorMap[status] || "default"}
            icon={iconMap[status]}
            style={{ borderRadius: 8, padding: "4px 10px", fontWeight: 500 }}
          >
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Date",
      key: "date",
      width: 150,
      render: (_: any, record: any) => {
        const createdAt = record.createdAt || record.created_at;
        return (
          <div>
            <Text style={{ display: "block", fontSize: 13 }}>
              {dayjs(createdAt).format("MMM DD, YYYY")}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(createdAt).format("HH:mm A")}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      fixed: "right",
      align: "center",
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedOrder(record);
                setDrawerOpen(true);
              }}
              style={{ borderRadius: 8 }}
            >
              View
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete order?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            disabled={isDeleting}
            okText="Yes, delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                loading={isDeleting}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
      <div className="admin-page">
        <style jsx>{`
          .admin-page {
            padding: 24px;
            max-width: 1600px;
            margin: 0 auto;
          }

          .page-header {
            margin-bottom: 32px;
            padding: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          }

          .page-header h1 {
            color: white;
            margin: 0;
            font-size: 32px;
            font-weight: 700;
          }

          .stats-row {
            margin-bottom: 24px;
          }

          .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            height: 100%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #f0f0f0;
          }

          .filters-section {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .table-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          @media (max-width: 768px) {
            .admin-page {
              padding: 16px;
            }

            .page-header {
              padding: 16px;
            }
          }
        `}</style>
        <style jsx global>{`
          .table-row-light {
            background-color: #ffffff;
          }
          .table-row-dark {
            background-color: #fafafa;
          }
          .ant-table-row:hover > td {
            background-color: #f0f5ff !important;
          }
        `}</style>

        {/* Header */}
        <div className="page-header">
          <Title level={1} style={{ color: "white", margin: 0 }}>
            Order Management
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block", marginTop: 8 }}>
            Manage and track all customer orders
          </Text>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Total Orders"
                value={stats.total}
                prefix={<ShoppingOutlined />}
                styles={{ content: { color: "#667eea" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                precision={2}
                styles={{ content: { color: "#52c41a" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                styles={{ content: { color: "#fa8c16" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Delivered"
                value={stats.delivered}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <div className="filters-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search by order number, customer name, or email"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by Status"
                size="large"
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
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
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by Payment"
                size="large"
                style={{ width: "100%" }}
                value={paymentFilter}
                onChange={setPaymentFilter}
              >
                <Select.Option value="all">All Payment Status</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="paid">Paid</Select.Option>
                <Select.Option value="failed">Failed</Select.Option>
                <Select.Option value="refunded">Refunded</Select.Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey={(record) => String(record.id)}
            loading={isLoading}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) => (
                <Text strong style={{ fontSize: 14 }}>
                  Total {total} orders
                </Text>
              ),
            }}
            locale={{
              emptyText: (
                <Empty
                  image={<ShoppingOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
                  styles={{ image: { height: 80 } }}
                  description={
                    <div style={{ padding: "24px 0" }}>
                      <Typography.Title level={4} style={{ color: "#8c8c8c", marginBottom: 8 }}>
                        No orders found
                      </Typography.Title>
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        {searchText || statusFilter !== "all" || paymentFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Orders will appear here once customers make purchases"
                        }
                      </Text>
                    </div>
                  }
                />
              ),
            }}
            rowClassName={(record, index) => index % 2 === 0 ? "table-row-light" : "table-row-dark"}
          />
        </div>

        {/* Order Details Drawer */}
        <Drawer
          title={null}
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          size={720}
          closable={false}
          styles={{
            body: { padding: 0 }
          }}
        >
          {selectedOrder && (
            <div>
              {/* Drawer Header */}
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "32px 24px",
                color: "white",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, display: "block", marginBottom: 4 }}>
                      ORDER NUMBER
                    </Text>
                    <Typography.Title level={3} style={{ color: "white", margin: 0, fontFamily: "monospace" }}>
                      #{selectedOrder.order_number || `${String(selectedOrder.id).slice(0, 8).toUpperCase()}`}
                    </Typography.Title>
                  </div>
                  <Button
                    type="text"
                    icon={<CloseCircleOutlined style={{ fontSize: 24 }} />}
                    onClick={() => setDrawerOpen(false)}
                    style={{ color: "white", height: "auto", padding: 4 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
                  <div>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    <Text style={{ color: "white" }}>
                      {dayjs(selectedOrder.createdAt || selectedOrder.created_at).format("MMM DD, YYYY HH:mm A")}
                    </Text>
                  </div>
                  <div>
                    <Tag 
                      color={getStatusColor(selectedOrder.status)}
                      icon={getStatusIcon(selectedOrder.status)}
                      style={{ 
                        padding: "6px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 8,
                        border: "none"
                      }}
                    >
                      {selectedOrder.status?.toUpperCase() || "PENDING"}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: 24 }}>
                {/* Customer Information */}
                <Card 
                  title={
                    <Space>
                      <UserOutlined style={{ color: "#667eea" }} />
                      <Text strong>Customer Information</Text>
                    </Space>
                  }
                  style={{ marginBottom: 24, borderRadius: 12 }}
                  styles={{ header: { borderBottom: "2px solid #f0f0f0" } }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item 
                      label={<Space><UserOutlined />Name</Space>}
                    >
                      <Text strong>{selectedOrder.user?.name || "N/A"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={<Space><MailOutlined />Email</Space>}
                    >
                      {selectedOrder.user?.email || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={<Space><PhoneOutlined />Phone</Space>}
                    >
                      {selectedOrder.user?.phone || "N/A"}
                    </Descriptions.Item>
                    {selectedOrder.shippingAddress && (
                      <Descriptions.Item 
                        label={<Space><EnvironmentOutlined />Shipping Address</Space>}
                      >
                        {selectedOrder.shippingAddress}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                {/* Order Items */}
                <Card 
                  title={
                    <Space>
                      <ShoppingCartOutlined style={{ color: "#667eea" }} />
                      <Text strong>Order Items</Text>
                      <Badge 
                        count={selectedOrder.orderItems?.length || 0} 
                        style={{ backgroundColor: "#667eea" }}
                      />
                    </Space>
                  }
                  style={{ marginBottom: 24, borderRadius: 12 }}
                  styles={{ header: { borderBottom: "2px solid #f0f0f0" } }}
                >
                  {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {selectedOrder.orderItems.map((item: any, index: number) => (
                        <div 
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 16,
                            background: "#fafafa",
                            borderRadius: 10,
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: 15, display: "block", marginBottom: 4 }}>
                              {item.product?.name || `Product #${item.productId}`}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Quantity: <Text strong>{item.quantity}</Text>
                            </Text>
                          </div>
                          <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                            ₹{parseFloat(String(item.price || 0)).toFixed(2)}
                          </Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="No items in this order" />
                  )}
                </Card>

                {/* Payment & Pricing */}
                <Card 
                  title={
                    <Space>
                      <CreditCardOutlined style={{ color: "#667eea" }} />
                      <Text strong>Payment Details</Text>
                    </Space>
                  }
                  style={{ marginBottom: 24, borderRadius: 12 }}
                  styles={{ header: { borderBottom: "2px solid #f0f0f0" } }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #f0f0f0" }}>
                      <Text>Subtotal:</Text>
                      <Text strong>₹{parseFloat(String(selectedOrder.subtotal || selectedOrder.total || 0)).toFixed(2)}</Text>
                    </div>
                    {selectedOrder.discount && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #f0f0f0" }}>
                        <Text type="secondary">Discount:</Text>
                        <Text type="danger">-₹{parseFloat(String(selectedOrder.discount)).toFixed(2)}</Text>
                      </div>
                    )}
                    {selectedOrder.shipping && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #f0f0f0" }}>
                        <Text type="secondary">Shipping:</Text>
                        <Text>₹{parseFloat(String(selectedOrder.shipping)).toFixed(2)}</Text>
                      </div>
                    )}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      padding: "16px",
                      background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                      borderRadius: 8,
                      marginTop: 8
                    }}>
                      <Text strong style={{ fontSize: 18 }}>Total:</Text>
                      <Text strong style={{ fontSize: 20, color: "#52c41a" }}>
                        ₹{parseFloat(String(selectedOrder.total || 0)).toFixed(2)}
                      </Text>
                    </div>
                    <Divider style={{ margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Text type="secondary">Payment Status:</Text>
                      <Tag 
                        color={selectedOrder.paymentStatus === "paid" ? "success" : selectedOrder.paymentStatus === "failed" ? "error" : "warning"}
                        style={{ padding: "4px 12px", borderRadius: 6 }}
                      >
                        {selectedOrder.paymentStatus?.toUpperCase() || "PENDING"}
                      </Tag>
                    </div>
                  </div>
                </Card>

                {/* Order Status Update */}
                <Card 
                  title={
                    <Space>
                      <FileTextOutlined style={{ color: "#667eea" }} />
                      <Text strong>Update Status</Text>
                    </Space>
                  }
                  style={{ borderRadius: 12 }}
                  styles={{ header: { borderBottom: "2px solid #f0f0f0" } }}
                >
                  <Select
                    value={selectedOrder.status || "pending"}
                    onChange={(value) => {
                      handleStatusChange(selectedOrder.id, value);
                      setSelectedOrder({ ...selectedOrder, status: value });
                    }}
                    size="large"
                    style={{ width: "100%", marginBottom: 16 }}
                    disabled={isUpdating}
                  >
                    <Select.Option value="pending">
                      <Space><ClockCircleOutlined style={{ color: "#fa8c16" }} />Pending</Space>
                    </Select.Option>
                    <Select.Option value="confirmed">
                      <Space><CheckCircleOutlined style={{ color: "#1890ff" }} />Confirmed</Space>
                    </Select.Option>
                    <Select.Option value="processing">
                      <Space><ShoppingCartOutlined style={{ color: "#13c2c2" }} />Processing</Space>
                    </Select.Option>
                    <Select.Option value="shipped">
                      <Space><TruckOutlined style={{ color: "#722ed1" }} />Shipped</Space>
                    </Select.Option>
                    <Select.Option value="delivered">
                      <Space><CheckCircleOutlined style={{ color: "#52c41a" }} />Delivered</Space>
                    </Select.Option>
                    <Select.Option value="cancelled">
                      <Space><CloseCircleOutlined style={{ color: "#ff4d4f" }} />Cancelled</Space>
                    </Select.Option>
                  </Select>
                  
                  <Timeline
                    style={{ marginTop: 24 }}
                    items={[
                      {
                        color: "green",
                        children: (
                          <div>
                            <Text strong>Order Placed</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(selectedOrder.createdAt || selectedOrder.created_at).format("MMM DD, YYYY HH:mm A")}
                            </Text>
                          </div>
                        ),
                      },
                      ...(selectedOrder.status !== "pending" ? [{
                        color: selectedOrder.status === "cancelled" ? "red" : "blue",
                        children: (
                          <div>
                            <Text strong>{selectedOrder.status === "cancelled" ? "Order Cancelled" : "Order Confirmed"}</Text>
                          </div>
                        ),
                      }] : []),
                      ...(["processing", "shipped", "delivered"].includes(selectedOrder.status) ? [{
                        color: "blue",
                        children: <Text strong>Processing</Text>,
                      }] : []),
                      ...(["shipped", "delivered"].includes(selectedOrder.status) ? [{
                        color: "purple",
                        children: <Text strong>Shipped</Text>,
                      }] : []),
                      ...(selectedOrder.status === "delivered" ? [{
                        color: "green",
                        children: <Text strong>Delivered</Text>,
                      }] : []),
                    ]}
                  />
                </Card>
              </div>
            </div>
          )}
        </Drawer>
      </div>
  );
}
