"use client";

import { Skeleton } from "antd";

interface SkeletonLoaderProps {
  type?: "product" | "category" | "list" | "card";
  count?: number;
}

export default function SkeletonLoader({ type = "card", count = 1 }: SkeletonLoaderProps) {
  if (type === "product") {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} style={{ marginBottom: "24px" }}>
            <Skeleton.Image
              active
              style={{ width: "100%", height: "250px", marginBottom: "16px" }}
            />
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        ))}
      </>
    );
  }

  if (type === "category") {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} style={{ marginBottom: "24px" }}>
            <Skeleton.Image
              active
              style={{ width: "100%", height: "200px", marginBottom: "16px" }}
            />
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>
        ))}
      </>
    );
  }

  if (type === "list") {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton active key={index} style={{ marginBottom: "16px" }} />
        ))}
      </>
    );
  }

  // Default card skeleton
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton active key={index} avatar paragraph={{ rows: 3 }} />
      ))}
    </>
  );
}

