"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography, Space, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAppSelector } from "@/store/hooks";

const { Title } = Typography;

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user, form]);

  const handleSubmit = (values: any) => {
    console.log("Update profile", values);
    // Update profile logic
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Title level={1} style={{ marginBottom: "32px" }}>
          My Profile
        </Title>

        <Card>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <Title level={3} style={{ marginTop: "16px" }}>
              {user?.name}
            </Title>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

