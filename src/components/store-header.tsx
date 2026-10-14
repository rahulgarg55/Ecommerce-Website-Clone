"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, ShoppingBag, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useStorefront } from "@/components/storefront-provider";

export function StoreHeader() {
  const router = useRouter();
  const { cartCount, user } = useStorefront();
  const [query, setQuery] = useState("");

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
  }

  return (
    <>
      <div className="announcement">
        <span>STORE PREVIEW · Sample products and prices</span>
        <span>Stripe checkout and Firebase accounts need store setup</span>
      </div>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Fashion X home">
          <span className="brand-mark">F<span>X</span></span>
          <span className="brand-name">FASHION <i>X</i></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/shop">Shop all</Link>
          <Link href="/shop?category=Clothing">Clothing</Link>
          <Link href="/shop?category=Knitwear">Knitwear</Link>
          <Link href="/shop?category=Accessories">Accessories</Link>
        </nav>
        <div className="header-actions">
          <form className="header-search" onSubmit={search}>
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Search products"
              placeholder="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          <Link className="icon-link account-link" href={user ? "/account" : "/signin"} aria-label={user ? "Your account" : "Sign in"}>
            <UserRound size={19} strokeWidth={1.6} />
          </Link>
          <Link className="icon-link bag-link" href="/cart" aria-label={`Shopping bag with ${cartCount} items`}>
            <ShoppingBag size={19} strokeWidth={1.6} />
            <span>{cartCount}</span>
          </Link>
        </div>
      </header>
      <div className="mobile-nav">
        <Link href="/shop">Shop</Link>
        <Link href="/shop?category=Clothing">Clothing</Link>
        <Link href="/shop?category=Knitwear">Knitwear</Link>
        <Link href="/shop?category=Accessories">Accessories</Link>
        <Link href="/account">Account <ArrowRight size={13} /></Link>
      </div>
    </>
  );
}
