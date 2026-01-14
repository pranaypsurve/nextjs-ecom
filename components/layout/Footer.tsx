"use client";

import { Layout, Typography } from "antd";

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function Footer() {
  return (
    <AntFooter
      style={{
        background: "#001529",
        color: "#fff",
        padding: "24px",
        marginTop: "auto",
        textAlign: "center",
      }}
    >
      <Text style={{ color: "rgba(255,255,255,0.65)" }}>
        © {new Date().getFullYear()} E-Commerce Platform. All rights reserved.
      </Text>
    </AntFooter>
  );
}

