"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { useStorefront } from "@/components/storefront-provider";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, wishlist, toggleWishlist } = useStorefront();
  const [added, setAdded] = useState(false);
  const isSaved = wishlist.includes(product.id);

  function quickAdd() {
    addToCart(product.id, product.category === "Accessories" ? "One size" : "M");
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="product-card">
      <div className="product-card-image">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 680px) 50vw, (max-width: 1050px) 33vw, 25vw" />
        </Link>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button
          className={`wish-button${isSaved ? " is-saved" : ""}`}
          type="button"
          aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
          aria-pressed={isSaved}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
        </button>
        <button className="quick-add" type="button" onClick={quickAdd} aria-label={`Add ${product.name} to bag`}>
          {added ? "Added" : "Quick add"} <Plus size={15} />
        </button>
      </div>
      <div className="product-card-info">
        <Link className="product-name" href={`/products/${product.slug}`}>{product.name} <ArrowUpRight size={14} /></Link>
        <span>{product.color}</span>
        <div className="product-price">{formatPrice(product.price)}{product.compareAt && <s>{formatPrice(product.compareAt)}</s>}</div>
      </div>
    </article>
  );
}
