"use client";

import { Card, Form, Input, Button, Typography, App, Space, Alert, Divider } from "antd";
import {
  LockOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useChangePasswordMutation } from "@/store/api/usersApi";

const { Title, Text } = Typography;

export default function ChangePasswordPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();

      message.success("Password changed successfully");
      form.resetFields();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to change password. Please check your current password.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="change-password-page">
        <style jsx>{`
          .change-password-page {
            min-height: calc(100vh - 64px);
            background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          }
          .password-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 24px;
            position: relative;
            overflow: hidden;
          }
          .password-hero::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            border-radius: 50%;
          }
          .password-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 24px;
          }
          .password-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            padding: 32px;
            border: 1px solid #e8e8e8;
          }
          .security-tips {
            background: #f0f7ff;
            border: 1px solid #91d5ff;
            border-radius: 12px;
            padding: 20px;
            margin-top: 24px;
          }
          .tip-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
          }
          .tip-item:last-child {
            margin-bottom: 0;
          }
          .tip-icon {
            color: #1890ff;
            margin-top: 4px;
          }
          .password-strength {
            margin-top: 8px;
          }
          .strength-bar {
            height: 4px;
            border-radius: 2px;
            margin-top: 8px;
            transition: all 0.3s;
          }
          .strength-weak {
            background: #ff4d4f;
            width: 33%;
          }
          .strength-medium {
            background: #faad14;
            width: 66%;
          }
          .strength-strong {
            background: #52c41a;
            width: 100%;
          }
          @media (max-width: 768px) {
            .password-hero {
              padding: 30px 16px;
            }
            .password-content {
              padding: 24px 16px;
            }
            .password-card {
              padding: 24px;
            }
          }
        `}</style>

        {/* Hero Section */}
        <div className="password-hero" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 2 }}>
            <Link href="/profile">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                style={{ color: "white", marginBottom: 16 }}
              >
                Back to Profile
              </Button>
            </Link>
            <div>
              <Title level={1} style={{ color: "white", margin: 0, marginBottom: 8 }}>
                <LockOutlined style={{ marginRight: 12 }} />
                Change Password
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
                Update your password to keep your account secure
              </Text>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="password-content">
          <Card className="password-card">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <SafetyOutlined style={{ fontSize: 40, color: "white" }} />
              </div>
              <Title level={3} style={{ marginBottom: 8 }}>
                Secure Your Account
              </Title>
              <Text type="secondary">Enter your current password and choose a new one</Text>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: "Please enter your current password" }]}
              >
                <Input.Password
                  placeholder="Enter your current password"
                  prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Divider />

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: "Please enter a new password" },
                  { min: 8, message: "Password must be at least 8 characters" },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: "Password must contain uppercase, lowercase, and number",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder="Enter new password"
                  prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your new password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder="Confirm new password"
                  prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={isLoading}
                  disabled={isLoading}
                  style={{
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  <LockOutlined /> Change Password
                </Button>
              </Form.Item>
            </Form>

            {/* Security Tips */}
            <div className="security-tips">
              <Title level={5} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <SafetyOutlined style={{ color: "#1890ff" }} />
                Password Security Tips
              </Title>
              <div className="tip-item">
                <CheckCircleOutlined className="tip-icon" />
                <div>
                  <Text strong style={{ display: "block", marginBottom: 4 }}>
                    Use a strong password
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Include uppercase, lowercase, numbers, and special characters
                  </Text>
                </div>
              </div>
              <div className="tip-item">
                <CheckCircleOutlined className="tip-icon" />
                <div>
                  <Text strong style={{ display: "block", marginBottom: 4 }}>
                    Make it unique
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Don't reuse passwords from other accounts
                  </Text>
                </div>
              </div>
              <div className="tip-item">
                <CheckCircleOutlined className="tip-icon" />
                <div>
                  <Text strong style={{ display: "block", marginBottom: 4 }}>
                    Keep it private
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Never share your password with anyone
                  </Text>
                </div>
              </div>
              <div className="tip-item">
                <CheckCircleOutlined className="tip-icon" />
                <div>
                  <Text strong style={{ display: "block", marginBottom: 4 }}>
                    Update regularly
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Change your password periodically for better security
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
