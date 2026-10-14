import type { Metadata } from "next";
import { CheckoutConfirmation } from "@/components/checkout-confirmation";

export const metadata: Metadata = { title: "Order received" };

export default function CheckoutSuccessPage() {
  return <main><CheckoutConfirmation /></main>;
}
