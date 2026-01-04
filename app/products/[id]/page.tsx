import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import { dataService } from "@/lib/services/dataService";
import { CURRENCY } from "@/lib/constants";
import type { Product } from "@/lib/data";

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
  const product = dataService.getProductById(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | E-Commerce Platform`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [product.images[0]] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

// JSON-LD Schema for SEO
function generateProductSchema(product: Product) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `/products/${product.id}`,
      priceCurrency: CURRENCY.CODE,
      price: product.price.toString(),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating.toString(),
          reviewCount: product.reviews?.toString() || "0",
        }
      : undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = dataService.getProductById(id);

  if (!product) {
    notFound();
  }

  const schema = generateProductSchema(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}

