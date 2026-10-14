"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { findProduct, formatPrice } from "@/lib/catalog";
import { useStorefront } from "@/components/storefront-provider";

export function ShoppingBagPage() {
  const router = useRouter();
  const { cart, user, authReady, updateQuantity, removeFromCart } = useStorefront();
  const [checkoutError, setCheckoutError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const bag = useMemo(
    () => cart.flatMap((item) => {
      const product = findProduct(item.productId);
      return product ? [{ ...item, product }] : [];
    }),
    [cart],
  );
  const subtotal = bag.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 8;
  const total = subtotal + shipping;

  async function checkout() {
    setCheckoutError("");
    if (!user) {
      router.push("/signin?next=%2Fcart");
      return;
    }
    if (!bag.length) return;
    setCheckingOut(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: bag.map(({ productId, size, quantity }) => ({ productId, size, quantity })) }),
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Checkout couldn't be started. Please try again.");
      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout couldn't be started.");
      setCheckingOut(false);
    }
  }

  if (!authReady) return <div className="page-loading">Preparing your bag…</div>;

  return (
    <section className="bag-page">
      <div className="bag-heading"><div><span className="eyebrow">YOUR FASHION X EDIT</span><h1>Your <i>bag.</i></h1></div><Link className="text-link" href="/shop"><ArrowLeft size={15} /> Keep exploring</Link></div>
      {!bag.length ? (
        <div className="empty-bag"><div className="empty-bag-icon"><ShoppingBagIcon /></div><span className="eyebrow">ROOM FOR SOMETHING GOOD</span><h2>Your bag is taking<br /><i>a little breather.</i></h2><p>There’s nothing here just yet. The good pieces are waiting.</p><Link className="button button-dark" href="/shop">Explore the edit <ArrowRight size={16} /></Link></div>
      ) : (
        <div className="bag-layout">
          <div className="bag-items">
            <div className="bag-table-head"><span>PIECE</span><span>QUANTITY</span><span>SUBTOTAL</span></div>
            {bag.map((item) => (
              <article className="bag-item" key={`${item.productId}-${item.size}`}>
                <Link className="bag-item-image" href={`/products/${item.product.slug}`}><Image src={item.product.image} alt={item.product.name} fill sizes="112px" /></Link>
                <div className="bag-item-details"><Link href={`/products/${item.product.slug}`}>{item.product.name}</Link><span>{item.product.color}</span><span>Size · {item.size}</span><button type="button" className="remove-item" onClick={() => removeFromCart(item.productId, item.size)}><Trash2 size={13} /> Remove</button></div>
                <div className="quantity-control"><button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} aria-label={`Decrease ${item.product.name} quantity`}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} aria-label={`Increase ${item.product.name} quantity`} disabled={item.quantity >= 10}><Plus size={13} /></button></div>
                <strong className="bag-line-total">{formatPrice(item.product.price * item.quantity)}</strong>
              </article>
            ))}
            <div className="bag-under-note"><ShieldCheck size={16} /><span>Store return terms will be published before launch.</span></div>
          </div>
          <aside className="order-summary">
            <span className="eyebrow">THE TOTAL</span><h2>Order <i>summary.</i></h2>
            <div className="summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            <div className="summary-line"><span>Shipping</span><strong>{shipping ? formatPrice(shipping) : "Complimentary"}</strong></div>
            {subtotal < 100 && <p className="shipping-progress">You’re {formatPrice(100 - subtotal)} away from complimentary shipping.</p>}
            <div className="summary-total"><span>Total</span><strong>{formatPrice(total)} <small>USD</small></strong></div>
            <p className="tax-note">Tax calculation is not configured in this store preview.</p>
            {!user && <p className="signin-checkout-note">Sign in or create an account to complete your purchase and track your order.</p>}
            {checkoutError && <p className="form-error checkout-error" role="alert">{checkoutError}</p>}
            <button className="button button-dark checkout-button" onClick={checkout} disabled={checkingOut || !bag.length}>{checkingOut ? "Opening secure checkout…" : user ? "Continue to secure checkout" : "Sign in to check out"} <ArrowRight size={16} /></button>
            <div className="secure-note"><LockKeyhole size={14} /><span>Secure payment powered by Stripe</span></div>
            {!user && <Link href="/signup" className="create-account-link">Create your account <ArrowRight size={14} /></Link>}
          </aside>
        </div>
      )}
    </section>
  );
}

function ShoppingBagIcon() {
  return <ShoppingBag size={26} strokeWidth={1.3} />;
}
