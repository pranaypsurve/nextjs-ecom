"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  App,
  Space,
  Typography,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Switch,
  Badge,
  Tooltip,
  Avatar,
  Divider,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  TeamOutlined,
  CrownOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Role } from "@/lib/constants";
import type { User } from "@/store/slices/authSlice";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type UserResponse,
} from "@/store/api/usersApi";

const { Title, Text } = Typography;
const { Search } = Input;

interface UserTableItem extends User {
  key: string;
  is_active?: boolean;
}

export default function AdminUsersPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // API hooks
  const { data: users = [], isLoading, refetch } = useGetUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active !== false).length;
    const inactive = users.filter((u) => u.is_active === false).length;
    const admins = users.filter((u) => u.role === Role.ADMIN).length;
    const customers = users.filter((u) => u.role === Role.USER || u.role === Role.CUSTOMER).length;
    return { total, active, inactive, admins, customers };
  }, [users]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchText ||
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchText.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active !== false) ||
        (statusFilter === "inactive" && user.is_active === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchText, roleFilter, statusFilter]);

  // Transform API response to UserTableItem interface for display
  const transformUser = useCallback((user: UserResponse): UserTableItem => ({
    key: String(user.id),
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    is_active: user.is_active ?? true,
  }), []);

  const transformedUsers = useMemo(() => {
    return filteredUsers.map(transformUser);
  }, [filteredUsers, transformUser]);

  const handleEdit = useCallback((user: UserResponse) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active ?? true,
    });
    setIsModalOpen(true);
  }, [form]);

  const handleDelete = useCallback(async (id: string | number) => {
    try {
      await deleteUser(id).unwrap();
      message.success("User deleted successfully");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete user");
    }
  }, [deleteUser, message, refetch]);

  const handleSubmit = useCallback(async (values: any) => {
    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id, data: values }).unwrap();
        message.success("User updated successfully");
      } else {
        message.error("User creation is not supported via API");
        return;
      }
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Operation failed");
    }
  }, [editingUser, updateUser, message, form, refetch]);

  const columns: ColumnsType<UserTableItem> = useMemo(() => [
    {
      title: "User",
      key: "user",
      width: 280,
      fixed: "left",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar 
            size={50}
            style={{
              background: record.role === Role.ADMIN 
                ? "linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {(record.name || "U").charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Text strong style={{ fontSize: 15 }}>
                {record.name || "N/A"}
              </Text>
              {record.role === Role.ADMIN && (
                <Tooltip title="Admin User">
                  <CrownOutlined style={{ color: "#faad14", fontSize: 16 }} />
                </Tooltip>
              )}
              {record.is_active !== false && (
                <Badge status="success" />
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (phone: string) => phone ? (
        <Space>
          <PhoneOutlined style={{ color: "#52c41a" }} />
          <Text>{phone}</Text>
        </Space>
      ) : (
        <Text type="secondary">-</Text>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 140,
      align: "center",
      render: (role: Role) => {
        const colorMap: Record<Role, string> = {
          [Role.ADMIN]: "error",
          [Role.CUSTOMER]: "processing",
          [Role.INVENTORY]: "warning",
          [Role.ORDER]: "success",
          [Role.USER]: "default",
        };
        const iconMap: Record<Role, React.ReactNode> = {
          [Role.ADMIN]: <CrownOutlined />,
          [Role.CUSTOMER]: <UserOutlined />,
          [Role.INVENTORY]: <IdcardOutlined />,
          [Role.ORDER]: <TeamOutlined />,
          [Role.USER]: <UserOutlined />,
        };
        return (
          <Tag 
            color={colorMap[role] || "default"}
            icon={iconMap[role]}
            style={{ 
              borderRadius: 8,
              padding: "6px 14px",
              fontWeight: 500,
              fontSize: 13
            }}
          >
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      align: "center",
      render: (isActive: boolean) => (
        <Tag 
          color={isActive ? "success" : "error"}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          style={{ 
            borderRadius: 8,
            padding: "6px 14px",
            fontWeight: 500,
            fontSize: 13
          }}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      fixed: "right",
      align: "center",
      render: (_: any, record: UserTableItem) => {
        const originalUser = users.find((u) => String(u.id) === record.id);
        return originalUser ? (
          <Space size="small">
            <Tooltip title="Edit User">
              <Button 
                type="primary"
                ghost
                icon={<EditOutlined />} 
                onClick={() => handleEdit(originalUser)} 
                size="middle"
                style={{ borderRadius: 8 }}
              >
                Edit
              </Button>
            </Tooltip>
            <Popconfirm
              title="Delete user?"
              description={
                <div>
                  <p style={{ margin: 0 }}>This action cannot be undone.</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>Are you sure?</p>
                </div>
              }
              onConfirm={() => handleDelete(originalUser.id)}
              okText="Yes, delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  loading={isDeleting} 
                  size="middle"
                  style={{ borderRadius: 8 }}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ) : null;
      },
    },
  ], [users, handleEdit, handleDelete, isDeleting]);

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
        <style jsx global>{`
          .table-row-light {
            background-color: #ffffff;
          }
          .table-row-dark {
            background-color: #fafafa;
          }
          .ant-table-row:hover > td {
            background-color: #f0f5ff !important;
          }
        `}</style>

        {/* Header */}
        <div className="page-header">
          <Title level={1} style={{ color: "white", margin: 0 }}>
            User Management
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block", marginTop: 8 }}>
            Manage user accounts, roles, and permissions
          </Text>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Total Users"
                value={stats.total}
                prefix={<UserOutlined />}
                styles={{ content: { color: "#667eea" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Active Users"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Admins"
                value={stats.admins}
                prefix={<UserOutlined />}
                styles={{ content: { color: "#ff4d4f" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Customers"
                value={stats.customers}
                prefix={<UserOutlined />}
                styles={{ content: { color: "#1890ff" } }}
              />
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <div className="filters-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search by name, email, or phone"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by Role"
                size="large"
                style={{ width: "100%" }}
                value={roleFilter}
                onChange={setRoleFilter}
              >
                <Select.Option value="all">All Roles</Select.Option>
                <Select.Option value={Role.ADMIN}>Admin</Select.Option>
                <Select.Option value={Role.USER}>User</Select.Option>
                <Select.Option value={Role.CUSTOMER}>Customer</Select.Option>
                <Select.Option value={Role.INVENTORY}>Inventory</Select.Option>
                <Select.Option value={Role.ORDER}>Order</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
              </Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={transformedUsers}
            rowKey={(record) => String(record.id)}
            loading={isLoading}
            scroll={{ x: 1100 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) => (
                <Text strong style={{ fontSize: 14 }}>
                  Total {total} users
                </Text>
              ),
            }}
            locale={{
              emptyText: (
                <Empty
                  image={<TeamOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
                  styles={{ image: { height: 80 } }}
                  description={
                    <div style={{ padding: "24px 0" }}>
                      <Typography.Title level={4} style={{ color: "#8c8c8c", marginBottom: 8 }}>
                        No users found
                      </Typography.Title>
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        {searchText || roleFilter !== "all" || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Users will appear here once they register"
                        }
                      </Text>
                    </div>
                  }
                />
              ),
            }}
            rowClassName={(record, index) => index % 2 === 0 ? "table-row-light" : "table-row-dark"}
          />
        </div>

        {/* Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: editingUser?.role === Role.ADMIN 
                  ? "linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {editingUser?.role === Role.ADMIN ? <CrownOutlined style={{ fontSize: 24, color: "white" }} /> : <UserOutlined style={{ fontSize: 24, color: "white" }} />}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                  {editingUser ? "Edit User" : "Add User"}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                  {editingUser ? "Update user information and permissions" : "Create a new user account"}
                </div>
              </div>
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={640}
          styles={{
            body: { paddingTop: 24 }
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item 
                  name="name" 
                  label={
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      <UserOutlined style={{ marginRight: 6 }} />
                      Full Name
                    </span>
                  }
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input 
                    size="large" 
                    placeholder="Enter full name"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="email"
                  label={
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      <MailOutlined style={{ marginRight: 6 }} />
                      Email Address
                    </span>
                  }
                  rules={[{ required: true, type: "email", message: "Please enter valid email" }]}
                >
                  <Input 
                    size="large" 
                    placeholder="user@example.com"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item 
                  name="phone" 
                  label={
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      <PhoneOutlined style={{ marginRight: 6 }} />
                      Phone Number
                    </span>
                  }
                >
                  <Input 
                    size="large" 
                    placeholder="+1 (555) 000-0000"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={editingUser ? 12 : 24}>
                <Form.Item 
                  name="role" 
                  label={
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      <IdcardOutlined style={{ marginRight: 6 }} />
                      User Role
                    </span>
                  }
                  rules={[{ required: true, message: "Please select role" }]}
                >
                  <Select 
                    size="large" 
                    placeholder="Select role"
                    style={{ borderRadius: 8 }}
                  >
                    <Select.Option value={Role.USER}>
                      <Space><UserOutlined />User</Space>
                    </Select.Option>
                    <Select.Option value={Role.CUSTOMER}>
                      <Space><UserOutlined />Customer</Space>
                    </Select.Option>
                    <Select.Option value={Role.ADMIN}>
                      <Space><CrownOutlined />Admin</Space>
                    </Select.Option>
                    <Select.Option value={Role.INVENTORY}>
                      <Space><IdcardOutlined />Inventory</Space>
                    </Select.Option>
                    <Select.Option value={Role.ORDER}>
                      <Space><TeamOutlined />Order</Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              {editingUser && (
                <Col span={12}>
                  <Form.Item 
                    name="is_active" 
                    label={
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        <CheckCircleOutlined style={{ marginRight: 6 }} />
                        Status
                      </span>
                    }
                    valuePropName="checked"
                  >
                    <div style={{ paddingTop: 8 }}>
                      <Switch 
                        checkedChildren="Active" 
                        unCheckedChildren="Inactive"
                        style={{ width: 100 }}
                      />
                    </div>
                  </Form.Item>
                </Col>
              )}
            </Row>
            
            <Divider style={{ margin: "24px 0" }} />
            
            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                  }}
                  size="large"
                  style={{ 
                    borderRadius: 8,
                    minWidth: 100
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isUpdating} 
                  size="large"
                  icon={editingUser ? <CheckCircleOutlined /> : <PlusOutlined />}
                  style={{ 
                    borderRadius: 8,
                    minWidth: 140,
                    background: editingUser?.role === Role.ADMIN 
                      ? "linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  {editingUser ? "Update User" : "Create User"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
}
