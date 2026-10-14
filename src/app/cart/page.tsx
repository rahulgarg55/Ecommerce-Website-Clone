import type { Metadata } from "next";
import { ShoppingBagPage } from "@/components/shopping-bag-page";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return <main><ShoppingBagPage /></main>;
}
