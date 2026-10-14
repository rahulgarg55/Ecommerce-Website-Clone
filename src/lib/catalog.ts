export const sizes = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof sizes)[number] | "One size";

export const categories = ["All", "Knitwear", "Clothing", "Accessories"] as const;
export type Category = (typeof categories)[number];

export const products = [
  {
    id: "cloud-knit",
    slug: "cloud-knit-sweater",
    name: "Cloud-knit sweater",
    category: "Knitwear",
    price: 88,
    compareAt: 110,
    image: "/images/01c.jpg",
    badge: "F/X edit",
    color: "Oat / charcoal",
    description: "A soft, weighty cable knit made for slow mornings and long weekends.",
  },
  {
    id: "everyday-denim",
    slug: "everyday-denim",
    name: "Everyday straight denim",
    category: "Clothing",
    price: 96,
    compareAt: null,
    image: "/images/6.jpg",
    badge: "Just in",
    color: "Washed indigo",
    description: "An easy straight-leg fit in substantial, everyday denim.",
  },
  {
    id: "daylight-shirt",
    slug: "daylight-overshirt",
    name: "Daylight overshirt",
    category: "Clothing",
    price: 74,
    compareAt: null,
    image: "/images/3.jpg",
    badge: null,
    color: "Cloud white",
    description: "A relaxed layer with a clean silhouette, made to go everywhere.",
  },
  {
    id: "weekender-cap",
    slug: "weekender-cap",
    name: "Weekender cap",
    category: "Accessories",
    price: 38,
    compareAt: null,
    image: "/images/9.jpg",
    badge: null,
    color: "Washed red",
    description: "A low-profile cap with a lived-in finish and an adjustable strap.",
  },
  {
    id: "soft-crew",
    slug: "soft-crew-knit",
    name: "Soft crew knit",
    category: "Knitwear",
    price: 82,
    compareAt: null,
    image: "/images/12.jpg",
    badge: "F/X edit",
    color: "Ivory / ink",
    description: "A plush everyday knit with a timeless crew neckline.",
  },
  {
    id: "market-tote",
    slug: "market-tote",
    name: "Market tote",
    category: "Accessories",
    price: 44,
    compareAt: null,
    image: "/images/15.jpg",
    badge: null,
    color: "Natural / rose",
    description: "A roomy, hand-feel knit tote for market mornings and everything after.",
  },
  {
    id: "weekend-knit",
    slug: "weekend-knit",
    name: "Weekend knit",
    category: "Knitwear",
    price: 92,
    compareAt: null,
    image: "/images/11.jpg",
    badge: null,
    color: "Warm neutrals",
    description: "An easy layer with a textured hand and a soft, relaxed drape.",
  },
  {
    id: "studio-tee",
    slug: "studio-tee",
    name: "Studio essential tee",
    category: "Clothing",
    price: 42,
    compareAt: null,
    image: "/images/2.jpg",
    badge: null,
    color: "Washed black",
    description: "A dependable, relaxed-fit tee cut for daily wear and repeat styling.",
  },
] as const;

export type Product = (typeof products)[number];

export function findProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function findProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
