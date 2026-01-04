"use client";

import { useEffect, useState } from "react";
import { Table, Tag, Select, Typography, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/currency";
import type { Order } from "@/lib/data";

const { Title } = Typography;

interface OrderTableItem {
  key: string;
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  paymentStatus: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load orders
    setOrders([]);
  }, []);

  const handleStatusChange = (orderId: string, status: string) => {
    // Update order status
    console.log("Update order status", orderId, status);
  };

  const columns: ColumnsType<OrderTableItem> = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => formatCurrency(total),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="confirmed">Confirmed</Select.Option>
          <Select.Option value="processing">Processing</Select.Option>
          <Select.Option value="shipped">Shipped</Select.Option>
          <Select.Option value="delivered">Delivered</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
        </Select>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: "orange",
          paid: "green",
          failed: "red",
          refunded: "default",
        };
        return <Tag color={colorMap[status] || "default"}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  const tableData: OrderTableItem[] = orders.map((order) => ({
    key: order.id,
    id: order.id,
    orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    customer: "Customer Name",
    date: new Date(order.createdAt).toLocaleDateString(),
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));

  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Title level={1} style={{ marginBottom: "32px" }}>
          Manage Orders
        </Title>

        <Table columns={columns} dataSource={tableData} />
      </div>
    </ProtectedRoute>
  );
}

