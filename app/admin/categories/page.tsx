"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  App,
  Space,
  Typography,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Image as AntImage,
  Select,
  Tabs,
  Divider,
  Upload,
  Badge,
  Tooltip,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  UploadOutlined,
  PictureOutlined,
  AppstoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  useGetCategoriesAdminQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type CategoryResponse,
} from "@/store/api/categoriesApi";

const { Title, Text } = Typography;
const { TextArea, Search } = Input;

type TabKey = "categories" | "subcategories";

export default function AdminCategoriesPage() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<TabKey>("categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // API hooks
  const { data: categories = [], isLoading, refetch } = useGetCategoriesAdminQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Separate categories and subcategories
  const mainCategories = useMemo(() => {
    return categories.filter((cat) => !cat.parentId);
  }, [categories]);

  const subCategories = useMemo(() => {
    return categories.filter((cat) => cat.parentId);
  }, [categories]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCategories = mainCategories.length;
    const activeCategories = mainCategories.filter((c) => c.is_active !== false).length;
    const totalSubCategories = subCategories.length;
    const activeSubCategories = subCategories.filter((c) => c.is_active !== false).length;
    return {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      totalSubCategories,
      activeSubCategories,
      inactiveSubCategories: totalSubCategories - activeSubCategories,
    };
  }, [mainCategories, subCategories]);

  // Filter based on active tab
  const filteredData = useMemo(() => {
    const dataSource = activeTab === "categories" ? mainCategories : subCategories;
    return dataSource.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.slug?.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active !== false) ||
        (statusFilter === "inactive" && item.is_active === false);

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, mainCategories, subCategories, searchText, statusFilter]);

  const handleAdd = () => {
    // Check if trying to add subcategory without any main categories
    if (activeTab === "subcategories" && mainCategories.length === 0) {
      message.warning("Please create at least one main category before adding subcategories");
      return;
    }

    setEditingCategory(null);
    setImageUrl("");
    form.resetFields();
    // Set initial values based on tab
    if (activeTab === "categories") {
      // For main categories, parentId should be null
      form.setFieldsValue({ 
        is_active: true,
        parentId: null 
      });
    } else {
      // For subcategories, don't set parentId - let user select from dropdown
      // Just set default for is_active
      form.setFieldsValue({ 
        is_active: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    setImageUrl(category.image || "");
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      image: category.image,
      is_active: category.is_active !== false,
      parentId: category.parentId || null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteCategory(id).unwrap();
      message.success(activeTab === "categories" ? "Category deleted successfully" : "Subcategory deleted successfully");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete";
      message.error(errorMessage);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log("Form values:", values);
      console.log("Active tab:", activeTab);
      
      // Handle parentId based on tab
      let parentId = null;
      
      if (activeTab === "subcategories") {
        if (!values.parentId) {
          message.error("Please select a parent category for the subcategory");
          return;
        }
        // Use parentId as-is (can be string or number depending on API)
        parentId = values.parentId;
      }

      const categoryData = {
        name: values.name,
        description: values.description,
        image: values.image,
        is_active: values.is_active !== false,
        parentId: parentId,
      };

      console.log("Submitting category data:", categoryData);

      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          data: categoryData,
        }).unwrap();
        message.success(activeTab === "categories" ? "Category updated successfully" : "Subcategory updated successfully");
      } else {
        await createCategory(categoryData).unwrap();
        message.success(activeTab === "categories" ? "Category created successfully" : "Subcategory created successfully");
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingCategory(null);
      refetch();
    } catch (error: any) {
      console.error("Submit error:", error);
      const errorMessage = error?.data?.message || error?.message || "Operation failed";
      message.error(errorMessage);
    }
  };

  // Category columns
  const categoryColumns: ColumnsType<CategoryResponse> = [
    {
      title: "Category",
      key: "category",
      width: 320,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative" }}>
            {record.image ? (
              <AntImage
                src={record.image}
                alt={record.name}
                width={70}
                height={70}
                style={{ objectFit: "cover", borderRadius: 12, border: "2px solid #f0f0f0" }}
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                preview={{
                  mask: <EyeOutlined />,
                }}
              />
            ) : (
              <div
                style={{
                  width: 70,
                  height: 70,
                  background: "linear-gradient(135deg, #667eea20 0%, #764ba220 100%)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #d9d9d9",
                }}
              >
                <FolderOutlined style={{ fontSize: 28, color: "#667eea" }} />
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Text strong style={{ fontSize: 15 }}>
                {record.name}
              </Text>
              {record.is_active !== false && (
                <Badge status="success" />
              )}
            </div>
            {record.slug && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  /{record.slug}
                </Text>
              </div>
            )}
            {record.description && (
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                {record.description.length > 60 ? `${record.description.substring(0, 60)}...` : record.description}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Subcategories",
      key: "subcategories",
      width: 160,
      align: "center",
      render: (_, record) => {
        const subCount = subCategories.filter((sub) => String(sub.parentId) === String(record.id)).length;
        return subCount > 0 ? (
          <Tooltip title={`View ${subCount} subcategories`}>
            <Badge count={subCount} showZero style={{ backgroundColor: "#667eea" }}>
              <Button
                type="text"
                icon={<FolderOpenOutlined style={{ fontSize: 20, color: "#667eea" }} />}
                onClick={() => setActiveTab("subcategories")}
              />
            </Badge>
          </Tooltip>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>None</Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 110,
      align: "center",
      render: (isActive: boolean | undefined) => (
        <Tag 
          color={isActive !== false ? "success" : "error"}
          style={{ 
            borderRadius: 8, 
            fontWeight: 500,
            padding: "4px 12px"
          }}
        >
          {isActive !== false ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="primary"
              ghost
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
              size="middle"
              style={{ borderRadius: 8 }}
            >
              Edit
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete category?"
            description={
              <div>
                <p style={{ margin: 0 }}>This will also delete all subcategories.</p>
                <p style={{ margin: 0, fontWeight: 600 }}>Are you sure?</p>
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            disabled={isDeleting}
            okText="Yes, delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                loading={isDeleting} 
                size="middle"
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Subcategory columns
  const subcategoryColumns: ColumnsType<CategoryResponse> = [
    {
      title: "Subcategory",
      key: "subcategory",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {record.image ? (
            <AntImage
              src={record.image}
              alt={record.name}
              width={60}
              height={60}
              style={{ objectFit: "cover", borderRadius: 10, border: "2px solid #f0f0f0" }}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
              preview={{
                mask: <EyeOutlined />,
              }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                background: "linear-gradient(135deg, #13c2c220 0%, #52c41a20 100%)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #d9d9d9",
              }}
            >
              <FolderOpenOutlined style={{ fontSize: 24, color: "#13c2c2" }} />
            </div>
          )}
          <div>
            <Text strong style={{ fontSize: 14, display: "block" }}>
              {record.name}
            </Text>
            {record.slug && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                /{record.slug}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Parent Category",
      key: "parent",
      width: 180,
      render: (_, record) => {
        const parent = mainCategories.find((c) => String(c.id) === String(record.parentId));
        return parent ? (
          <Tag 
            color="processing" 
            icon={<FolderOutlined />}
            style={{ 
              borderRadius: 8, 
              padding: "4px 12px",
              fontSize: 13
            }}
          >
            {parent.name}
          </Tag>
        ) : (
          <Text type="secondary">N/A</Text>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string) => desc ? (
        <Text style={{ fontSize: 13 }}>{desc}</Text>
      ) : (
        <Text type="secondary" style={{ fontSize: 13 }}>No description</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 110,
      align: "center",
      render: (isActive: boolean | undefined) => (
        <Tag 
          color={isActive !== false ? "success" : "error"}
          style={{ 
            borderRadius: 8, 
            fontWeight: 500,
            padding: "4px 12px"
          }}
        >
          {isActive !== false ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="primary"
              ghost
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
              size="middle"
              style={{ borderRadius: 8 }}
            >
              Edit
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete subcategory?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            disabled={isDeleting}
            okText="Yes, delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                loading={isDeleting} 
                size="middle"
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "categories",
      label: (
        <Space>
          <FolderOutlined />
          <span>Categories</span>
          <Tag color="blue" style={{ margin: 0 }}>
            {stats.totalCategories}
          </Tag>
        </Space>
      ),
      children: null,
    },
    {
      key: "subcategories",
      label: (
        <Space>
          <FolderOpenOutlined />
          <span>Subcategories</span>
          <Tag color="green" style={{ margin: 0 }}>
            {stats.totalSubCategories}
          </Tag>
        </Space>
      ),
      children: null,
    },
  ];

  return (
      <div className="admin-page">
        <style jsx>{`
          .admin-page {
            padding: 24px;
            max-width: 1600px;
            margin: 0 auto;
          }

          .page-header {
            margin-bottom: 32px;
            padding: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          }

          .page-header h1 {
            color: white;
            margin: 0;
            font-size: 32px;
            font-weight: 700;
          }

          .stats-row {
            margin-bottom: 24px;
          }

          .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            height: 100%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #f0f0f0;
          }

          .filters-section {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .table-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .tabs-container {
            background: white;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 24px;
          }

          @media (max-width: 768px) {
            .admin-page {
              padding: 16px;
            }

            .page-header {
              padding: 16px;
            }
          }
        `}</style>
        <style jsx global>{`
          .table-row-light {
            background-color: #ffffff;
          }
          .table-row-dark {
            background-color: #fafafa;
          }
          .ant-table-row:hover > td {
            background-color: #f0f5ff !important;
          }
        `}</style>

        {/* Header */}
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <Title level={1} style={{ color: "white", margin: 0 }}>
                Category Management
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block", marginTop: 8 }}>
                Organize your products with categories and subcategories
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
              Add {activeTab === "categories" ? "Category" : "Subcategory"}
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Total Categories"
                value={stats.totalCategories}
                prefix={<FolderOutlined />}
                styles={{ content: { color: "#667eea" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Active Categories"
                value={stats.activeCategories}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Total Subcategories"
                value={stats.totalSubCategories}
                prefix={<FolderOpenOutlined />}
                styles={{ content: { color: "#13c2c2" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Active Subcategories"
                value={stats.activeSubCategories}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </div>
          </Col>
        </Row>

        {/* Tabs */}
        <div className="tabs-container">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key as TabKey);
              setSearchText("");
              setStatusFilter("all");
            }}
            items={tabItems}
            size="large"
            style={{ padding: "0 24px" }}
          />
        </div>

        {/* Filters */}
        <div className="filters-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12}>
              <Search
                placeholder={`Search ${activeTab === "categories" ? "categories" : "subcategories"} by name, slug, or description`}
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Select
                placeholder="Filter by Status"
                size="large"
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="table-section">
          <Table
            columns={activeTab === "categories" ? categoryColumns : subcategoryColumns}
            dataSource={filteredData}
            rowKey={(record) => String(record.id)}
            loading={isLoading}
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) => (
                <Text strong style={{ fontSize: 14 }}>
                  Total {total} {activeTab === "categories" ? "categories" : "subcategories"}
                </Text>
              ),
            }}
            locale={{
              emptyText: (
                <Empty
                  image={<AppstoreOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
                  styles={{ image: { height: 80 } }}
                  description={
                    <div style={{ padding: "24px 0" }}>
                      <Title level={4} style={{ color: "#8c8c8c", marginBottom: 8 }}>
                        No {activeTab === "categories" ? "categories" : "subcategories"} found
                      </Title>
                      <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 24 }}>
                        {searchText || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : `Get started by creating your first ${activeTab === "categories" ? "category" : "subcategory"}`
                        }
                      </Text>
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<PlusOutlined />} 
                        onClick={handleAdd}
                        style={{
                          borderRadius: 10,
                          height: 48,
                          padding: "0 32px",
                          fontSize: 15,
                          fontWeight: 600,
                          background: activeTab === "categories" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "linear-gradient(135deg, #13c2c2 0%, #52c41a 100%)",
                          border: "none",
                        }}
                      >
                        Add {activeTab === "categories" ? "Category" : "Subcategory"}
                      </Button>
                    </div>
                  }
                />
              ),
            }}
            rowClassName={(record, index) => index % 2 === 0 ? "table-row-light" : "table-row-dark"}
          />
        </div>

        {/* Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: activeTab === "categories" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "linear-gradient(135deg, #13c2c2 0%, #52c41a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {activeTab === "categories" ? <FolderOutlined style={{ fontSize: 24, color: "white" }} /> : <FolderOpenOutlined style={{ fontSize: 24, color: "white" }} />}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                  {editingCategory ? `Edit ${activeTab === "categories" ? "Category" : "Subcategory"}` : `Add New ${activeTab === "categories" ? "Category" : "Subcategory"}`}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                  {editingCategory ? "Update the details below" : "Fill in the details below"}
                </div>
              </div>
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setImageUrl("");
            form.resetFields();
          }}
          footer={null}
          width={680}
          styles={{
            body: { paddingTop: 24 }
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {activeTab === "subcategories" && (
              <Form.Item
                name="parentId"
                label={
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    <FolderOutlined style={{ marginRight: 6 }} />
                    Parent Category
                  </span>
                }
                rules={[{ required: true, message: "Please select a parent category" }]}
                help={mainCategories.length === 0 ? "Please create a main category first" : undefined}
              >
                <Select
                  size="large"
                  placeholder={mainCategories.length === 0 ? "No parent categories available" : "Select parent category"}
                  showSearch
                  disabled={mainCategories.length === 0}
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const label = option?.label;
                    if (typeof label === "string") {
                      return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                  style={{ borderRadius: 8 }}
                >
                  {mainCategories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id} label={cat.name}>
                      <Space>
                        <FolderOutlined style={{ color: "#667eea" }} />
                        <span>{cat.name}</span>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item 
              name="name" 
              label={
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  <FileTextOutlined style={{ marginRight: 6 }} />
                  {activeTab === "categories" ? "Category" : "Subcategory"} Name
                </span>
              }
              rules={[{ required: true, message: `Please enter ${activeTab === "categories" ? "category" : "subcategory"} name` }]}
            >
              <Input 
                size="large" 
                placeholder={`e.g., Electronics, Clothing, etc.`}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            
            <Form.Item 
              name="description" 
              label={
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  <FileTextOutlined style={{ marginRight: 6 }} />
                  Description
                </span>
              }
            >
              <TextArea 
                rows={4} 
                placeholder="Enter a detailed description"
                style={{ borderRadius: 8 }}
                showCount
                maxLength={500}
              />
            </Form.Item>
            
            <Form.Item 
              label={
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  <PictureOutlined style={{ marginRight: 6 }} />
                  Category Image
                </span>
              }
            >
              <div style={{ 
                border: "2px dashed #d9d9d9", 
                borderRadius: 12, 
                padding: 24, 
                background: "#fafafa",
                textAlign: "center"
              }}>
                {imageUrl ? (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <AntImage
                      src={imageUrl}
                      alt="Category"
                      width={200}
                      height={200}
                      style={{ objectFit: "cover", borderRadius: 12 }}
                      preview={{
                        mask: <EyeOutlined />,
                      }}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setImageUrl("");
                        form.setFieldsValue({ image: "" });
                      }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        borderRadius: 8,
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <PictureOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                    <Form.Item name="image" noStyle>
                      <Input 
                        size="large" 
                        placeholder="https://example.com/image.jpg"
                        style={{ borderRadius: 8, marginTop: 12 }}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </Form.Item>
                    <Text type="secondary" style={{ display: "block", marginTop: 12, fontSize: 13 }}>
                      Enter image URL or paste image link
                    </Text>
                  </div>
                )}
              </div>
            </Form.Item>
            
            <Form.Item 
              name="is_active" 
              label={
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  <CheckCircleOutlined style={{ marginRight: 6 }} />
                  Status
                </span>
              }
              valuePropName="checked" 
              initialValue={true}
            >
              <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive"
                style={{ width: 100 }}
              />
            </Form.Item>
            
            <Divider style={{ margin: "24px 0" }} />
            
            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <Button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setImageUrl("");
                    form.resetFields();
                  }} 
                  size="large"
                  style={{ 
                    borderRadius: 8,
                    minWidth: 100
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                  size="large"
                  icon={editingCategory ? <CheckCircleOutlined /> : <PlusOutlined />}
                  style={{ 
                    borderRadius: 8,
                    minWidth: 140,
                    background: activeTab === "categories" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "linear-gradient(135deg, #13c2c2 0%, #52c41a 100%)",
                    border: "none",
                  }}
                >
                  {editingCategory ? "Update" : "Create"} {activeTab === "categories" ? "Category" : "Subcategory"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
}
