"use client";

import { Layout, Row, Col, Typography } from "antd";
import Link from "next/link";

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function Footer() {
  return (
    <AntFooter
      style={{
        background: "#001529",
        color: "#fff",
        padding: "48px 24px 24px",
        marginTop: "auto",
      }}
    >
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: "#fff", display: "block", marginBottom: "16px" }}>
            Company
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/about" style={{ color: "rgba(255,255,255,0.65)" }}>
              About Us
            </Link>
            <Link href="/contact" style={{ color: "rgba(255,255,255,0.65)" }}>
              Contact
            </Link>
            <Link href="/careers" style={{ color: "rgba(255,255,255,0.65)" }}>
              Careers
            </Link>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: "#fff", display: "block", marginBottom: "16px" }}>
            Customer Service
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/shipping" style={{ color: "rgba(255,255,255,0.65)" }}>
              Shipping Info
            </Link>
            <Link href="/returns" style={{ color: "rgba(255,255,255,0.65)" }}>
              Returns
            </Link>
            <Link href="/faq" style={{ color: "rgba(255,255,255,0.65)" }}>
              FAQ
            </Link>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: "#fff", display: "block", marginBottom: "16px" }}>
            Legal
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.65)" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: "rgba(255,255,255,0.65)" }}>
              Terms of Service
            </Link>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: "#fff", display: "block", marginBottom: "16px" }}>
            Connect
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/newsletter" style={{ color: "rgba(255,255,255,0.65)" }}>
              Newsletter
            </Link>
            <Link href="/social" style={{ color: "rgba(255,255,255,0.65)" }}>
              Social Media
            </Link>
          </div>
        </Col>
      </Row>
      <Row style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Text style={{ color: "rgba(255,255,255,0.65)" }}>
            © {new Date().getFullYear()} E-Commerce Platform. All rights reserved.
          </Text>
        </Col>
      </Row>
    </AntFooter>
  );
}

