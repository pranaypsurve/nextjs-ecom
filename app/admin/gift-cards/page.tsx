"use client";

import { useState, useMemo, useCallback } from "react";
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
import TextArea from "antd/es/input/TextArea";

const { Search } = Input;
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { formatCurrency } from "@/lib/utils/currency";
import dayjs from "dayjs";
import {
  useGetGiftVouchersQuery,
  useCreateGiftVoucherMutation,
  useUpdateGiftVoucherMutation,
  useDeleteGiftVoucherMutation,
  type GiftVoucherResponse,
} from "@/store/api/giftVouchersApi";

const { Title, Text } = Typography;

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isUsed: boolean;
  createdAt: string;
}

export default function AdminGiftCardsPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftVoucherResponse | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // API hooks
  const { data: giftVouchers = [], isLoading, refetch } = useGetGiftVouchersQuery();
  const [createGiftVoucher, { isLoading: isCreating }] = useCreateGiftVoucherMutation();
  const [updateGiftVoucher, { isLoading: isUpdating }] = useUpdateGiftVoucherMutation();
  const [deleteGiftVoucher, { isLoading: isDeleting }] = useDeleteGiftVoucherMutation();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = giftVouchers.length;
    const active = giftVouchers.filter((gv) => gv.is_active !== false && !gv.is_used).length;
    const used = giftVouchers.filter((gv) => gv.is_used).length;
    const inactive = giftVouchers.filter((gv) => gv.is_active === false).length;
    const expired = giftVouchers.filter((gv) => {
      const expiryDate = dayjs(gv.valid_until || gv.validUntil);
      return expiryDate.isBefore(dayjs());
    }).length;
    return { total, active, used, inactive, expired };
  }, [giftVouchers]);

  // Filter gift vouchers
  const filteredVouchers = useMemo(() => {
    return giftVouchers.filter((voucher) => {
      const matchesSearch =
        !searchText ||
        voucher.code.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && voucher.is_active !== false && !voucher.is_used) ||
        (statusFilter === "used" && voucher.is_used) ||
        (statusFilter === "inactive" && voucher.is_active === false) ||
        (statusFilter === "expired" && dayjs(voucher.valid_until || voucher.validUntil).isBefore(dayjs()));

      return matchesSearch && matchesStatus;
    });
  }, [giftVouchers, searchText, statusFilter]);

  // Transform API response to GiftCard interface for display
  const transformGiftVoucher = useCallback((voucher: GiftVoucherResponse): GiftCard => ({
    id: String(voucher.id),
    code: voucher.code,
    amount: voucher.amount,
    balance: voucher.balance ?? voucher.amount,
    validFrom: voucher.valid_from || voucher.validFrom || new Date().toISOString(),
    validUntil: voucher.valid_until || voucher.validUntil || new Date().toISOString(),
    isActive: voucher.is_active ?? voucher.isActive ?? true,
    isUsed: voucher.is_used ?? false,
    createdAt: voucher.created_at || voucher.createdAt || new Date().toISOString(),
  }), []);

  const transformedCards = useMemo(() => {
    return filteredVouchers.map(transformGiftVoucher);
  }, [filteredVouchers, transformGiftVoucher]);

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
      width: 180,
      render: (code: string) => <Tag color="purple" style={{ fontSize: 14, padding: "4px 12px" }}>{code}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number) => <Text strong>{formatCurrency(amount)}</Text>,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: 120,
      render: (balance: number | undefined, record: GiftCard) => (
        <Text style={{ color: balance === record.amount ? "#52c41a" : "#fa8c16" }}>
          {formatCurrency(balance ?? record.amount)}
        </Text>
      ),
    },
    {
      title: "Valid From",
      dataIndex: "validFrom",
      key: "validFrom",
      width: 120,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Valid Until",
      dataIndex: "validUntil",
      key: "validUntil",
      width: 120,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_: any, record: GiftCard) => {
        if (record.isUsed) {
          return <Tag color="red">Used</Tag>;
        }
        if (!record.isActive) {
          return <Tag color="default">Inactive</Tag>;
        }
        if (dayjs(record.validUntil).isBefore(dayjs())) {
          return <Tag color="orange">Expired</Tag>;
        }
        return <Tag color="green">Active</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: GiftCard) => {
        const originalVoucher = giftVouchers.find((v) => String(v.id) === record.id);
        return originalVoucher ? (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(originalVoucher)} size="small">
              Edit
            </Button>
            <Popconfirm
              title="Delete gift voucher?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(originalVoucher.id)}
            >
              <Button danger icon={<DeleteOutlined />} loading={isDeleting} size="small">
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : null;
      },
    },
  ], [giftVouchers, handleEdit, handleDelete, isDeleting]);

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
                Gift Card Management
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block", marginTop: 8 }}>
                Create and manage gift vouchers
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
              Add Gift Card
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Total Gift Cards"
                value={stats.total}
                prefix={<GiftOutlined />}
                styles={{ content: { color: "#667eea" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Active"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Used"
                value={stats.used}
                prefix={<GiftOutlined />}
                styles={{ content: { color: "#1890ff" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Expired"
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
                placeholder="Search by gift card code"
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
                <Select.Option value="used">Used</Select.Option>
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
            dataSource={transformedCards}
            rowKey={(record) => String(record.id)}
            loading={isLoading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} gift cards`,
            }}
          />
        </div>

        {/* Modal */}
        <Modal
          title={editingCard ? "Edit Gift Voucher" : "Add New Gift Voucher"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: "Please enter voucher amount" }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} size="large" placeholder="Enter voucher amount" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="purchased_by_id" label="Purchased By (User ID)">
                  <InputNumber min={1} style={{ width: "100%" }} size="large" placeholder="User ID who purchased" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="assigned_to_id" label="Assigned To (User ID)">
                  <InputNumber min={1} style={{ width: "100%" }} size="large" placeholder="User ID who will receive" />
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
                <Button type="primary" htmlType="submit" loading={isCreating || isUpdating} size="large">
                  {editingCard ? "Update Gift Voucher" : "Create Gift Voucher"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    form.resetFields();
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
