"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { Role } from "@/lib/constants";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      // Simulate API call - In real app, call authentication API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock authentication - In real app, validate credentials
      // For demo: admin@example.com / admin123 or user@example.com / user123
      const isAdmin = values.email === "admin@example.com" && values.password === "admin123";
      const isUser = values.email === "user@example.com" && values.password === "user123";

      if (isAdmin || isUser) {
        const user = {
          id: isAdmin ? "admin-1" : "user-1",
          email: values.email,
          name: isAdmin ? "Admin User" : "John Doe",
          role: isAdmin ? Role.ADMIN : Role.CUSTOMER,
          phone: "+1234567890",
        };

        const token = `mock_token_${Date.now()}`;

        dispatch(setCredentials({ user, token }));
        message.success("Login successful!");
        router.push(isAdmin ? "/admin" : "/");
        router.refresh();
      } else {
        message.error("Invalid email or password");
      }
    } catch (error) {
      message.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--color-primary) 0%, #52c41a 100%)",
        padding: "24px",
      }}
    >
      <Card style={{ width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={2}>Welcome Back</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary">
            Don't have an account? <Link href="/register">Sign up</Link>
          </Text>
        </div>

        <div style={{ marginTop: "24px", padding: "16px", background: "#f5f5f5", borderRadius: "4px" }}>
          <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}>
            Demo Credentials:
          </Text>
          <Text style={{ fontSize: "12px", display: "block" }}>
            Admin: admin@example.com / admin123
          </Text>
          <Text style={{ fontSize: "12px", display: "block" }}>
            User: user@example.com / user123
          </Text>
        </div>
      </Card>
    </div>
  );
}

