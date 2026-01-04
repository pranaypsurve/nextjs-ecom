"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, DatePicker, App, Space, Typography, Popconfirm, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import { dataService } from "@/lib/services/dataService";
import { formatCurrency } from "@/lib/utils/currency";
import type { Coupon } from "@/lib/data";
import dayjs from "dayjs";

const { Title } = Typography;

export default function AdminCouponsPage() {
  const { message } = App.useApp();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    const cop = dataService.getCoupons();
    setCoupons(cop);
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.setFieldsValue({
      ...coupon,
      validFrom: dayjs(coupon.validFrom),
      validUntil: dayjs(coupon.validUntil),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    message.success("Coupon deleted (JSON mode - changes not persisted)");
    loadCoupons();
  };

  const handleSubmit = async (values: any) => {
    try {
      message.success(editingCoupon ? "Coupon updated" : "Coupon created");
      setIsModalOpen(false);
      form.resetFields();
      loadCoupons();
    } catch (error) {
      message.error("Operation failed");
    }
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (value, record) =>
        record.type === "percentage" ? `${value}%` : formatCurrency(value),
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
          <Popconfirm title="Delete coupon?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Title level={1}>Manage Coupons</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Coupon
          </Button>
        </div>

        <Table columns={columns} dataSource={coupons} rowKey="id" />

        <Modal
          title={editingCoupon ? "Edit Coupon" : "Add Coupon"}
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
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="value" label="Value" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="minPurchase" label="Min Purchase">
              <InputNumber min={0} style={{ width: "100%" }} />
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
                  {editingCoupon ? "Update" : "Create"}
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

