"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { sizes, type Product, type Size } from "@/lib/catalog";
import { useStorefront } from "@/components/storefront-provider";

export function ProductPurchase({ product }: { product: Product }) {
  const { addToCart } = useStorefront();
  const productSizes: readonly Size[] = product.category === "Accessories" ? ["One size"] : sizes;
  const [size, setSize] = useState<Size>(productSizes[0]);
  const [added, setAdded] = useState(false);

  function add() {
    addToCart(product.id, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="purchase-actions">
      <div className="size-label-row"><span>{product.category === "Accessories" ? "SIZE" : "SELECT YOUR SIZE"}</span>      {product.category !== "Accessories" && <button type="button" className="size-guide" onClick={() => document.querySelector<HTMLDialogElement>("#size-guide")?.showModal()}>Size guide</button>}</div>
      <div className={`size-options${productSizes.length === 1 ? " one-size" : ""}`} role="group" aria-label="Select a size">
        {productSizes.map((option) => <button key={option} type="button" className={size === option ? "selected" : ""} aria-pressed={size === option} onClick={() => setSize(option)}>{option}</button>)}
      </div>
      <button type="button" className="button button-dark add-to-bag" onClick={add}>{added ? "Added to your bag" : "Add to bag"} {added ? <Check size={16} /> : <ArrowRight size={16} />}</button>
      {product.category !== "Accessories" && <dialog className="size-guide-modal" id="size-guide"><form method="dialog"><button className="modal-close" aria-label="Close size guide">×</button></form><span className="eyebrow">FASHION X FIT NOTES</span><h2>Find your <i>easy fit.</i></h2><p>Our pieces are designed with a relaxed, true-to-size fit. Between sizes? We recommend sizing down for a closer feel, or up for a roomier layer.</p><div className="size-guide-table"><span>SIZE</span><span>CHEST</span><span>WAIST</span><span>XS</span><span>32–34 in</span><span>24–26 in</span><span>S</span><span>35–37 in</span><span>27–29 in</span><span>M</span><span>38–40 in</span><span>30–32 in</span><span>L</span><span>41–43 in</span><span>33–35 in</span><span>XL</span><span>44–46 in</span><span>36–38 in</span></div></dialog>}
    </div>
  );
}
