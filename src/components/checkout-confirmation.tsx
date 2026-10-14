"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, CircleDashed } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useStorefront } from "@/components/storefront-provider";

function ConfirmationContent() {
  const params = useSearchParams();
  const { user, authReady, clearCart } = useStorefront();
  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "error">("loading");
  const [error, setError] = useState("");
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (!authReady) return;
    if (!sessionId || !user) return;

    let cancelled = false;
    user.getIdToken().then((token) =>
      fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then(async (response) => {
      const data = (await response.json()) as { status?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Your order status could not be verified.");
      if (cancelled) return;
      if (data.status === "paid") {
        setStatus("paid");
        clearCart();
      } else {
        setStatus("pending");
      }
    }).catch((cause: unknown) => {
      if (!cancelled) {
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Your order status could not be verified.");
      }
    });
    return () => { cancelled = true; };
  }, [authReady, user, sessionId, clearCart]);

  const needsSignIn = authReady && Boolean(sessionId) && !user;
  const invalidSession = authReady && !sessionId;
  const displayStatus = needsSignIn || invalidSession ? "error" : status;
  const displayError = needsSignIn
    ? "Sign in to verify your order. Your payment status can also be checked in your Stripe receipt."
    : invalidSession
      ? "That order link is missing its checkout reference. Check your account orders or Stripe receipt."
      : error;

  return (
    <section className="confirmation-page">
      <div className={`confirmation-icon confirmation-${displayStatus}`}>{displayStatus === "paid" ? <Check size={28} /> : <CircleDashed size={28} />}</div>
      <span className="eyebrow">{displayStatus === "paid" ? "ORDER CONFIRMED" : displayStatus === "pending" ? "PAYMENT PROCESSING" : "ONE MOMENT"}</span>
      <h1>{displayStatus === "paid" ? <>Good things<br /><i>are on their way.</i></> : displayStatus === "pending" ? <>Almost <i>there.</i></> : displayStatus === "error" ? <>Let’s check<br /><i>that again.</i></> : <>A little <i>moment…</i></>}</h1>
      <p>{displayStatus === "paid" ? "Your payment went through. We’ve saved your order in your Fashion X account." : displayStatus === "pending" ? "Your payment is still being confirmed. Refresh your account orders in a moment." : displayStatus === "error" ? displayError : "We’re securely confirming your payment with Stripe."}</p>
      {displayStatus === "loading" && <div className="confirm-progress">Checking payment status…</div>}
      <div className="confirmation-actions"><Link className="button button-dark" href="/account">Go to your orders <ArrowRight size={16} /></Link><Link className="text-link" href="/shop">Back to the edit</Link></div>
    </section>
  );
}

export function CheckoutConfirmation() {
  return <Suspense fallback={<div className="page-loading">Confirming your order…</div>}><ConfirmationContent /></Suspense>;
}
