"use client";

import { useState, useMemo, useCallback } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, DatePicker, App, Space, Typography, Popconfirm, Tag } from "antd";
import TextArea from "antd/es/input/TextArea";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/currency";
import dayjs from "dayjs";
import {
  useGetGiftVouchersQuery,
  useCreateGiftVoucherMutation,
  useUpdateGiftVoucherMutation,
  useDeleteGiftVoucherMutation,
  type GiftVoucherResponse,
} from "@/store/api/giftVouchersApi";

const { Title } = Typography;

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminGiftCardsPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftVoucherResponse | null>(null);
  const [form] = Form.useForm();

  // API hooks
  const { data: giftVouchers = [], isLoading, refetch } = useGetGiftVouchersQuery();
  const [createGiftVoucher, { isLoading: isCreating }] = useCreateGiftVoucherMutation();
  const [updateGiftVoucher, { isLoading: isUpdating }] = useUpdateGiftVoucherMutation();
  const [deleteGiftVoucher, { isLoading: isDeleting }] = useDeleteGiftVoucherMutation();

  // Transform API response to GiftCard interface for display
  const transformGiftVoucher = useCallback((voucher: GiftVoucherResponse): GiftCard => ({
    id: String(voucher.id),
    code: voucher.code,
    amount: voucher.amount,
    balance: voucher.balance ?? voucher.amount,
    validFrom: voucher.valid_from || voucher.validFrom || new Date().toISOString(),
    validUntil: voucher.valid_until || voucher.validUntil || new Date().toISOString(),
    isActive: voucher.is_active ?? voucher.isActive ?? true,
    createdAt: voucher.created_at || voucher.createdAt || new Date().toISOString(),
  }), []);

  const transformedCards = useMemo(() => {
    return giftVouchers.map(transformGiftVoucher);
  }, [giftVouchers, transformGiftVoucher]);

  const handleAdd = useCallback(() => {
    setEditingCard(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
    });
    setIsModalOpen(true);
  }, [form]);

  const handleEdit = useCallback((voucher: GiftVoucherResponse) => {
    setEditingCard(voucher);
    form.setFieldsValue({
      amount: voucher.amount,
      purchased_by_id: voucher.purchased_by_id,
      assigned_to_id: voucher.assigned_to_id,
      valid_from: voucher.valid_from ? dayjs(voucher.valid_from) : (voucher.validFrom ? dayjs(voucher.validFrom) : undefined),
      valid_until: voucher.valid_until ? dayjs(voucher.valid_until) : (voucher.validUntil ? dayjs(voucher.validUntil) : undefined),
      message: voucher.message,
      is_active: voucher.is_active ?? voucher.isActive ?? true,
    });
    setIsModalOpen(true);
  }, [form]);

  const handleDelete = useCallback(async (id: string | number) => {
    try {
      await deleteGiftVoucher(id).unwrap();
      message.success("Gift voucher deleted successfully");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete gift voucher");
    }
  }, [deleteGiftVoucher, message, refetch]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        amount: values.amount,
        purchased_by_id: values.purchased_by_id,
        assigned_to_id: values.assigned_to_id,
        valid_from: values.valid_from?.toISOString(),
        valid_until: values.valid_until?.toISOString(),
        message: values.message,
      };

      if (editingCard) {
        await updateGiftVoucher({ id: editingCard.id, data: { ...payload, is_active: values.is_active } }).unwrap();
        message.success("Gift voucher updated successfully");
      } else {
        await createGiftVoucher(payload).unwrap();
        message.success("Gift voucher created successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Operation failed");
    }
  };

  const columns: ColumnsType<GiftCard> = useMemo(() => [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance: number | undefined, record: GiftCard) => formatCurrency(balance ?? record.amount),
    },
    {
      title: "Valid From",
      dataIndex: "validFrom",
      key: "validFrom",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Valid Until",
      dataIndex: "validUntil",
      key: "validUntil",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (isActive ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: GiftCard) => {
        const originalVoucher = giftVouchers.find(v => String(v.id) === record.id);
        return originalVoucher ? (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(originalVoucher)}>
              Edit
            </Button>
            <Popconfirm title="Delete gift voucher?" onConfirm={() => handleDelete(originalVoucher.id)}>
              <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : null;
      },
    },
  ], [giftVouchers, handleEdit, handleDelete, isDeleting]);

  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Title level={1}>Manage Gift Cards</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Gift Card
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={transformedCards}
          rowKey="id"
          loading={isLoading}
        />

        <Modal
          title={editingCard ? "Edit Gift Voucher" : "Add Gift Voucher"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Please enter voucher amount" }]}>
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="Enter voucher amount" />
            </Form.Item>

            <Form.Item name="purchased_by_id" label="Purchased By (User ID)">
              <InputNumber min={1} style={{ width: "100%" }} placeholder="User ID who purchased" />
            </Form.Item>

            <Form.Item name="assigned_to_id" label="Assigned To (User ID)">
              <InputNumber min={1} style={{ width: "100%" }} placeholder="User ID who will receive" />
            </Form.Item>

            <Form.Item name="valid_from" label="Valid From" rules={[{ required: true, message: "Please select start date" }]}>
              <DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>

            <Form.Item name="valid_until" label="Valid Until" rules={[{ required: true, message: "Please select end date" }]}>
              <DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>

            <Form.Item name="message" label="Message">
              <TextArea rows={3} placeholder="Optional message for the recipient" />
            </Form.Item>

            {editingCard && (
              <Form.Item name="is_active" label="Active" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                  {editingCard ? "Update" : "Create"}
                </Button>
                <Button onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

