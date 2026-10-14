import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, PackageCheck, Sparkles, UserRound } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> The new everyday · Collection 01</span>
          <h1>Good clothes.<br /><i>Better days.</i></h1>
          <p>Thoughtful layers, easy silhouettes, and pieces that feel like you. Meet the considered edit for wherever your day takes you.</p>
          <div className="hero-actions"><Link className="button button-dark" href="/shop">Shop the new edit <ArrowUpRight size={16} /></Link><Link className="text-link" href="/shop?category=Knitwear">Explore knitwear <ArrowRight size={15} /></Link></div>
          <div className="hero-note"><span>01 / 03</span><span>Quietly considered. Always in rotation.</span><ArrowDown size={15} /></div>
        </div>
        <div className="hero-image-wrap">
          <Image src="/images/03c.jpg" alt="A relaxed Fashion X seasonal look" fill priority sizes="(max-width: 800px) 100vw, 54vw" />
          <div className="hero-image-caption"><span>THE SOFT STRUCTURE EDIT</span><span>01 — 08</span></div>
          <div className="hero-floating-card"><span>Made for</span><strong>every version<br />of your everyday.</strong><Link href="/shop">Find your fit <ArrowUpRight size={14} /></Link></div>
        </div>
        <span className="hero-side-note">LESS, BUT BETTER · EST. 2024</span>
      </section>

      <section className="promise-strip" aria-label="Store preview features">
        <div><PackageCheck size={18} /><span>Sample product edit</span></div><i /><div><Sparkles size={18} /><span>Stripe hosted checkout</span></div><i /><div><UserRound size={18} /><span>Personal order history</span></div>
      </section>

      <section className="section-block collection-section">
        <div className="section-heading"><div><span className="eyebrow">A little something for every day</span><h2>New in, <i>for you.</i></h2></div><Link className="text-link" href="/shop">Shop all pieces <ArrowRight size={15} /></Link></div>
        <ProductGrid showFilters={false} limit={4} />
      </section>

      <section className="story-band">
        <div className="story-image">
          <Image src="/images/02c.jpg" alt="An edit of easy-to-wear clothes on the rack" fill sizes="(max-width: 800px) 100vw, 50vw" />
          <span>THE WARDROBE, RE-EDITED</span>
        </div>
        <div className="story-copy"><span className="eyebrow">A softer kind of style</span><h2>Less rush.<br /><i>More wear.</i></h2><p>We believe the best pieces don’t need an occasion. Just an easy fit and the confidence to wear them your way.</p><Link className="button button-light" href="/shop">Find your everyday <ArrowUpRight size={16} /></Link><span className="story-index">F / X — 001</span></div>
      </section>

      <section className="section-block edit-section">
        <div className="section-heading"><div><span className="eyebrow">A considered wardrobe starts here</span><h2>Find your <i>favourite.</i></h2></div><Link className="text-link" href="/shop">Explore the full edit <ArrowRight size={15} /></Link></div>
        <div className="category-grid">
          <Link href="/shop?category=Clothing" className="category-tile category-clothing"><Image src="/images/02c.jpg" alt="Clothing edit" fill sizes="(max-width: 700px) 100vw, 33vw" /><span>01 / CLOTHING</span><strong>Everyday, <i>elevated.</i></strong><span className="category-arrow"><ArrowUpRight size={17} /></span></Link>
          <Link href="/shop?category=Knitwear" className="category-tile category-knit"><Image src="/images/01c.jpg" alt="Soft knitwear edit" fill sizes="(max-width: 700px) 100vw, 33vw" /><span>02 / KNITWEAR</span><strong>Made for <i>slowing down.</i></strong><span className="category-arrow"><ArrowUpRight size={17} /></span></Link>
          <Link href="/shop?category=Accessories" className="category-tile category-accessories"><Image src="/images/15.jpg" alt="Everyday accessories" fill sizes="(max-width: 700px) 100vw, 33vw" /><span>03 / ACCESSORIES</span><strong>The little <i>finishing things.</i></strong><span className="category-arrow"><ArrowUpRight size={17} /></span></Link>
        </div>
      </section>

      <section className="store-policies-section" id="shipping">
        <div className="store-policies-intro"><span className="eyebrow">DELIVERY & STORE POLICIES</span><h2>The details,<br /><i>up front.</i></h2><p>This preview uses sample products and prices. Confirm all store details and policies before launch.</p></div>
        <div className="store-policy-grid">
          <div><span>SHIPPING</span><strong>$8 under $100</strong><p>Complimentary shipping from $100. Prices are in USD.</p></div>
          <div><span>DELIVERY AREAS</span><strong>Five destinations</strong><p>US, Canada, UK, Australia, and India.</p></div>
          <div><span>TAXES</span><strong>Not configured</strong><p>Tax calculation is not configured in this preview.</p></div>
          <div><span>RETURNS</span><strong>Policy in progress</strong><p>Return terms will be published before the store launches.</p></div>
        </div>
      </section>
    </main>
  );
}
