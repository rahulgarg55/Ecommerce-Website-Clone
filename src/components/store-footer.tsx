import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="footer-top">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark">F<span>X</span></span>
            <span className="brand-name">FASHION <i>X</i></span>
          </Link>
          <p>Wear what feels like you.<br />A considered edit for everyday life.</p>
        </div>
        <div className="footer-links">
          <div><span>Explore</span><Link href="/shop">Shop all</Link><Link href="/shop?category=Knitwear">Knitwear</Link><Link href="/shop?category=Accessories">Accessories</Link></div>
          <div><span>Help</span><Link href="/account">Your account</Link><p>Contact details coming soon.</p><Link href="/#shipping">Shipping & returns</Link></div>
          <div><span>Stay in the loop</span><p>New pieces, considered notes, no noise.</p><p>Updates will be available at launch.</p></div>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Fashion X. Store demo.</span><span>Secure checkout powered by Stripe</span><span>Made for the everyday</span></div>
    </footer>
  );
}
