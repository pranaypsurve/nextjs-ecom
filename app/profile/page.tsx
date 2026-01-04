"use client";

import { useEffect, useCallback, useRef } from "react";
import { Card, Form, Input, Button, Typography, Space, Avatar, App, Divider, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useGetMyProfileQuery, useUpdateMyProfileMutation, useChangePasswordMutation } from "@/store/api/usersApi";

const { Title } = Typography;

export default function ProfilePage() {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  // Fetch latest profile data from API
  const { data: profileData, isLoading: isLoadingProfile } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // Update form when profile data is loaded
  useEffect(() => {
    if (profileData) {
      form.setFieldsValue({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || "",
      });
    } else if (user) {
      // Fallback to Redux user data if API data not available
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [profileData, user, form]);

  const handleSubmit = async (values: any) => {
    console.log('values values',values);
    try {
      const result = await updateProfile({
        name: values.name,
        email: values.email,
        phone: values.phone,
      }).unwrap();
      
      // Update Redux store with new user data

      console.log('user',user,result);
      if (user && token) {
        dispatch(setCredentials({
          user: { ...user, ...result },
          token: token, // Keep existing token
        }));
      }
      
      message.success("Profile updated successfully");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      
      message.success("Password changed successfully");
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to change password");
    }
  };

  if (isLoadingProfile) {
    return (
      <ProtectedRoute>
        <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <Spin size="large" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter your name" }]}>
              <Input placeholder="Enter your full name" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="Enter your phone number" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isUpdating} disabled={isUpdating}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>

          <Divider>Change Password</Divider>

          <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: "Please enter your current password" }]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter a new password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password placeholder="Enter new password" />
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
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isChangingPassword} disabled={isChangingPassword}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

