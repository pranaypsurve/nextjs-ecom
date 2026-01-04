"use client";

import { Table, Tag, Select, Typography, Space, Button, App, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import {
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "@/store/api/ordersApi";
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
  const { message } = App.useApp();
  
  // API hooks
  const { data: orders = [], isLoading, refetch } = useGetOrdersQuery();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

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
          value={status || "pending"}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
          disabled={isUpdating}
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
        if (!status) {
          return <Tag color="default">N/A</Tag>;
        }
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Delete order?"
          onConfirm={() => handleDelete(record.id)}
          disabled={isDeleting}
        >
          <Button danger icon={<DeleteOutlined />} loading={isDeleting} size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const tableData: OrderTableItem[] = orders.map((order) => ({
    key: String(order.id),
    id: String(order.id),
    orderNumber: `ORD-${String(order.id).slice(0, 8).toUpperCase()}`,
    customer: order.userId || "Unknown",
    date: new Date(order.createdAt).toLocaleDateString(),
    total: order.total,
    status: order.status || "pending",
    paymentStatus: order.paymentStatus || "pending",
  }));

  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Title level={1} style={{ marginBottom: "32px" }}>
          Manage Orders
        </Title>

        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          loading={isLoading}
        />
      </div>
    </ProtectedRoute>
  );
}

