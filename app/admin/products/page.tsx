"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  App,
  Space,
  Typography,
  Popconfirm,
  Tag,
  Select,
  Row,
  Col,
  Statistic,
  Image,
  Radio,
  Upload,
  message as antdMessage,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ProductOutlined,
  ShoppingOutlined,
  WarningOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useGetProductsAdminQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  type ProductAdminResponse,
  type CreateProductRequest,
  type UpdateProductRequest,
} from "@/store/api/productsApi";
import { useGetCategoriesAdminQuery } from "@/store/api/categoriesApi";
import {
  useUploadFileMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
} from "@/store/api/filesApi";
import { formatCurrency } from "@/lib/utils/currency";
import { generateSlug } from "@/lib/utils/productHelpers";

const { Title, Text } = Typography;
const { TextArea, Search } = Input;

export default function AdminProductsPage() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductAdminResponse | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // API hooks
  const { data: products = [], isLoading, refetch } = useGetProductsAdminQuery();
  const { data: categories = [] } = useGetCategoriesAdminQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  
  // File upload hooks
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [updateFile] = useUpdateFileMutation();
  const [deleteFile] = useDeleteFileMutation();
  
  // Upload states
  const [imagesUploading, setImagesUploading] = useState<boolean[]>([]);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(undefined);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const inactive = products.filter((p) => p.status === "inactive").length;
    const lowStock = products.filter((p) => {
      const stock = p.inventory || 0;
      return stock > 0 && stock <= p.low_stock_threshold;
    }).length;
    const outOfStock = products.filter((p) => p.inventory === 0).length;
    return { total, active, inactive, lowStock, outOfStock };
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchText ||
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.slug?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchText.toLowerCase());

      const stock = product.inventory || 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.status === "active") ||
        (statusFilter === "inactive" && product.status === "inactive") ||
        (statusFilter === "low_stock" && stock > 0 && stock <= product.low_stock_threshold) ||
        (statusFilter === "out_of_stock" && stock === 0);

      const matchesCategory = categoryFilter === "all" || String(product.categoryId) === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchText, statusFilter, categoryFilter]);

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setImagesPreview([]);
    setThumbnailPreview(undefined);
    // Set default values
    form.setFieldsValue({
      images: [],
      is_on_sale: false,
      is_featured: false,
      is_returnable: true,
      status: "active",
      low_stock_threshold: 10,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product: ProductAdminResponse) => {
    setEditingProduct(product);
    
    // Handle images: prefer images array, fallback to image string, or empty array
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : product.image 
        ? [product.image] 
        : [];
    
    const formValues = {
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      inventory: product.inventory,
      low_stock_threshold: product.low_stock_threshold,
      color: product.color,
      material: product.material,
      images: productImages,
      thumbnail: product.thumbnail,
      weight: product.weight,
      tags: product.tags?.join(", "), // Convert array to comma-separated string
      is_on_sale: product.is_on_sale,
      is_featured: product.is_featured,
      is_returnable: product.is_returnable,
      status: product.status,
      categoryId: product.categoryId,
    };
    
    form.setFieldsValue(formValues);
    setImagesPreview(productImages);
    setThumbnailPreview(product.thumbnail);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteProduct(String(id)).unwrap();
      message.success("Product deleted successfully");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete product";
      message.error(errorMessage);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Parse tags from comma-separated string to array
      const tags = values.tags 
        ? values.tags.split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];

      // Handle images: ensure it's an array with 2-8 images
      const images = Array.isArray(values.images) 
        ? values.images.filter((img: string) => img && img.trim()) 
        : values.images 
          ? [values.images].filter((img: string) => img && img.trim())
          : [];
      
      // Validate images count (2-8)
      if (images.length < 2) {
        message.warning("Please upload at least 2 product images");
        return;
      }
      if (images.length > 8) {
        message.warning("Maximum 8 product images allowed");
        return;
      }

      const productData: CreateProductRequest = {
        name: values.name,
        slug: values.slug || generateSlug(values.name),
        sku: values.sku,
        description: values.description,
        price: Number(values.price),
        discount_price: values.discount_price ? Number(values.discount_price) : undefined,
        inventory: Number(values.inventory),
        low_stock_threshold: values.low_stock_threshold || 10,
        color: values.color ? (typeof values.color === 'string' ? values.color : values.color.toHexString?.() || '#000000') : undefined,
        material: values.material,
        images: images.length > 0 ? images : undefined,
        thumbnail: values.thumbnail,
        weight: values.weight ? Number(values.weight) : undefined,
        tags,
        is_on_sale: values.is_on_sale || false,
        is_featured: values.is_featured || false,
        is_returnable: values.is_returnable !== false,
        categoryId: String(values.categoryId),
      };

      if (editingProduct) {
        const updateData: UpdateProductRequest = {
          ...productData,
          status: values.status || "active",
        };
        
        await updateProduct({ id: editingProduct.id, data: updateData }).unwrap();
        message.success(`Product "${values.name}" updated successfully!`);
      } else {
        await createProduct(productData).unwrap();
        message.success(`Product "${values.name}" created successfully!`);
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
      setImagesPreview([]);
      setThumbnailPreview(undefined);
      refetch();
    } catch (error: any) {
      console.error("Error saving product:", error);
      message.error(error?.data?.message || error?.message || "Failed to save product");
    }
  };

  const columns: ColumnsType<ProductAdminResponse> = [
    {
      title: "Product",
      key: "product",
      width: 300,
      render: (_, record) => (
        <Space>
          {record.thumbnail || record.image ? (
            <Image
              src={record.thumbnail || record.image}
              alt={record.name}
              width={60}
              height={60}
              style={{ objectFit: "cover", borderRadius: 8 }}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                background: "#f0f0f0",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ProductOutlined style={{ fontSize: 24, color: "#999" }} />
            </div>
          )}
          <div>
            <Text strong style={{ display: "block" }}>
              {record.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              SKU: {record.sku}
            </Text>
            {record.is_on_sale && (
              <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>
                ON SALE
              </Tag>
            )}
            {record.is_featured && (
              <Tag color="gold" style={{ fontSize: 10 }}>
                FEATURED
              </Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Price",
      key: "price",
      width: 150,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 16, color: record.is_on_sale ? "#52c41a" : undefined }}>
            {formatCurrency(record.discount_price || record.price)}
          </Text>
          {record.discount_price && (
            <div>
              <Text delete type="secondary" style={{ fontSize: 12 }}>
                {formatCurrency(record.price)}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      key: "stock",
      width: 120,
      render: (_, record) => {
        const isLowStock = record.inventory <= record.low_stock_threshold && record.inventory > 0;
        const color = record.inventory === 0 ? "red" : isLowStock ? "orange" : "green";
        return (
          <div>
            <Tag color={color} style={{ fontSize: 13 }}>
              {record.inventory} units
            </Tag>
            {isLowStock && (
              <div>
                <Text type="warning" style={{ fontSize: 11 }}>
                  Low Stock
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Color",
      key: "color",
      width: 100,
      render: (_, record) => {
        return record.color ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: record.color,
                border: "2px solid #d9d9d9",
              }}
            />
            <Text style={{ fontSize: 11 }}>{record.color}</Text>
          </div>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: "Category",
      key: "category",
      width: 150,
      render: (_, record) => {
        const category = categories.find((c) => String(c.id) === String(record.categoryId));
        return <Tag color="blue">{category?.name || "N/A"}</Tag>;
      },
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, record) => {
        const statusColors: Record<string, string> = {
          active: "green",
          inactive: "orange",
          archived: "red",
        };
        return (
          <Tag color={statusColors[record.status] || "default"}>
            {record.status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
            Edit
          </Button>
          <Popconfirm
            title="Delete product?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            disabled={isDeleting}
          >
            <Button danger icon={<DeleteOutlined />} loading={isDeleting} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
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

          @media (max-width: 768px) {
            .admin-page {
              padding: 16px;
            }

            .page-header {
              padding: 16px;
            }
          }
        `}</style>

        {/* Header */}
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Title level={1} style={{ color: "white", margin: 0 }}>
                Product Management
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block", marginTop: 8 }}>
                Manage your product catalog, inventory, and pricing
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
              Add Product
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Total Products"
                value={stats.total}
                prefix={<ProductOutlined />}
                styles={{ content: { color: "#667eea" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Active Products"
                value={stats.active}
                prefix={<ShoppingOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Low Stock"
                value={stats.lowStock}
                prefix={<WarningOutlined />}
                styles={{ content: { color: "#fa8c16" } }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Out of Stock"
                value={stats.outOfStock}
                prefix={<WarningOutlined />}
                styles={{ content: { color: "#ff4d4f" } }}
              />
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <div className="filters-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search products by name, SKU, or description"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
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
                <Select.Option value="low_stock">Low Stock</Select.Option>
                <Select.Option value="out_of_stock">Out of Stock</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by Category"
                size="large"
                style={{ width: "100%" }}
                value={categoryFilter}
                onChange={setCategoryFilter}
              >
                <Select.Option value="all">All Categories</Select.Option>
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey={(record) => String(record.id)}
            loading={isLoading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} products`,
            }}
          />
        </div>

        {/* Modal */}
        <Modal
          title={
            <div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "#8c8c8c", marginTop: 4 }}>
                Fill in the complete product information
              </div>
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setImagesPreview([]);
            setThumbnailPreview(undefined);
          }}
          footer={null}
          width={900}
          styles={{
            body: { maxHeight: "80vh", overflowY: "auto", padding: "24px" },
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Basic Information */}
            <Title level={5}>Basic Information</Title>
            <Form.Item 
              name="name" 
              label="Product Name" 
              rules={[
                { required: true, message: "Please enter product name" },
                { max: 255, message: "Name must be less than 255 characters" }
              ]}
            >
              <Input size="large" placeholder="e.g., Wireless Headphones" onChange={(e) => {
                // Auto-generate slug from name
                if (!editingProduct) {
                  form.setFieldValue("slug", generateSlug(e.target.value));
                }
              }} />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="slug" 
                  label="Slug" 
                  rules={[
                    { required: true, message: "Please enter slug" },
                    { pattern: /^[a-z0-9-]+$/, message: "Slug must be lowercase, alphanumeric with hyphens only" }
                  ]}
                  tooltip="URL-friendly identifier (auto-generated from name)"
                >
                  <Input size="large" placeholder="wireless-headphones" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="sku" 
                  label="SKU" 
                  rules={[
                    { required: true, message: "SKU is required" },
                    { pattern: /^[A-Z0-9-]+$/, message: "SKU must be uppercase alphanumeric with hyphens" }
                  ]}
                  tooltip="Stock Keeping Unit - Unique identifier"
                >
                  <Input size="large" placeholder="WH-001" style={{ textTransform: 'uppercase' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter product description" }]}
            >
              <TextArea rows={4} placeholder="Enter detailed product description" />
            </Form.Item>
            
            <Form.Item 
              name="categoryId" 
              label="Category" 
              rules={[{ required: true, message: "Please select a category" }]}
              help="Select a specific category or subcategory for this product"
            >
              <Select 
                size="large" 
                placeholder="Select category or subcategory"
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (typeof label === 'string') {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
              >
                {/* Group by parent categories */}
                {categories
                  .filter((cat) => !cat.parentId) // Main categories
                  .map((mainCat) => {
                    // Get subcategories for this main category
                    const subCats = categories.filter(
                      (c) => String(c.parentId) === String(mainCat.id)
                    );
                    
                    // Check if main category has no subcategories (is a LEAF)
                    const isLeaf = subCats.length === 0;
                    
                    if (isLeaf) {
                      // Main category with no children - show as option
                      return (
                        <Select.Option 
                          key={mainCat.id} 
                          value={String(mainCat.id)} 
                          label={mainCat.name}
                        >
                          <div style={{ fontWeight: 600 }}>
                            📁 {mainCat.name}
                          </div>
                        </Select.Option>
                      );
                    } else {
                      // Main category with children - show as group with subcategories
                      return (
                        <Select.OptGroup 
                          key={mainCat.id} 
                          label={
                            <div style={{ 
                              fontWeight: 600, 
                              fontSize: 13,
                              color: '#1890ff',
                              padding: '4px 0'
                            }}>
                              📁 {mainCat.name}
                            </div>
                          }
                        >
                          {subCats.map((subCat) => (
                            <Select.Option 
                              key={subCat.id} 
                              value={String(subCat.id)} 
                              label={`${mainCat.name} > ${subCat.name}`}
                            >
                              <div style={{ paddingLeft: 8 }}>
                                📄 {subCat.name}
                              </div>
                            </Select.Option>
                          ))}
                        </Select.OptGroup>
                      );
                    }
                  })}
              </Select>
            </Form.Item>

            {/* Pricing & Inventory */}
            <Title level={5} style={{ marginTop: 24 }}>Pricing & Inventory</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item 
                  name="price" 
                  label="Price ($)" 
                  rules={[
                    { required: true, message: "Price is required" },
                    { type: 'number', min: 0, message: "Price must be >= 0" }
                  ]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="99.99"
                    min={0}
                    precision={2}
                    prefix="$"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="discount_price" 
                  label="Discount Price ($)"
                  dependencies={['price']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const price = getFieldValue('price');
                        if (!value || value < price) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Discount price must be less than price'));
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="79.99"
                    min={0}
                    precision={2}
                    prefix="$"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="inventory" 
                  label="Inventory" 
                  rules={[
                    { required: true, message: "Inventory is required" },
                    { type: 'number', min: 0, message: "Inventory must be >= 0" }
                  ]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="100"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item 
              name="low_stock_threshold" 
              label="Low Stock Threshold"
              tooltip="Alert when inventory falls below this number"
            >
              <InputNumber
                size="large"
                style={{ width: "100%" }}
                placeholder="10"
                min={0}
              />
            </Form.Item>

            {/* Product Details */}
            <Title level={5} style={{ marginTop: 24 }}>Product Details</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="color" label="Color">
                  <Input size="large" placeholder="e.g., Black, White, Red" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="material" label="Material">
                  <Input size="large" placeholder="e.g., Plastic, Metal, Cotton" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="weight" 
                  label="Weight (kg)"
                  rules={[
                    { type: 'number', min: 0, message: "Weight must be >= 0" }
                  ]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="0.250"
                    min={0}
                    precision={3}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="tags" 
                  label="Tags"
                  tooltip="Comma-separated tags (e.g., electronics, wireless, audio)"
                >
                  <Input size="large" placeholder="electronics, audio, wireless" />
                </Form.Item>
              </Col>
            </Row>

            {/* Images */}
            <Title level={5} style={{ marginTop: 24 }}>Product Images</Title>
            
            {/* Multiple Product Images (2-8) */}
            <Form.Item 
              name="images" 
              label="Product Images (2-8 required)"
              tooltip="Upload 2-8 product images. These will be displayed in the product gallery."
              rules={[
                { required: true, message: "Please upload at least 2 product images" },
                {
                  validator: (_, value) => {
                    const images = Array.isArray(value) ? value.filter((img: string) => img && img.trim()) : [];
                    if (images.length < 2) {
                      return Promise.reject(new Error("At least 2 images are required"));
                    }
                    if (images.length > 8) {
                      return Promise.reject(new Error("Maximum 8 images allowed"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                  {imagesPreview.map((img, index) => (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid #d9d9d9",
                      }}
                    >
                      <img
                        src={img}
                        alt={`Product image ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => {
                          const newImages = [...imagesPreview];
                          newImages.splice(index, 1);
                          setImagesPreview(newImages);
                          form.setFieldValue("images", newImages);
                          // Also update uploading state array
                          const newUploading = [...imagesUploading];
                          newUploading.splice(index, 1);
                          setImagesUploading(newUploading);
                        }}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "rgba(255, 255, 255, 0.9)",
                          padding: 4,
                        }}
                      />
                    </div>
                  ))}
                  {imagesPreview.length < 8 && (
                    <Upload
                      name="file"
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={(file) => {
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
                        
                        // Check if we've reached the limit
                        if (imagesPreview.length >= 8) {
                          message.warning("Maximum 8 images allowed");
                          return false;
                        }
                        
                        // Upload file
                        const uploadIndex = imagesPreview.length;
                        setImagesUploading((prev) => [...prev, true]);
                        uploadFile(file)
                          .unwrap()
                          .then((response) => {
                            const imageUrl = response.data?.url || response.data?.fileName;
                            if (!imageUrl) {
                              throw new Error("Invalid response: missing image URL");
                            }
                            const newImages = [...imagesPreview, imageUrl];
                            setImagesPreview(newImages);
                            form.setFieldValue("images", newImages);
                            message.success("Image uploaded successfully!");
                            setImagesUploading((prev) => {
                              const updated = [...prev];
                              updated[uploadIndex] = false;
                              return updated;
                            });
                          })
                          .catch((error) => {
                            const errorMessage = error?.data?.message || error?.message || "Failed to upload image";
                            message.error(errorMessage);
                            setImagesUploading((prev) => {
                              const updated = [...prev];
                              updated[uploadIndex] = false;
                              return updated;
                            });
                          });
                        
                        return false; // Prevent auto upload
                      }}
                      disabled={imagesUploading.some((loading) => loading)}
                    >
                      {imagesUploading.some((loading) => loading) ? (
                        <div>
                          <div>Uploading...</div>
                        </div>
                      ) : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Add Image</div>
                        </div>
                      )}
                    </Upload>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {imagesPreview.length} / 8 images uploaded {imagesPreview.length < 2 && "(minimum 2 required)"}
                  </Text>
                </div>
                <Input
                  size="large"
                  placeholder="Or enter image URL and press Enter"
                  style={{ marginTop: 12 }}
                  onPressEnter={(e) => {
                    const url = (e.target as HTMLInputElement).value.trim();
                    if (url && imagesPreview.length < 8) {
                      if (!imagesPreview.includes(url)) {
                        const newImages = [...imagesPreview, url];
                        setImagesPreview(newImages);
                        form.setFieldValue("images", newImages);
                        (e.target as HTMLInputElement).value = "";
                        message.success("Image URL added!");
                      } else {
                        message.warning("This image URL is already added");
                      }
                    } else if (imagesPreview.length >= 8) {
                      message.warning("Maximum 8 images allowed");
                    }
                  }}
                />
              </div>
            </Form.Item>

            {/* Thumbnail Image (Single) */}
            <Form.Item 
              name="thumbnail" 
              label="Thumbnail Image"
              tooltip="Upload a single thumbnail image for product display (recommended: 300x300px)"
            >
              <Space orientation="vertical" style={{ width: "100%" }} size="middle">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {thumbnailPreview || form.getFieldValue("thumbnail") ? (
                    <div
                      style={{
                        position: "relative",
                        width: 120,
                        height: 120,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid #d9d9d9",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={thumbnailPreview || form.getFieldValue("thumbnail")}
                        alt="Thumbnail"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => {
                          form.setFieldValue("thumbnail", undefined);
                          setThumbnailPreview(undefined);
                        }}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "rgba(255, 255, 255, 0.9)",
                          padding: 4,
                        }}
                      />
                    </div>
                  ) : (
                    <Upload
                      name="file"
                      listType="picture-card"
                      showUploadList={false}
                      multiple={false}
                      maxCount={1}
                      beforeUpload={(file) => {
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
                        setThumbnailUploading(true);
                        uploadFile(file)
                          .unwrap()
                          .then((response) => {
                            const thumbnailUrl = response.data?.url || response.data?.fileName;
                            if (!thumbnailUrl) {
                              throw new Error("Invalid response: missing thumbnail URL");
                            }
                            form.setFieldValue("thumbnail", thumbnailUrl);
                            setThumbnailPreview(thumbnailUrl);
                            message.success("Thumbnail uploaded successfully!");
                            setThumbnailUploading(false);
                          })
                          .catch((error) => {
                            const errorMessage = error?.data?.message || error?.message || "Failed to upload thumbnail";
                            message.error(errorMessage);
                            setThumbnailUploading(false);
                          });
                        
                        return false; // Prevent auto upload
                      }}
                      disabled={thumbnailUploading}
                    >
                      {thumbnailUploading ? (
                        <div>
                          <div>Uploading...</div>
                        </div>
                      ) : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  )}
                </div>
                <Input
                  size="large"
                  placeholder="Or enter thumbnail URL"
                  value={thumbnailPreview || form.getFieldValue("thumbnail") || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setFieldValue("thumbnail", value);
                    setThumbnailPreview(value);
                  }}
                  addonAfter={
                    (thumbnailPreview || form.getFieldValue("thumbnail")) ? (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          form.setFieldValue("thumbnail", undefined);
                          setThumbnailPreview(undefined);
                        }}
                      >
                        Clear
                      </Button>
                    ) : null
                  }
                />
              </Space>
            </Form.Item>

            {/* Product Flags */}
            <Title level={5} style={{ marginTop: 24 }}>Product Settings</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item 
                  name="is_on_sale" 
                  label="On Sale"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="is_featured" 
                  label="Featured Product"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  name="is_returnable" 
                  label="Returnable"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>

            {editingProduct && (
              <Form.Item 
                name="status" 
                label="Status"
              >
                <Radio.Group>
                  <Space orientation="horizontal">
                    <Radio value="active">✅ Active</Radio>
                    <Radio value="inactive">⏸️ Inactive</Radio>
                    <Radio value="archived">📦 Archived</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            )}

            {/* Read-Only Stats (Edit Mode) */}
            {editingProduct && (
              <>
                <Title level={5} style={{ marginTop: 24 }}>Statistics (Read-Only)</Title>
                <Row gutter={16}>
                  <Col span={8}>
                    <Text type="secondary">Average Rating:</Text>
                    <div><Text strong>{editingProduct.average_rating || 0}/5 ⭐</Text></div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Reviews:</Text>
                    <div><Text strong>{editingProduct.review_count || 0}</Text></div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Total Sold:</Text>
                    <div><Text strong>{editingProduct.total_sold || 0}</Text></div>
                  </Col>
                </Row>
              </>
            )}

            <Form.Item style={{ marginTop: 32 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                  size="large"
                  icon={editingProduct ? <EditOutlined /> : <PlusOutlined />}
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
                <Button onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }} size="large">
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
}

