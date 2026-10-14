import { requireFirebaseUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authentication = await requireFirebaseUser(request);
  if (authentication.response) return authentication.response;

  try {
    const { getFirebaseAdminDb } = await import("@/lib/firebase/admin");
    const snapshot = await getFirebaseAdminDb()
      .collection("orders")
      .where("userId", "==", authentication.user.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    const orders = snapshot.docs.map((document) => {
      const order = document.data();
      return {
        id: document.id,
        status: order.status,
        currency: order.currency,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        items: order.items,
        createdAt: order.createdAt,
      };
    });
    return Response.json({ orders });
  } catch (error) {
    console.error("Unable to load customer order history.", error);
    return Response.json({ error: "Your order history couldn't be loaded. Please try again." }, { status: 503 });
  }
}
