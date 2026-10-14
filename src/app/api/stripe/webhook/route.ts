import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    const { getStripe } = await import("@/lib/stripe");
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return Response.json({ error: "Stripe is not configured yet." }, { status: 503 });
    }
    console.error("Stripe webhook signature verification failed.", error);
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const sessionEvents = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ];
  if (!sessionEvents.includes(event.type)) return Response.json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("Stripe Checkout webhook arrived without an order ID.", event.id);
    return Response.json({ error: "Order reference missing." }, { status: 400 });
  }

  try {
    const { getFirebaseAdminDb } = await import("@/lib/firebase/admin");
    const orderRef = getFirebaseAdminDb().collection("orders").doc(orderId);
    const order = await orderRef.get();
    if (!order.exists) {
      console.error("Stripe Checkout webhook references an unknown order.", orderId);
      return Response.json({ error: "Order reference not found." }, { status: 500 });
    }

    const status = session.payment_status === "paid" || event.type === "checkout.session.async_payment_succeeded"
      ? "paid"
      : event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired"
        ? "payment_failed"
        : "pending";
    await orderRef.update({
      status,
      stripeSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    });
    return Response.json({ received: true });
  } catch (error) {
    console.error("Could not record Stripe Checkout webhook.", error);
    return Response.json({ error: "Order update failed. Stripe may retry this webhook." }, { status: 500 });
  }
}
