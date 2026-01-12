"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Avatar,
  App,
  Row,
  Col,
  Divider,
  Tag,
  Spin,
  Tabs,
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  EditOutlined,
  LockOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
  SettingOutlined,
  UploadOutlined,
  DeleteOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { Upload } from "antd";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from "@/store/api/usersApi";
import { useGetMyOrdersQuery } from "@/store/api/ordersApi";
import { useUploadFileMutation } from "@/store/api/filesApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function ProfilePage() {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("overview");
  const [profilePictureUploading, setProfilePictureUploading] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | undefined>(undefined);

  // Fetch latest profile data from API
  const { data: profileData, isLoading: isLoadingProfile } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const [uploadFile] = useUploadFileMutation();

  // Update form when profile data is loaded
  useEffect(() => {
    if (profileData) {
      form.setFieldsValue({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || "",
      });
      // Set profile picture preview if available
      if (profileData.profile_picture) {
        setProfilePicturePreview(profileData.profile_picture);
      }
    } else if (user) {
      // Fallback to Redux user data if API data not available
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
      // Set profile picture preview if available
      if (user.profile_picture) {
        setProfilePicturePreview(user.profile_picture);
      }
    }
  }, [profileData, user, form]);

  const handleSubmit = async (values: any) => {
    try {
      const result = await updateProfile({
        name: values.name,
        email: values.email,
        phone: values.phone,
        profile_picture: profilePicturePreview,
      }).unwrap();

      // Update Redux store with new user data
      if (user) {
        dispatch(
          setCredentials({
            user: { ...user, ...result },
          })
        );
      }

      message.success("Profile updated successfully");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handleProfilePictureUpload = (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }
    // Validate file size (max 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }

    // Upload file
    setProfilePictureUploading(true);
    uploadFile(file)
      .unwrap()
      .then((response) => {
        const imageUrl = response.data?.url || response.data?.fileName;
        if (!imageUrl) {
          throw new Error("Invalid response: missing image URL");
        }
        setProfilePicturePreview(imageUrl);
        // Automatically update profile with new picture
        updateProfile({
          profile_picture: imageUrl,
        })
          .unwrap()
          .then((result) => {
            if (user) {
              dispatch(
                setCredentials({
                  user: { ...user, ...result },
                })
              );
            }
            message.success("Profile picture updated successfully!");
            setProfilePictureUploading(false);
          })
          .catch((error) => {
            message.error(error?.data?.message || "Failed to update profile picture");
            setProfilePictureUploading(false);
          });
      })
      .catch((error) => {
        const errorMessage = error?.data?.message || error?.message || "Failed to upload image";
        message.error(errorMessage);
        setProfilePictureUploading(false);
      });

    return false; // Prevent auto upload
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicturePreview(undefined);
    // Update profile to remove picture
    updateProfile({
      profile_picture: undefined,
    })
      .unwrap()
      .then((result) => {
        if (user) {
          dispatch(
            setCredentials({
              user: { ...user, ...result },
            })
          );
        }
        message.success("Profile picture removed successfully!");
      })
      .catch((error) => {
        message.error(error?.data?.message || "Failed to remove profile picture");
      });
  };

  const accountCreatedAt = profileData?.created_at
    ? dayjs(profileData.created_at)
    : user
      ? dayjs() // Fallback if no date available
      : null;
  const memberSince = accountCreatedAt ? accountCreatedAt.format("MMMM YYYY") : "Recently";
  const accountAge = accountCreatedAt ? accountCreatedAt.fromNow() : "Recently";

  if (isLoadingProfile) {
    return (
      <ProtectedRoute>
        <div className="profile-page">
          <style jsx>{`
            .profile-page {
              min-height: calc(100vh - 64px);
              background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
            }
          `}</style>
          <div style={{ padding: "40px 24px", maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
              <Spin size="large" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="profile-page">
        <style jsx>{`
          .profile-page {
            min-height: calc(100vh - 64px);
            background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          }
          .profile-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 24px;
            position: relative;
            overflow: hidden;
          }
          .profile-hero::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            border-radius: 50%;
          }
          .profile-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 24px;
          }
          .stat-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            padding: 24px;
            border: 1px solid #e8e8e8;
            transition: all 0.3s ease;
            height: 100%;
          }
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }
          .quick-action-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #e8e8e8;
            transition: all 0.3s ease;
            cursor: pointer;
            height: 100%;
            text-align: center;
          }
          .quick-action-card:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
            transform: translateY(-2px);
          }
          .section-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            margin-bottom: 24px;
            overflow: hidden;
            border: 1px solid #e8e8e8;
          }
          .section-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px 24px;
            border-bottom: 2px solid #e8e8e8;
          }
          .section-body {
            padding: 24px;
          }
          .info-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .recent-order-item {
            padding: 16px;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            margin-bottom: 12px;
            transition: all 0.2s;
          }
          .recent-order-item:hover {
            border-color: #667eea;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
          }
          .avatar-container {
            position: relative;
            display: inline-block;
          }
          .avatar-edit-btn {
            position: absolute;
            bottom: 0;
            right: 0;
            background: white;
            border: 2px solid #667eea;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          @media (max-width: 768px) {
            .profile-hero {
              padding: 40px 16px;
            }
            .profile-content {
              padding: 24px 16px;
            }
          }
        `}</style>

        {/* Hero Section */}
        <div className="profile-hero" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                <div className="avatar-container">
                  <Upload
                    name="file"
                    listType="picture-circle"
                    showUploadList={false}
                    beforeUpload={handleProfilePictureUpload}
                    disabled={profilePictureUploading}
                  >
                    <Avatar
                      size={120}
                      src={profilePicturePreview || profileData?.profile_picture || user?.profile_picture}
                      icon={!profilePicturePreview && !profileData?.profile_picture && !user?.profile_picture ? <UserOutlined /> : undefined}
                      style={{
                        background: profilePicturePreview || profileData?.profile_picture || user?.profile_picture 
                          ? "transparent" 
                          : "rgba(255, 255, 255, 0.2)",
                        border: "4px solid white",
                        fontSize: 60,
                        cursor: "pointer",
                      }}
                    />
                  </Upload>
                  {profilePicturePreview || profileData?.profile_picture || user?.profile_picture ? (
                    <div 
                      className="avatar-edit-btn"
                      onClick={handleRemoveProfilePicture}
                      style={{ cursor: "pointer" }}
                    >
                      <DeleteOutlined style={{ color: "#ff4d4f" }} />
                    </div>
                  ) : (
                    <div className="avatar-edit-btn">
                      <CameraOutlined style={{ color: "#667eea" }} />
                    </div>
                  )}
                  {profilePictureUploading && (
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 12,
                      zIndex: 10,
                    }}>
                      Uploading...
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                    {profilePictureUploading ? "Uploading..." : "Click to change photo"}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={16}>
                <Title level={1} style={{ color: "white", margin: 0, marginBottom: 8 }}>
                  {user?.name || "User"}
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block", marginBottom: 4 }}>
                  <MailOutlined style={{ marginRight: 8 }} />
                  {user?.email}
                </Text>
                {user?.phone && (
                  <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block", marginBottom: 4 }}>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    {user.phone}
                  </Text>
                )}
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, display: "block", marginTop: 8 }}>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  Member since {memberSince} • {accountAge}
                </Text>
              </Col>
            </Row>
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            {/* Overview Tab */}
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Overview
                </span>
              }
              key="overview"
            >
              {/* Quick Actions */}
              <div className="section-card">
                <div className="section-header">
                  <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <SettingOutlined /> Quick Actions
                  </Title>
                </div>
                <div className="section-body">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Link href="/orders">
                        <Card className="quick-action-card">
                          <ShoppingOutlined style={{ fontSize: 32, color: "#667eea", marginBottom: 12 }} />
                          <Title level={5} style={{ margin: 0 }}>
                            My Orders
                          </Title>
                          <Text type="secondary">View and track your orders</Text>
                        </Card>
                      </Link>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Link href="/profile/addresses">
                        <Card className="quick-action-card">
                          <HomeOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 12 }} />
                          <Title level={5} style={{ margin: 0 }}>
                            Addresses
                          </Title>
                          <Text type="secondary">Manage shipping addresses</Text>
                        </Card>
                      </Link>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Link href="/profile/change-password">
                        <Card className="quick-action-card">
                          <LockOutlined style={{ fontSize: 32, color: "#faad14", marginBottom: 12 }} />
                          <Title level={5} style={{ margin: 0 }}>
                            Change Password
                          </Title>
                          <Text type="secondary">Update your password</Text>
                        </Card>
                      </Link>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Account Status */}
              <div className="section-card">
                <div className="section-header">
                  <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircleOutlined /> Account Status
                  </Title>
                </div>
                <div className="section-body">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <div className="info-item">
                        <div className="info-icon">
                          <CheckCircleOutlined />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                            Account Status
                          </Text>
                          <Tag color={profileData?.is_active !== false ? "green" : "red"} style={{ marginTop: 4 }}>
                            {profileData?.is_active !== false ? "Active" : "Inactive"}
                          </Tag>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="info-item">
                        <div className="info-icon">
                          <CalendarOutlined />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                            Member Since
                          </Text>
                          <Text strong style={{ display: "block", marginTop: 4 }}>
                            {memberSince}
                          </Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </TabPane>

            {/* Personal Information Tab */}
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Personal Information
                </span>
              }
              key="personal"
            >
              <div className="section-card">
                <div className="section-header">
                  <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <UserOutlined /> Edit Profile
                  </Title>
                </div>
                <div className="section-body">
                  <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[{ required: true, message: "Please enter your name" }]}
                    >
                      <Input size="large" placeholder="Enter your full name" prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
                    >
                      <Input size="large" placeholder="Enter your email" prefix={<MailOutlined />} disabled />
                      <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                        Email cannot be changed
                      </Text>
                    </Form.Item>
                    <Form.Item name="phone" label="Phone Number">
                      <Input size="large" placeholder="Enter your phone number" prefix={<PhoneOutlined />} />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" loading={isUpdating} disabled={isUpdating}>
                        <EditOutlined /> Update Profile
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>

              {/* Account Information */}
              <div className="section-card">
                <div className="section-header">
                  <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <SettingOutlined /> Account Information
                  </Title>
                </div>
                <div className="section-body">
                  <div className="info-item">
                    <div className="info-icon">
                      <MailOutlined />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                        Email Address
                      </Text>
                      <Text strong>{user?.email}</Text>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <CalendarOutlined />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                        Member Since
                      </Text>
                      <Text strong>{memberSince}</Text>
                    </div>
                  </div>
                  {profileData?.last_login && (
                    <div className="info-item">
                      <div className="info-icon">
                        <CheckCircleOutlined />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                          Last Login
                        </Text>
                        <Text strong>{dayjs(profileData.last_login).format("MMMM DD, YYYY [at] hh:mm A")}</Text>
                      </div>
                    </div>
                  )}
                  <div className="info-item">
                    <div className="info-icon">
                      <SafetyOutlined />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                        Account Status
                      </Text>
                      <Tag color={profileData?.is_active !== false ? "green" : "red"}>
                        {profileData?.is_active !== false ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>
            </TabPane>

            {/* Security Tab */}
            <TabPane
              tab={
                <span>
                  <SafetyOutlined />
                  Security
                </span>
              }
              key="security"
            >
              <div className="section-card">
                <div className="section-header">
                  <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <LockOutlined /> Password & Security
                  </Title>
                </div>
                <div className="section-body">
                  <Space orientation="vertical" size="large" style={{ width: "100%" }}>
                    <div>
                      <Text strong style={{ display: "block", marginBottom: 8 }}>
                        Change Password
                      </Text>
                      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                        Update your password to keep your account secure
                      </Text>
                      <Link href="/profile/change-password">
                        <Button type="primary" icon={<LockOutlined />}>
                          Change Password
                        </Button>
                      </Link>
                    </div>
                    <Divider />
                    <div>
                      <Text strong style={{ display: "block", marginBottom: 8 }}>
                        Two-Factor Authentication
                      </Text>
                      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                        Add an extra layer of security to your account
                      </Text>
                      <Button icon={<SafetyOutlined />} disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </Space>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
