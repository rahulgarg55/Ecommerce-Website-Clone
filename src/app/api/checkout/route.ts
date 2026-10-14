import { z } from "zod";
import { requireFirebaseUser } from "@/lib/auth-server";
import { findProduct, sizes } from "@/lib/catalog";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1).max(80),
    size: z.enum([...sizes, "One size"]),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(20),
});

export async function POST(request: Request) {
  const authentication = await requireFirebaseUser(request);
  if (authentication.response) return authentication.response;

  let input: unknown;
  try {
    input = await request.json();
  } catch (error) {
    console.error("Checkout request contained invalid JSON.", error);
    return Response.json({ error: "The cart request was not valid." }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "Check the items in your bag and try again." }, { status: 400 });
  }

  const items = parsed.data.items.map((item) => {
    const product = findProduct(item.productId);
    return { ...item, product };
  });
  if (items.some(({ product, size }) => !product || (product.category === "Accessories" ? size !== "One size" : size === "One size"))) {
    return Response.json({ error: "One or more items in your bag are no longer available." }, { status: 400 });
  }
  if (process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") && process.env.STORE_LIVE_CHECKOUT_ENABLED !== "true") {
    return Response.json({ error: "Live payments are paused until the store catalog, inventory, taxes, and policies are approved." }, { status: 503 });
  }

  const verifiedItems = items.flatMap((item) => item.product ? [{ ...item, product: item.product }] : []);
  const subtotal = verifiedItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 8;
  let deletePendingOrder: (() => Promise<unknown>) | undefined;
  try {
    const { getFirebaseAdminDb } = await import("@/lib/firebase/admin");
    const orderRef = getFirebaseAdminDb().collection("orders").doc();
    const order = {
      id: orderRef.id,
      userId: authentication.user.uid,
      email: authentication.user.email ?? "",
      status: "pending",
      currency: "usd",
      subtotal,
      shipping,
      total: subtotal + shipping,
      items: verifiedItems.map(({ product, size, quantity }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        size,
        quantity,
        unitPrice: product.price,
      })),
      createdAt: new Date().toISOString(),
    };

    await orderRef.set(order);
    deletePendingOrder = () => orderRef.delete();
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const origin = configuredSiteUrl
      ? new URL(configuredSiteUrl).origin
      : process.env.NODE_ENV === "development"
        ? new URL(request.url).origin
        : null;
    if (!origin) {
      await orderRef.delete();
      return Response.json({ error: "The store owner needs to set NEXT_PUBLIC_SITE_URL before checkout is enabled." }, { status: 503 });
    }
    const { getStripe } = await import("@/lib/stripe");
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: authentication.user.email ?? undefined,
      client_reference_id: orderRef.id,
      metadata: { orderId: orderRef.id, firebaseUid: authentication.user.uid },
      line_items: [
        ...verifiedItems.map(({ product, size, quantity }) => ({
          price_data: {
            currency: "usd",
            product_data: { name: `${product.name} — ${size}` },
            unit_amount: product.price * 100,
          },
          quantity,
        })),
        ...(shipping ? [{
          price_data: {
            currency: "usd",
            product_data: { name: "Shipping" },
            unit_amount: shipping * 100,
          },
          quantity: 1,
        }] : []),
      ],
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU", "IN"] },
      phone_number_collection: { enabled: true },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?checkout=cancelled`,
    });
    if (!session.url) {
      await orderRef.delete();
      return Response.json({ error: "Stripe did not return a checkout address. Please try again." }, { status: 502 });
    }
    await orderRef.update({ stripeSessionId: session.id });
    return Response.json({ url: session.url });
  } catch (error) {
    if (deletePendingOrder) await deletePendingOrder();
    if (error instanceof Error && error.message.includes("Firebase Admin credentials are not configured")) {
      return Response.json({ error: "Account services are not configured yet." }, { status: 503 });
    }
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return Response.json({ error: "Secure checkout is not enabled yet. The store owner needs to connect Stripe." }, { status: 503 });
    }
    console.error("Unable to create Stripe Checkout session.", error);
    return Response.json({ error: "Secure checkout could not be started. Please try again shortly." }, { status: 502 });
  }
}
