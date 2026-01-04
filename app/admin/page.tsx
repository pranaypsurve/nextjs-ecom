"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography } from "antd";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { Role } from "@/lib/constants";
import Link from "next/link";

const { Title } = Typography;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    dispatchedOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Load stats from JSON/localStorage
    // For now using mock data
    setStats({
      totalOrders: 0,
      pendingOrders: 0,
      dispatchedOrders: 0,
      totalRevenue: 0,
    });
  }, []);

  return (
    <ProtectedRoute requiredRole={Role.ADMIN}>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
        <Title level={1} style={{ marginBottom: "32px" }}>
          Admin Dashboard
        </Title>

        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={stats.pendingOrders}
                prefix={<ClockCircleOutlined />}
                styles={{ content: { color: "#fa8c16" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Dispatched Orders"
                value={stats.dispatchedOrders}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: "#52c41a" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                precision={2}
                styles={{ content: { color: "#1890ff" } }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Quick Actions" style={{ height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link href="/admin/categories">
                  <Card hoverable size="small">Manage Categories</Card>
                </Link>
                <Link href="/admin/products">
                  <Card hoverable size="small">Manage Products</Card>
                </Link>
                <Link href="/admin/orders">
                  <Card hoverable size="small">Manage Orders</Card>
                </Link>
                <Link href="/admin/coupons">
                  <Card hoverable size="small">Manage Coupons</Card>
                </Link>
                <Link href="/admin/gift-cards">
                  <Card hoverable size="small">Manage Gift Cards</Card>
                </Link>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Recent Activity" style={{ height: "100%" }}>
              <p>Recent activity will appear here</p>
            </Card>
          </Col>
        </Row>
      </div>
    </ProtectedRoute>
  );
}

