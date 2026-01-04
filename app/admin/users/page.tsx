"use client";

import { useState, useMemo, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, App, Space, Typography, Popconfirm, Tag, Switch } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import type { User } from "@/store/slices/authSlice";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type UserResponse,
} from "@/store/api/usersApi";

const { Title } = Typography;

interface UserTableItem extends User {
  key: string;
  is_active?: boolean;
}

export default function AdminUsersPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form] = Form.useForm();

  // API hooks
  const { data: users = [], isLoading, refetch } = useGetUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

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
    return users.map(transformUser);
  }, [users, transformUser]);

  const handleAdd = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      role: Role.USER,
      is_active: true,
    });
    setIsModalOpen(true);
  }, [form]);

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
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "-",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: Role) => {
        const colorMap: Record<Role, string> = {
          [Role.ADMIN]: "red",
          [Role.CUSTOMER]: "blue",
          [Role.INVENTORY]: "orange",
          [Role.ORDER]: "green",
          [Role.USER]: "default",
        };
        return <Tag color={colorMap[role] || "default"}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (isActive ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: UserTableItem) => {
        const originalUser = users.find(u => String(u.id) === record.id);
        return originalUser ? (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(originalUser)}>
              Edit
            </Button>
            <Popconfirm title="Delete user?" onConfirm={() => handleDelete(originalUser.id)}>
              <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : null;
      },
    },
  ], [users, handleEdit, handleDelete, isDeleting]);

  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Title level={1}>Manage Users</Title>
          {/* Note: User creation is typically done via registration, not admin panel */}
        </div>

        <Table
          columns={columns}
          dataSource={transformedUsers}
          rowKey="id"
          loading={isLoading}
        />

        <Modal
          title={editingUser ? "Edit User" : "Add User"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter name" }]}>
              <Input placeholder="Enter user name" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Please enter valid email" }]}>
              <Input placeholder="Enter email" />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="Enter phone number" />
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true, message: "Please select role" }]}>
              <Select placeholder="Select role">
                <Select.Option value={Role.USER}>User</Select.Option>
                <Select.Option value={Role.CUSTOMER}>Customer</Select.Option>
                <Select.Option value={Role.ADMIN}>Admin</Select.Option>
                <Select.Option value={Role.INVENTORY}>Inventory</Select.Option>
                <Select.Option value={Role.ORDER}>Order</Select.Option>
              </Select>
            </Form.Item>
            {editingUser && (
              <Form.Item name="is_active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            )}
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isUpdating}>
                  {editingUser ? "Update" : "Create"}
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

