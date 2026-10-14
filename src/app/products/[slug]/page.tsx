import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Heart, ShieldCheck, Truck } from "lucide-react";
import { ProductPurchase } from "@/components/product-purchase";
import { findProductBySlug, products } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="product-page">
      <div className="breadcrumbs"><Link href="/shop"><ArrowLeft size={14} /> Back to the edit</Link><span> / </span><span>{product.category}</span></div>
      <div className="product-detail-grid">
        <div className="product-detail-image"><Image src={product.image} alt={product.name} fill priority sizes="(max-width: 800px) 100vw, 55vw" />{product.badge && <span className="product-badge">{product.badge}</span>}</div>
        <div className="product-detail-info">
          <span className="eyebrow">{product.category} · {product.color}</span>
          <h1>{product.name}</h1>
          <div className="detail-price">{formatPrice(product.price)}{product.compareAt && <s>{formatPrice(product.compareAt)}</s>}<span>USD</span></div>
          <p className="detail-description">{product.description}</p>
          <ProductPurchase product={product} />
          <div className="product-policies"><div><Truck size={17} /><span>Complimentary shipping over $100</span></div><div><ShieldCheck size={17} /><span>Return terms will be published before launch</span></div><div><Check size={17} /><span>Secure Stripe checkout</span></div></div>
          <Link className="text-link save-for-later" href="/account"><Heart size={15} /> Save favourites when you sign in</Link>
        </div>
      </div>
    </main>
  );
}
