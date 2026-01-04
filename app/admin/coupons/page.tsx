"use client";

import { useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, DatePicker, App, Space, Typography, Popconfirm, Tag, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/currency";
import type { Coupon } from "@/lib/data";
import dayjs from "dayjs";
import {
  useGetCouponsAdminQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  type CouponResponse,
} from "@/store/api/couponsApi";
import { useGetProductsAdminQuery } from "@/store/api/productsApi";
import { useGetCategoriesAdminQuery } from "@/store/api/categoriesApi";

const { Title } = Typography;

export default function AdminCouponsPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponResponse | null>(null);
  const [form] = Form.useForm();
  const [conditionType, setConditionType] = useState<"products" | "categories" | "all">("all");

  // API hooks
  const { data: coupons = [], isLoading, refetch } = useGetCouponsAdminQuery();
  const { data: products = [] } = useGetProductsAdminQuery();
  const { data: categories = [] } = useGetCategoriesAdminQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  // Transform API response to Coupon interface for display
  const transformCoupon = (coupon: CouponResponse): Coupon => ({
    id: String(coupon.id),
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minPurchase: coupon.minimum_amount,
    maxDiscount: coupon.maximum_discount,
    validFrom: coupon.valid_from || coupon.validFrom || new Date().toISOString(),
    validUntil: coupon.valid_until || coupon.validUntil || new Date().toISOString(),
    usageLimit: coupon.usage_limit,
    usedCount: 0, // API might not return this
    isActive: coupon.is_active ?? coupon.isActive ?? true,
  });

  const transformedCoupons = coupons.map(transformCoupon);

  const handleAdd = () => {
    setEditingCoupon(null);
    setConditionType("all");
    form.resetFields();
    form.setFieldsValue({
      condition_type: "all",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (coupon: CouponResponse) => {
    setEditingCoupon(coupon);
    const conditionTypeValue = coupon.condition_type || "all";
    setConditionType(conditionTypeValue);
    form.setFieldsValue({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      condition_type: conditionTypeValue,
      applicable_product_ids: coupon.applicable_product_ids,
      applicable_category_ids: coupon.applicable_category_ids,
      minimum_amount: coupon.minimum_amount,
      maximum_discount: coupon.maximum_discount,
      valid_from: coupon.valid_from ? dayjs(coupon.valid_from) : dayjs(coupon.validFrom),
      valid_until: coupon.valid_until ? dayjs(coupon.valid_until) : dayjs(coupon.validUntil),
      usage_limit: coupon.usage_limit,
      is_active: coupon.is_active ?? coupon.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteCoupon(id).unwrap();
      message.success("Coupon deleted successfully");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete coupon");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        code: values.code,
        type: values.type,
        value: values.value,
        condition_type: values.condition_type || "all",
        applicable_product_ids: values.condition_type === "products" ? values.applicable_product_ids : undefined,
        applicable_category_ids: values.condition_type === "categories" ? values.applicable_category_ids : undefined,
        minimum_amount: values.minimum_amount,
        maximum_discount: values.maximum_discount,
        valid_from: values.valid_from?.toISOString(),
        valid_until: values.valid_until?.toISOString(),
        usage_limit: values.usage_limit || 0,
        is_active: values.is_active ?? true,
      };

      if (editingCoupon) {
        await updateCoupon({ id: editingCoupon.id, data: payload }).unwrap();
        message.success("Coupon updated successfully");
      } else {
        await createCoupon(payload).unwrap();
        message.success("Coupon created successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Operation failed");
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
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (value, record) =>
        record.type === "percentage" ? `${value}%` : formatCurrency(value),
    },
    {
      title: "Min Amount",
      dataIndex: "minPurchase",
      key: "minPurchase",
      render: (amount) => amount ? formatCurrency(amount) : "-",
    },
    {
      title: "Usage Limit",
      dataIndex: "usageLimit",
      key: "usageLimit",
      render: (limit) => limit ? limit : "Unlimited",
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
      render: (_, record) => {
        const originalCoupon = coupons.find(c => String(c.id) === record.id);
        return originalCoupon ? (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(originalCoupon)}>
              Edit
            </Button>
            <Popconfirm title="Delete coupon?" onConfirm={() => handleDelete(originalCoupon.id)}>
              <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : null;
      },
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

        <Table
          columns={columns}
          dataSource={transformedCoupons}
          rowKey="id"
          loading={isLoading}
        />

        <Modal
          title={editingCoupon ? "Edit Coupon" : "Add Coupon"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setConditionType("all");
          }}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="code" label="Code" rules={[{ required: true, message: "Please enter coupon code" }]}>
              <Input placeholder="e.g., SAVE20" />
            </Form.Item>

            <Form.Item name="type" label="Discount Type" rules={[{ required: true, message: "Please select discount type" }]}>
              <Select placeholder="Select discount type">
                <Select.Option value="percentage">Percentage</Select.Option>
                <Select.Option value="fixed">Fixed Amount</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="value" label="Discount Value" rules={[{ required: true, message: "Please enter discount value" }]}>
              <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter discount value" />
            </Form.Item>

            <Form.Item name="condition_type" label="Applicable To" rules={[{ required: true }]}>
              <Select
                placeholder="Select condition type"
                onChange={(value) => setConditionType(value)}
              >
                <Select.Option value="all">All Products</Select.Option>
                <Select.Option value="products">Specific Products</Select.Option>
                <Select.Option value="categories">Specific Categories</Select.Option>
              </Select>
            </Form.Item>

            {conditionType === "products" && (
              <Form.Item name="applicable_product_ids" label="Select Products">
                <Select
                  mode="multiple"
                  placeholder="Select products"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={products.map((p) => ({
                    value: Number(p.id),
                    label: p.name,
                  }))}
                />
              </Form.Item>
            )}

            {conditionType === "categories" && (
              <Form.Item name="applicable_category_ids" label="Select Categories">
                <Select
                  mode="multiple"
                  placeholder="Select categories"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={categories.map((c) => ({
                    value: Number(c.id),
                    label: c.name,
                  }))}
                />
              </Form.Item>
            )}

            <Form.Item name="minimum_amount" label="Minimum Purchase Amount">
              <InputNumber min={0} style={{ width: "100%" }} placeholder="Minimum amount required" />
            </Form.Item>

            <Form.Item name="maximum_discount" label="Maximum Discount (for percentage)">
              <InputNumber min={0} style={{ width: "100%" }} placeholder="Maximum discount cap" />
            </Form.Item>

            <Form.Item name="valid_from" label="Valid From" rules={[{ required: true, message: "Please select start date" }]}>
              <DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>

            <Form.Item name="valid_until" label="Valid Until" rules={[{ required: true, message: "Please select end date" }]}>
              <DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>

            <Form.Item name="usage_limit" label="Usage Limit" tooltip="0 means unlimited">
              <InputNumber min={0} style={{ width: "100%" }} placeholder="0 for unlimited" />
            </Form.Item>

            <Form.Item name="is_active" label="Active" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                  {editingCoupon ? "Update" : "Create"}
                </Button>
                <Button onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                  setConditionType("all");
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

