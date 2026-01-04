"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, DatePicker, App, Space, Typography, Popconfirm, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import { dataService } from "@/lib/services/dataService";
import { formatCurrency } from "@/lib/utils/currency";
import dayjs from "dayjs";

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminGiftCardsPage() {
  const { message } = App.useApp();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadGiftCards();
  }, []);

  const loadGiftCards = () => {
    const cards = dataService.getGiftCards();
    setGiftCards(cards as GiftCard[]);
  };

  const handleAdd = () => {
    setEditingCard(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (card: GiftCard) => {
    setEditingCard(card);
    form.setFieldsValue({
      ...card,
      validFrom: dayjs(card.validFrom),
      validUntil: dayjs(card.validUntil),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    message.success("Gift card deleted (JSON mode - changes not persisted)");
    loadGiftCards();
  };

  const handleSubmit = async (values: any) => {
    try {
      message.success(editingCard ? "Gift card updated" : "Gift card created");
      setIsModalOpen(false);
      form.resetFields();
      loadGiftCards();
    } catch (error) {
      message.error("Operation failed");
    }
  };

  const columns: ColumnsType<GiftCard> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => formatCurrency(amount),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance) => formatCurrency(balance),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (isActive ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete gift card?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const { Title } = Typography;

  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Title level={1}>Manage Gift Cards</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Gift Card
          </Button>
        </div>

        <Table columns={columns} dataSource={giftCards} rowKey="id" />

        <Modal
          title={editingCard ? "Edit Gift Card" : "Add Gift Card"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="code" label="Code" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="balance" label="Balance" rules={[{ required: true }]}>
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="validFrom" label="Valid From">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="validUntil" label="Valid Until">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingCard ? "Update" : "Create"}
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

