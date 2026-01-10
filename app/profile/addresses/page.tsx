"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Empty,
  Popconfirm,
  App,
  Row,
  Col,
  Tag,
  Divider,
  Select,
  Spin,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import {
  useGetShippingAddressesQuery,
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation,
  useDeleteShippingAddressMutation,
  useSetDefaultShippingAddressMutation,
  type ShippingAddress,
} from "@/store/api/shippingAddressesApi";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AddressesPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [form] = Form.useForm();

  // API hooks
  const { data: addresses = [], isLoading, refetch } = useGetShippingAddressesQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateShippingAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateShippingAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteShippingAddressMutation();
  const [setDefaultAddress] = useSetDefaultShippingAddressMutation();

  const handleAdd = () => {
    setEditingAddress(null);
    form.resetFields();
    form.setFieldsValue({
      address_type: "home",
      is_default: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (address: ShippingAddress) => {
    setEditingAddress(address);
    form.setFieldsValue({
      first_name: address.first_name,
      last_name: address.last_name,
      email: address.email,
      phone: address.phone,
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      address_type: address.address_type,
      is_default: address.is_default,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress(id).unwrap();
      message.success("Address deleted successfully");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id).unwrap();
      message.success("Default address updated");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to set default address");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Set label based on address_type: "home" -> "Home", "work" -> "Work", "other" -> use custom label or "Other"
      const label =
        values.address_type === "home"
          ? "Home"
          : values.address_type === "work"
            ? "Work"
            : values.label || "Other";

      if (editingAddress) {
        await updateAddress({
          id: editingAddress.id,
          data: {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone,
            street_address: values.street_address,
            city: values.city,
            state: values.state,
            zip_code: values.zip_code,
            country: values.country,
            address_type: values.address_type,
            label: label,
            is_default: values.is_default,
          },
        }).unwrap();
        message.success("Address updated successfully");
      } else {
        await createAddress({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          street_address: values.street_address,
          city: values.city,
          state: values.state,
          zip_code: values.zip_code,
          country: values.country,
          address_type: values.address_type,
          label: label,
          is_default: values.is_default || false,
        }).unwrap();
        message.success("Address added successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to save address");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="addresses-page">
          <style jsx>{`
            .addresses-page {
              min-height: calc(100vh - 64px);
              background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
            }
          `}</style>
          <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="addresses-page">
        <style jsx>{`
          .addresses-page {
            min-height: calc(100vh - 64px);
            background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          }
          .addresses-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 24px;
            position: relative;
            overflow: hidden;
          }
          .addresses-hero::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            border-radius: 50%;
          }
          .addresses-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 24px;
          }
          .address-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            padding: 24px;
            border: 2px solid #e8e8e8;
            transition: all 0.3s ease;
            height: 100%;
            position: relative;
          }
          .address-card:hover {
            border-color: #667eea;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
            transform: translateY(-4px);
          }
          .address-card.default {
            border-color: #667eea;
            background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          }
          .address-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }
          .address-type {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .address-actions {
            display: flex;
            gap: 8px;
          }
          .address-body {
            margin-bottom: 16px;
          }
          .address-line {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            color: #595959;
          }
          .address-line:last-child {
            margin-bottom: 0;
          }
          .section-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            padding: 24px;
            border: 1px solid #e8e8e8;
          }
          .empty-state {
            text-align: center;
            padding: 60px 24px;
          }
          .empty-icon {
            font-size: 80px;
            color: #d9d9d9;
            margin-bottom: 24px;
          }
          @media (max-width: 768px) {
            .addresses-hero {
              padding: 30px 16px;
            }
            .addresses-content {
              padding: 24px 16px;
            }
            .address-actions {
              flex-direction: column;
            }
          }
        `}</style>

        {/* Hero Section */}
        <div className="addresses-hero" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>
            <Link href="/profile">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                style={{ color: "white", marginBottom: 16 }}
              >
                Back to Profile
              </Button>
            </Link>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <Title level={1} style={{ color: "white", margin: 0, marginBottom: 8 }}>
                  <HomeOutlined style={{ marginRight: 12 }} />
                  Manage Addresses
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
                  Add, edit, or remove your shipping addresses
                </Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{
                  background: "white",
                  color: "#667eea",
                  border: "none",
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Add New Address
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="addresses-content">
          {addresses.length === 0 ? (
            <div className="section-card">
              <div className="empty-state">
                <HomeOutlined className="empty-icon" />
                <Title level={3} style={{ color: "#8c8c8c", marginBottom: 16 }}>
                  No addresses saved
                </Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 32 }}>
                  Add your first address to get started with faster checkout
                </Text>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAdd}>
                  Add Your First Address
                </Button>
              </div>
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {addresses.map((address) => (
                <Col xs={24} sm={12} lg={8} key={address.id}>
                  <Card className={`address-card ${address.is_default ? "default" : ""}`}>
                    <div className="address-header">
                      <div className="address-type">
                        <HomeOutlined style={{ color: "#667eea", fontSize: 20 }} />
                        <Title level={5} style={{ margin: 0 }}>
                          {address.label ||
                            (address.address_type === "home"
                              ? "Home"
                              : address.address_type === "work"
                                ? "Work"
                                : "Other")}
                        </Title>
                        {address.is_default && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            Default
                          </Tag>
                        )}
                      </div>
                      <div className="address-actions">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(address)}
                          style={{ color: "#667eea" }}
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete address?"
                          description="Are you sure you want to remove this address?"
                          onConfirm={() => handleDelete(address.id)}
                          okText="Yes"
                          cancelText="No"
                          okButtonProps={{ danger: true }}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} loading={isDeleting}>
                            Delete
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>

                    <div className="address-body">
                      <div className="address-line">
                        <Text strong style={{ fontSize: 16 }}>
                          {address.first_name} {address.last_name}
                        </Text>
                      </div>
                      <div className="address-line">
                        <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                        <Text>{address.street_address}</Text>
                      </div>
                      <div className="address-line">
                        <Text>
                          {address.city}, {address.state} {address.zip_code}
                        </Text>
                      </div>
                      <div className="address-line">
                        <Text>{address.country}</Text>
                      </div>
                      <Divider style={{ margin: "12px 0" }} />
                      <div className="address-line">
                        <PhoneOutlined style={{ color: "#8c8c8c" }} />
                        <Text>{address.phone}</Text>
                      </div>
                      <div className="address-line">
                        <MailOutlined style={{ color: "#8c8c8c" }} />
                        <Text>{address.email}</Text>
                      </div>
                    </div>

                    {!address.is_default && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleSetDefault(address.id)}
                        style={{ padding: 0 }}
                      >
                        Set as Default
                      </Button>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Add Address Button (when addresses exist) */}
          {addresses.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Button
                type="dashed"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ height: 48, fontSize: 16 }}
              >
                Add Another Address
              </Button>
            </div>
          )}
        </div>

        {/* Add/Edit Address Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HomeOutlined style={{ color: "#667eea" }} />
              <span>{editingAddress ? "Edit Address" : "Add New Address"}</span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
          styles={{
            body: { padding: "24px" },
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="address_type"
              label="Address Type"
              rules={[{ required: true, message: "Please select address type" }]}
            >
              <Select placeholder="Select address type" size="large">
                <Option value="home">Home</Option>
                <Option value="work">Work</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            {form.getFieldValue("address_type") === "other" && (
              <Form.Item
                name="label"
                label="Label"
                rules={[{ required: true, message: "Please enter a label for this address" }]}
              >
                <Input size="large" placeholder="e.g., Vacation Home, Friend's Place" />
              </Form.Item>
            )}

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: "Please enter first name" }]}
                >
                  <Input size="large" placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={[{ required: true, message: "Please enter last name" }]}
                >
                  <Input size="large" placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input size="large" placeholder="Email Address" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input size="large" placeholder="Phone Number" />
            </Form.Item>

            <Form.Item
              name="street_address"
              label="Street Address"
              rules={[{ required: true, message: "Please enter street address" }]}
            >
              <Input size="large" placeholder="Street Address" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="city" label="City" rules={[{ required: true, message: "Please enter city" }]}>
                  <Input size="large" placeholder="City" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="state" label="State" rules={[{ required: true, message: "Please enter state" }]}>
                  <Input size="large" placeholder="State" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="zip_code"
                  label="Zip Code"
                  rules={[{ required: true, message: "Please enter zip code" }]}
                >
                  <Input size="large" placeholder="Zip Code" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="country"
                  label="Country"
                  rules={[{ required: true, message: "Please enter country" }]}
                  initialValue="India"
                >
                  <Input size="large" placeholder="Country" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="is_default" valuePropName="checked">
              <Checkbox>Set as default address</Checkbox>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isCreating || isUpdating}
                  style={{ minWidth: 120 }}
                >
                  {editingAddress ? "Update Address" : "Add Address"}
                </Button>
                <Button size="large" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
