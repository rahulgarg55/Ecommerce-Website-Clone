import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { categories, type Category } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop the edit",
  description: "Browse the Fashion X edit of everyday clothing, knitwear, and thoughtful accessories.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const filters = await searchParams;
  const category = categories.includes(filters.category as Category)
    ? (filters.category as Category)
    : "All";

  return (
    <main className="shop-page">
      <section className="shop-heading"><div><span className="eyebrow">FASHION X · THE FULL EDIT</span><h1>Pieces to <i>live in.</i></h1><p>Thoughtful shapes, easy-to-wear pieces, and the kind of comfort that makes getting dressed easy.</p></div><span className="shop-count">08<br /><small>GOOD THINGS</small></span></section>
      <section className="catalog-section"><ProductGrid initialCategory={category} initialQuery={filters.q ?? ""} /><p className="catalog-footnote">A small edit, made to work hard in your wardrobe.</p></section>
    </main>
  );
}
