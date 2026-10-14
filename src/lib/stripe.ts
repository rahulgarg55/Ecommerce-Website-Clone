import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to the server environment.");
  }

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}
