"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LogOut, PackageCheck, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import type { StoreOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/catalog";
import { firebaseConfigured } from "@/lib/firebase/client";
import { useStorefront } from "@/components/storefront-provider";

export function AccountDashboard() {
  const { user, authReady, signOutUser, wishlist } = useStorefront();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [ordersFailure, setOrdersFailure] = useState<{ userId: string; message: string } | null>(null);
  const [signOutFailure, setSignOutFailure] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user.getIdToken().then((token) =>
      fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }),
    ).then(async (response) => {
      const data = (await response.json()) as { orders?: StoreOrder[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Your orders could not be loaded.");
      if (!cancelled) {
        setOrders(data.orders ?? []);
        setOrdersFailure(null);
      }
    }).catch((error: unknown) => {
      if (!cancelled) setOrdersFailure({
        userId: user.uid,
        message: error instanceof Error ? error.message : "Your orders could not be loaded.",
      });
    }).finally(() => {
      if (!cancelled) setLoadedUserId(user.uid);
    });
    return () => { cancelled = true; };
  }, [user]);
  const loadingOrders = Boolean(user && loadedUserId !== user.uid);
  const ordersError = ordersFailure && user && ordersFailure.userId === user.uid
    ? ordersFailure.message
    : "";

  async function signOut() {
    setSignOutFailure("");
    try {
      await signOutUser();
    } catch (error) {
      setSignOutFailure(error instanceof Error ? error.message : "We couldn't sign you out. Please try again.");
    }
  }

  if (!authReady) return <div className="page-loading">Opening your account…</div>;

  if (!firebaseConfigured) {
    return <section className="account-gate"><span className="eyebrow">YOUR FASHION X SPACE</span><h1>Your own little <i>corner.</i></h1><div className="config-notice">Accounts are waiting for the store owner to connect Firebase. You can browse the edit and save a bag on this device.</div><Link className="button button-dark" href="/shop">Keep shopping <ArrowRight size={16} /></Link></section>;
  }

  if (!user) {
    return <section className="account-gate"><span className="eyebrow">YOUR FASHION X SPACE</span><h1>Your own little <i>corner.</i></h1><p>Sign in to revisit saved pieces, check your orders, and make the next visit feel like yours.</p><div className="account-gate-actions"><Link className="button button-dark" href="/signin">Sign in <ArrowRight size={16} /></Link><Link className="button button-outline" href="/signup">Create an account</Link></div></section>;
  }

  return (
    <section className="account-page">
      <div className="account-heading"><div><span className="eyebrow">YOUR FASHION X SPACE</span><h1>Good to see you, <i>{user.displayName?.split(" ")[0] ?? "there"}.</i></h1><p>{user.email}</p></div><button className="button button-outline signout-button" onClick={() => void signOut()}><LogOut size={15} /> Sign out</button></div>
      {signOutFailure && <p className="form-error" role="alert">{signOutFailure}</p>}
      <div className="account-highlights"><div><PackageCheck size={19} /><span><strong>{orders.length}</strong> order{orders.length === 1 ? "" : "s"}</span></div><div><ShoppingBag size={19} /><span><strong>{wishlist.length}</strong> saved piece{wishlist.length === 1 ? "" : "s"}</span></div></div>
      <div className="order-history"><div className="order-history-heading"><div><span className="eyebrow">THE PAPER TRAIL</span><h2>Your <i>orders.</i></h2></div><Link className="text-link" href="/shop">Explore the edit <ArrowRight size={15} /></Link></div>
        {loadingOrders && <p className="order-state">Gathering your orders…</p>}
        {ordersError && <p className="form-error" role="alert">{ordersError}</p>}
        {!loadingOrders && !ordersError && orders.length === 0 && <div className="empty-orders"><PackageCheck size={23} /><h3>No orders just yet</h3><p>When something good finds its way home, you’ll see it here.</p><Link className="button button-dark" href="/shop">Find your first favourite <ArrowRight size={15} /></Link></div>}
        <div className="account-orders">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-card-top"><span>ORDER · {order.id.slice(-8).toUpperCase()}</span><span className={`order-status order-${order.status}`}>{order.status.replace("_", " ")}</span></div><div className="order-card-items">{order.items.map((item, index) => <div className="order-card-item" key={`${item.productId}-${item.size}-${index}`}><div className="order-card-image"><Image src={item.image} alt={item.name} fill sizes="64px" /></div><div><strong>{item.name}</strong><span>Size {item.size} · Qty {item.quantity}</span></div><span>{formatPrice(item.unitPrice * item.quantity)}</span></div>)}</div><div className="order-card-bottom"><span>{new Date(order.createdAt).toLocaleDateString()}</span><strong>Total · {formatPrice(order.total)}</strong></div></article>)}</div>
      </div>
    </section>
  );
}
