"use client";

import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, App, Spin } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useRegisterMutation } from "@/store/api/authApi";
import { Role } from "@/lib/constants";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const [register, { isLoading }] = useRegisterMutation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, user, router]);

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    try {
      const result = await register({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap();

      // Validate response structure
      if (!result.user) {
        message.error("Invalid response from server");
        return;
      }

      // Tokens are stored in httpOnly cookies by backend
      // We only need to store user data in Redux
      const userRole = result.user.role as Role;

      dispatch(
        setCredentials({
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: userRole,
            phone: result.user.phone || "",
          },
        })
      );

      message.success("Registration successful!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = 
        error?.data?.message || 
        error?.data?.error || 
        error?.message || 
        "Registration failed. Please try again.";
      message.error(errorMessage);
    }
  };

  // Show loading while checking auth state or redirecting
  if (!mounted || (mounted && isAuthenticated && user)) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--color-primary) 0%, #52c41a 100%)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

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
          <Title level={2}>Create Account</Title>
          <Text type="secondary">Sign up to get started</Text>
        </div>

        <div suppressHydrationWarning>
          <Form
            name="register"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                Sign Up
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary">
            Already have an account? <Link href="/login">Sign in</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

