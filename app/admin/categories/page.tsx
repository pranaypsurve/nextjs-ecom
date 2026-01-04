"use client";

import { useState } from "react";
import { Table, Button, Modal, Form, Input, Switch, App, Space, Typography, Popconfirm, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import {
  useGetCategoriesAdminQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type CategoryResponse,
} from "@/store/api/categoriesApi";

const { Title } = Typography;

export default function AdminCategoriesPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [form] = Form.useForm();

  // API hooks
  const { data: categories = [], isLoading, refetch } = useGetCategoriesAdminQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      image: category.image,
      is_active: category.is_active !== false, // Default to true if not set
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteCategory(id).unwrap();
      message.success("Category deleted successfully");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete category";
      message.error(errorMessage);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        // Update category
        await updateCategory({
          id: editingCategory.id,
          data: {
            name: values.name,
            description: values.description,
            image: values.image,
            is_active: values.is_active,
          },
        }).unwrap();
        message.success("Category updated successfully");
      } else {
        // Create category
        await createCategory({
          name: values.name,
          description: values.description,
          image: values.image,
          is_active: values.is_active !== false,
        }).unwrap();
        message.success("Category created successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Operation failed";
      message.error(errorMessage);
    }
  };

  const columns: ColumnsType<CategoryResponse> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean | undefined) => (
        <Tag color={isActive !== false ? "green" : "red"}>
          {isActive !== false ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete category?"
            onConfirm={() => handleDelete(record.id)}
            disabled={isDeleting}
          >
            <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
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
          <Title level={1}>Manage Categories</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Category
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
        />

        <Modal
          title={editingCategory ? "Edit Category" : "Add Category"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name="image" label="Image URL">
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
            <Form.Item name="is_active" label="Active" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                >
                  {editingCategory ? "Update" : "Create"}
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

