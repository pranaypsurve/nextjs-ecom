"use client";

import { useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, App, Space, Typography, Popconfirm, Tag, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import {
  useGetProductsAdminQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  type ProductResponse,
} from "@/store/api/productsApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { formatCurrency } from "@/lib/utils/currency";

const { Title } = Typography;
const { TextArea } = Input;

export default function AdminProductsPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [form] = Form.useForm();

  // API hooks
  const { data: products = [], isLoading, refetch } = useGetProductsAdminQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      inventory_total: product.inventory_total,
      sku: product.sku,
      images: product.images?.join("\n") || "",
      is_active: product.is_active !== false,
      categoryId: product.categoryId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteProduct(id).unwrap();
      message.success("Product deleted successfully");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete product";
      message.error(errorMessage);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Parse images from newline-separated string
      const images = values.images
        ? values.images.split("\n").filter((img: string) => img.trim())
        : [];

      if (editingProduct) {
        // Update product
        await updateProduct({
          id: editingProduct.id,
          data: {
            name: values.name,
            description: values.description,
            price: values.price,
            discount_price: values.discount_price,
            inventory_total: values.inventory_total,
            sku: values.sku,
            images: images,
            is_active: values.is_active,
            categoryId: values.categoryId,
          },
        }).unwrap();
        message.success("Product updated successfully");
      } else {
        // Create product
        await createProduct({
          name: values.name,
          description: values.description,
          price: values.price,
          discount_price: values.discount_price,
          inventory_total: values.inventory_total,
          sku: values.sku,
          images: images,
          is_active: values.is_active !== false,
          categoryId: values.categoryId,
        }).unwrap();
        message.success("Product created successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Operation failed";
      message.error(errorMessage);
    }
  };

  const columns: ColumnsType<ProductResponse> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price, record) => (
        <div>
          <div>{formatCurrency(price)}</div>
          {record.discount_price && (
            <div style={{ textDecoration: "line-through", color: "#999", fontSize: "12px" }}>
              {formatCurrency(record.discount_price)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "inventory_total",
      key: "inventory_total",
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
            title="Delete product?"
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
          <Title level={1}>Manage Products</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Product
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={isLoading}
        />

        <Modal
          title={editingProduct ? "Edit Product" : "Add Product"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="sku" label="SKU">
              <Input placeholder="Product SKU" />
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="discount_price" label="Discount Price">
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="inventory_total" label="Inventory Total" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Select category">
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={Number(cat.id)}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="images"
              label="Images (one URL per line)"
              help="Enter image URLs, one per line"
            >
              <TextArea rows={3} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
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
                  {editingProduct ? "Update" : "Create"}
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

