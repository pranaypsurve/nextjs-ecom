"use client";

import { useEffect, useState } from "react";
import { Table, Tag, Button, Typography, Empty, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/lib/utils/currency";
import type { Order } from "@/lib/data";

const { Title } = Typography;

interface OrderTableItem {
  key: string;
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  paymentStatus: string;
}

export default function OrdersPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load orders from localStorage or JSON
    // For now, using empty array as orders are created during checkout
    setLoading(false);
  }, []);

  const columns: ColumnsType<OrderTableItem> = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text, record) => (
        <Link href={`/orders/${record.id}`}>{text}</Link>
      ),
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
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: "orange",
          confirmed: "blue",
          processing: "cyan",
          shipped: "purple",
          delivered: "green",
          cancelled: "red",
        };
        return <Tag color={colorMap[status] || "default"}>{status.toUpperCase()}</Tag>;
      },
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
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Link href={`/orders/${record.id}`}>
          <Button type="link">View Details</Button>
        </Link>
      ),
    },
  ];

  const tableData: OrderTableItem[] = orders.map((order) => ({
    key: order.id,
    id: order.id,
    orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    date: new Date(order.createdAt).toLocaleDateString(),
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));

  return (
    <ProtectedRoute>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Title level={1} style={{ marginBottom: "32px" }}>
          My Orders
        </Title>

        {orders.length === 0 ? (
          <Card>
            <Empty description="You haven't placed any orders yet">
              <Link href="/products">
                <Button type="primary">Start Shopping</Button>
              </Link>
            </Empty>
          </Card>
        ) : (
          <Table columns={columns} dataSource={tableData} loading={loading} />
        )}
      </div>
    </ProtectedRoute>
  );
}

