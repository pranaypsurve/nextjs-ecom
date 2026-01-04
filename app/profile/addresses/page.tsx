"use client";

import { useEffect, useState } from "react";
import { Card, Button, Modal, Form, Input, Space, Typography, Empty, Popconfirm, App } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import type { Address } from "@/lib/data";

const { Title } = Typography;

export default function AddressesPage() {
  const { message } = App.useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Load addresses
    setAddresses([]);
  }, []);

  const handleAdd = () => {
    setEditingAddress(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    form.setFieldsValue(address);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    message.success("Address deleted");
    // Delete logic
  };

  const handleSubmit = (values: any) => {
    message.success(editingAddress ? "Address updated" : "Address added");
    setIsModalOpen(false);
    form.resetFields();
    // Save logic
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <Title level={1}>Manage Addresses</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <Empty description="No addresses saved">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Address
              </Button>
            </Empty>
          </Card>
        ) : (
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            {addresses.map((address) => (
              <Card
                key={address.id}
                title={address.type}
                extra={
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(address)}>
                      Edit
                    </Button>
                    <Popconfirm title="Delete address?" onConfirm={() => handleDelete(address.id)}>
                      <Button danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                }
              >
                <p>
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
                <p>Phone: {address.phone}</p>
              </Card>
            ))}
          </Space>
        )}

        <Modal
          title={editingAddress ? "Edit Address" : "Add Address"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="street" label="Street Address" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="city" label="City" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="state" label="State" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="zipCode" label="Zip Code" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="country" label="Country" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingAddress ? "Update" : "Add"}
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

