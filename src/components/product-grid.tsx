"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categories, products, type Category } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export function ProductGrid({
  initialCategory = "All",
  initialQuery = "",
  showFilters = true,
  limit,
}: {
  initialCategory?: Category;
  initialQuery?: string;
  showFilters?: boolean;
  limit?: number;
}) {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("featured");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery = !normalizedQuery || `${product.name} ${product.category} ${product.color}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    return limit ? result.slice(0, limit) : result;
  }, [category, query, sort, limit]);

  return (
    <>
      {showFilters && (
        <div className="catalog-toolbar">
          <div className="category-tabs" role="group" aria-label="Filter by category">
            {categories.map((item) => (
              <button className={category === item ? "active" : ""} key={item} type="button" onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
          <label className="catalog-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find your next favourite" /><span className="sr-only">Search products</span></label>
          <label className="sort-control"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
        </div>
      )}
      <div className="products-grid">
        {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {visibleProducts.length === 0 && <div className="empty-results"><Search size={22} /><h3>No pieces found</h3><p>Try another search or choose a different category.</p></div>}
      {!showFilters && <div className="catalog-more"><a href="/shop">Discover the full edit <span>↗</span></a></div>}
    </>
  );
}
