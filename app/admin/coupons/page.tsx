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
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  InfoCircleOutlined,
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
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // API hooks
  const { data: coupons = [], isLoading, refetch } = useGetCouponsAdminQuery();
  const { data: products = [], isLoading: productsLoading } = useGetProductsAdminQuery();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesAdminQuery();
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
    setDiscountType(null);
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
    setDiscountType(coupon.type);
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
      // Validate based on discount type
      if (values.type === "percentage") {
        if (values.value <= 0 || values.value > 100) {
          message.error("Percentage discount must be between 1 and 100");
          return;
        }
      } else if (values.type === "fixed") {
        if (values.value <= 0) {
          message.error("Fixed discount amount must be greater than 0");
          return;
        }
      }

      // Validate condition type requirements
      if (values.condition_type === "products" && (!values.applicable_product_ids || values.applicable_product_ids.length === 0)) {
        message.error("Please select at least one product");
        return;
      }
      if (values.condition_type === "categories" && (!values.applicable_category_ids || values.applicable_category_ids.length === 0)) {
        message.error("Please select at least one category");
        return;
      }

      const payload = {
        code: values.code,
        type: values.type,
        value: values.value,
        condition_type: values.condition_type || "all",
        applicable_product_ids: values.condition_type === "products" ? values.applicable_product_ids : undefined,
        applicable_category_ids: values.condition_type === "categories" ? values.applicable_category_ids : undefined,
        minimum_amount: values.minimum_amount || undefined,
        maximum_discount: values.type === "percentage" ? (values.maximum_discount || undefined) : undefined, // Only for percentage
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
      setDiscountType(null);
      setConditionType("all");
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
            setDiscountType(null);
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
                  <Select 
                    size="large" 
                    placeholder="Select discount type"
                    onChange={(value) => {
                      setDiscountType(value);
                      // Reset max discount when switching types
                      if (value === "fixed") {
                        form.setFieldsValue({ maximum_discount: undefined });
                      }
                    }}
                  >
                    <Select.Option value="percentage">Percentage (%)</Select.Option>
                    <Select.Option value="fixed">Fixed Amount ($)</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="value"
                  label={discountType === "percentage" ? "Discount Percentage (%)" : discountType === "fixed" ? "Discount Amount ($)" : "Discount Value"}
                  rules={[
                    { required: true, message: "Please enter discount value" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const type = form.getFieldValue("type");
                        if (type === "percentage") {
                          if (value <= 0 || value > 100) {
                            return Promise.reject(new Error("Percentage must be between 1 and 100"));
                          }
                        } else if (type === "fixed") {
                          if (value <= 0) {
                            return Promise.reject(new Error("Amount must be greater than 0"));
                          }
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  tooltip={discountType === "percentage" ? "Enter a value between 1 and 100" : discountType === "fixed" ? "Enter the fixed discount amount" : "Select discount type first"}
                >
                  <InputNumber 
                    min={0} 
                    max={discountType === "percentage" ? 100 : undefined}
                    style={{ width: "100%" }} 
                    size="large" 
                    placeholder={discountType === "percentage" ? "e.g., 10" : discountType === "fixed" ? "e.g., 50" : "Enter value"}
                    addonAfter={discountType === "percentage" ? "%" : discountType === "fixed" ? "$" : ""}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Info Alert for Discount Type */}
            {discountType && (
              <Alert
                message={
                  discountType === "percentage" 
                    ? "Percentage Discount: Enter a value between 1-100%. You can optionally set a maximum discount amount to cap the discount."
                    : "Fixed Amount Discount: Enter the exact discount amount in dollars. Maximum discount field is not applicable."
                }
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item 
              name="condition_type" 
              label="Applicable To" 
              rules={[{ required: true, message: "Please select where this coupon applies" }]}
              tooltip="Choose whether this coupon applies to all products, specific products, or specific categories"
            >
              <Select
                size="large"
                placeholder="Select where coupon applies"
                onChange={(value) => {
                  setConditionType(value);
                  // Clear selections when changing condition type
                  if (value === "all") {
                    form.setFieldsValue({
                      applicable_product_ids: undefined,
                      applicable_category_ids: undefined,
                    });
                  } else if (value === "products") {
                    form.setFieldsValue({ applicable_category_ids: undefined });
                  } else if (value === "categories") {
                    form.setFieldsValue({ applicable_product_ids: undefined });
                  }
                }}
              >
                <Select.Option value="all">All Products</Select.Option>
                <Select.Option value="products">Specific Products</Select.Option>
                <Select.Option value="categories">Specific Categories</Select.Option>
              </Select>
            </Form.Item>

            {conditionType === "products" && (
              <Form.Item 
                name="applicable_product_ids" 
                label="Select Products"
                rules={[
                  { 
                    required: true, 
                    message: "Please select at least one product",
                    validator: (_, value) => {
                      if (!value || value.length === 0) {
                        return Promise.reject(new Error("Please select at least one product"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                tooltip="Select the products this coupon applies to"
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder={productsLoading ? "Loading products..." : products.length === 0 ? "No products available" : "Search and select products"}
                  showSearch
                  loading={productsLoading}
                  allowClear
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = option?.label ?? "";
                    return String(label).toLowerCase().includes(input.toLowerCase());
                  }}
                  options={products && products.length > 0 ? products.map((p) => {
                    const productId = typeof p.id === "string" ? (isNaN(Number(p.id)) ? p.id : Number(p.id)) : p.id;
                    return {
                      value: productId,
                      label: `${p.name || "Unnamed Product"}${p.sku ? ` (${p.sku})` : ""}`,
                    };
                  }) : []}
                  notFoundContent={
                    productsLoading 
                      ? "Loading products..." 
                      : products.length === 0 
                      ? "No products available. Please add products first." 
                      : "No products found matching your search"
                  }
                />
              </Form.Item>
            )}

            {conditionType === "categories" && (
              <Form.Item 
                name="applicable_category_ids" 
                label="Select Categories"
                rules={[
                  { 
                    required: true, 
                    message: "Please select at least one category",
                    validator: (_, value) => {
                      if (!value || value.length === 0) {
                        return Promise.reject(new Error("Please select at least one category"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                tooltip="Select the categories this coupon applies to"
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder={categoriesLoading ? "Loading categories..." : categories.length === 0 ? "No categories available" : "Search and select categories"}
                  showSearch
                  loading={categoriesLoading}
                  allowClear
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = option?.label ?? "";
                    return String(label).toLowerCase().includes(input.toLowerCase());
                  }}
                  options={categories && categories.length > 0 ? categories.map((c) => {
                    const categoryId = typeof c.id === "string" ? (isNaN(Number(c.id)) ? c.id : Number(c.id)) : c.id;
                    return {
                      value: categoryId,
                      label: c.name || "Unnamed Category",
                    };
                  }) : []}
                  notFoundContent={
                    categoriesLoading 
                      ? "Loading categories..." 
                      : categories.length === 0 
                      ? "No categories available. Please add categories first." 
                      : "No categories found matching your search"
                  }
                />
              </Form.Item>
            )}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="minimum_amount" 
                  label="Minimum Purchase Amount ($)"
                  tooltip="Minimum order amount required to use this coupon. Leave empty for no minimum."
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: "100%" }} 
                    size="large" 
                    placeholder="e.g., 100"
                    addonBefore="$"
                    precision={2}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="maximum_discount" 
                  label={
                    discountType === "percentage" 
                      ? "Maximum Discount ($) - Only for Percentage" 
                      : discountType === "fixed"
                      ? "Maximum Discount - Not applicable for Fixed Amount"
                      : "Maximum Discount ($) - Only for Percentage"
                  }
                  tooltip={
                    discountType === "percentage"
                      ? "Maximum discount amount in dollars. This limits the discount when using percentage. Leave empty for no limit."
                      : discountType === "fixed"
                      ? "Maximum discount only applies to percentage discounts, not fixed amounts."
                      : "Select percentage discount type to use this field"
                  }
                  rules={
                    discountType === "percentage"
                      ? [
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve(); // Optional
                              if (value <= 0) {
                                return Promise.reject(new Error("Maximum discount must be greater than 0"));
                              }
                              return Promise.resolve();
                            },
                          },
                        ]
                      : []
                  }
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: "100%" }} 
                    size="large" 
                    placeholder={discountType === "percentage" ? "e.g., 50" : "N/A for fixed"}
                    addonBefore="$"
                    precision={2}
                    disabled={discountType === "fixed" || !discountType}
                  />
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
                    setDiscountType(null);
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
