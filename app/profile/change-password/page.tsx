"use client";

import { Card, Form, Input, Button, Typography, App } from "antd";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const { Title } = Typography;

export default function ChangePasswordPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    console.log("Change password", values);
    message.success("Password changed successfully");
    form.resetFields();
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Title level={1} style={{ marginBottom: "32px" }}>
          Change Password
        </Title>

        <Card>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

