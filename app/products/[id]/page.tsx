import type { Metadata } from "next";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import { CURRENCY } from "@/lib/constants";

// Generate static params for ISR
export async function generateStaticParams() {
  // In production, fetch all product IDs
  // For now, return empty array to use dynamic rendering
  return [];
}

// ISR with revalidation
export const revalidate = 60; // Revalidate every 60 seconds

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  // For now, return basic metadata. In production, fetch from API
  return {
    title: `Product ${id} | E-Commerce Platform`,
    description: "Product details",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductDetailClient productId={id} />;
}

