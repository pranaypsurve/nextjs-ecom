"use client";

import { Form, Input, Button, Card, Typography, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useLoginMutation } from "@/store/api/authApi";
import { Role } from "@/lib/constants";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const result = await login({
        email: values.email,
        password: values.password,
      }).unwrap();

      // Validate response structure
      if (!result.data) {
        message.error("Invalid response from server");
        return;
      }

      // Tokens are stored in httpOnly cookies by backend
      // We only need to store user data in Redux
      const userRole = result.data.role as Role;

      dispatch(
        setCredentials({
          user: {
            id: String(result.data.id),
            email: result.data.email,
            name: result.data.name,
            role: userRole,
            phone: result.data.phone || "",
          },
        })
      );

      message.success(result.message || "Login successful!");
      router.push(userRole === Role.ADMIN ? "/admin" : "/");
      router.refresh();
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = 
        error?.data?.message || 
        error?.data?.error || 
        error?.message || 
        "Invalid email or password";
      message.error(errorMessage);
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

        <div suppressHydrationWarning>
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
              <Input prefix={<UserOutlined />} placeholder="Email" suppressHydrationWarning />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" suppressHydrationWarning />
            </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Sign In
            </Button>
          </Form.Item>
          </Form>
        </div>

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

