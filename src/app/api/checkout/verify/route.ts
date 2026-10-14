import { requireFirebaseUser } from "@/lib/auth-server";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const authentication = await requireFirebaseUser(request);
  if (authentication.response) return authentication.response;
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return Response.json({ error: "That checkout session could not be found." }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.firebaseUid !== authentication.user.uid) {
      return Response.json({ error: "This order belongs to a different account." }, { status: 403 });
    }
    const orderId = session.metadata.orderId;
    if (!orderId) return Response.json({ error: "The order reference is missing." }, { status: 404 });

    const orderRef = getFirebaseAdminDb().collection("orders").doc(orderId);
    const orderSnapshot = await orderRef.get();
    if (!orderSnapshot.exists) {
      return Response.json({ error: "We could not find that order in your account." }, { status: 404 });
    }
    if (session.payment_status === "paid") {
      await orderRef.update({
        status: "paid",
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      });
    }
    return Response.json({ status: session.payment_status === "paid" ? "paid" : "pending" });
  } catch (error) {
    console.error("Could not verify a Stripe Checkout session.", error);
    return Response.json({ error: "Your payment status could not be verified. Please check your account shortly." }, { status: 502 });
  }
}
