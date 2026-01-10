"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  DatePicker,
  App,
  Space,
  Typography,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
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

const { Title, Text } = Typography;
const { Search } = Input;

export default function AdminCouponsPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponResponse | null>(null);
  const [form] = Form.useForm();
  const [conditionType, setConditionType] = useState<"products" | "categories" | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // API hooks
  const { data: coupons = [], isLoading, refetch } = useGetCouponsAdminQuery();
  const { data: products = [] } = useGetProductsAdminQuery();
  const { data: categories = [] } = useGetCategoriesAdminQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.is_active !== false).length;
    const inactive = coupons.filter((c) => c.is_active === false).length;
    const expired = coupons.filter((c) => {
      const expiryDate = dayjs(c.valid_until || c.validUntil);
      return expiryDate.isBefore(dayjs());
    }).length;
    return { total, active, inactive, expired };
  }, [coupons]);

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch =
        !searchText ||
        coupon.code.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && coupon.is_active !== false) ||
        (statusFilter === "inactive" && coupon.is_active === false) ||
        (statusFilter === "expired" && dayjs(coupon.valid_until || coupon.validUntil).isBefore(dayjs()));

      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchText, statusFilter]);

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
    usedCount: 0,
    isActive: coupon.is_active ?? coupon.isActive ?? true,
  });

  const transformedCoupons = filteredCoupons.map(transformCoupon);

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
      width: 150,
      render: (code: string) => <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>{code}</Tag>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => <Tag>{type === "percentage" ? "Percentage" : "Fixed"}</Tag>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: 120,
      render: (value: number, record: Coupon) =>
        record.type === "percentage" ? `${value}%` : formatCurrency(value),
    },
    {
      title: "Min Amount",
      dataIndex: "minPurchase",
      key: "minPurchase",
      width: 120,
      render: (amount: number) => (amount ? formatCurrency(amount) : <Text type="secondary">-</Text>),
    },
    {
      title: "Valid Until",
      dataIndex: "validUntil",
      key: "validUntil",
      width: 150,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Usage Limit",
      dataIndex: "usageLimit",
      key: "usageLimit",
      width: 120,
      render: (limit: number) => (limit ? limit : <Text type="secondary">Unlimited</Text>),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: Coupon) => {
        const originalCoupon = coupons.find((c) => String(c.id) === record.id);
        return originalCoupon ? (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(originalCoupon)} size="small">
              Edit
            </Button>
            <Popconfirm
              title="Delete coupon?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(originalCoupon.id)}
            >
              <Button danger icon={<DeleteOutlined />} loading={isDeleting} size="small">
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : null;
      },
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

        {/* Header */}
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Title level={1} style={{ color: "white", margin: 0 }}>
                Coupon Management
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block", marginTop: 8 }}>
                Create and manage discount coupons
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{
                background: "white",
                color: "#667eea",
                border: "none",
                height: 48,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Add Coupon
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Total Coupons"
                value={stats.total}
                prefix={<TagOutlined />}
                styles={{ content: { color: "#667eea" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Active Coupons"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Inactive Coupons"
                value={stats.inactive}
                prefix={<CloseCircleOutlined />}
                styles={{ content: { color: "#ff4d4f" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Expired Coupons"
                value={stats.expired}
                prefix={<CloseCircleOutlined />}
                styles={{ content: { color: "#fa8c16" } }}
              />
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <div className="filters-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12}>
              <Search
                placeholder="Search by coupon code"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Select
                placeholder="Filter by Status"
                size="large"
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
                <Select.Option value="expired">Expired</Select.Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={transformedCoupons}
            rowKey={(record) => String(record.id)}
            loading={isLoading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} coupons`,
            }}
          />
        </div>

        {/* Modal */}
        <Modal
          title={editingCoupon ? "Edit Coupon" : "Add New Coupon"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setConditionType("all");
          }}
          footer={null}
          width={700}
          styles={{
            body: { maxHeight: "70vh", overflowY: "auto" },
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="code" label="Coupon Code" rules={[{ required: true, message: "Please enter coupon code" }]}>
              <Input size="large" placeholder="e.g., SAVE20" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Discount Type"
                  rules={[{ required: true, message: "Please select discount type" }]}
                >
                  <Select size="large" placeholder="Select discount type">
                    <Select.Option value="percentage">Percentage</Select.Option>
                    <Select.Option value="fixed">Fixed Amount</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="value"
                  label="Discount Value"
                  rules={[{ required: true, message: "Please enter discount value" }]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} size="large" placeholder="Enter discount value" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="condition_type" label="Applicable To" rules={[{ required: true }]}>
              <Select
                size="large"
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
                  size="large"
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
                  size="large"
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

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="minimum_amount" label="Minimum Purchase Amount">
                  <InputNumber min={0} style={{ width: "100%" }} size="large" placeholder="Minimum amount" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maximum_discount" label="Maximum Discount (for percentage)">
                  <InputNumber min={0} style={{ width: "100%" }} size="large" placeholder="Maximum discount" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="valid_from"
                  label="Valid From"
                  rules={[{ required: true, message: "Please select start date" }]}
                >
                  <DatePicker showTime style={{ width: "100%" }} size="large" format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="valid_until"
                  label="Valid Until"
                  rules={[{ required: true, message: "Please select end date" }]}
                >
                  <DatePicker showTime style={{ width: "100%" }} size="large" format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="usage_limit" label="Usage Limit" tooltip="0 means unlimited">
              <InputNumber min={0} style={{ width: "100%" }} size="large" placeholder="0 for unlimited" />
            </Form.Item>

            <Form.Item name="is_active" label="Active" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isCreating || isUpdating} size="large">
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setConditionType("all");
                  }}
                  size="large"
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
}
