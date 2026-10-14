import type { Metadata } from "next";
import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";
import { StorefrontProvider } from "@/components/storefront-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fashion X — the everyday, considered",
    template: "%s — Fashion X",
  },
  description: "An edited wardrobe of easy layers, thoughtful details, and everyday favourites.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StorefrontProvider>
          <StoreHeader />
          {children}
          <StoreFooter />
        </StorefrontProvider>
      </body>
    </html>
  );
}
