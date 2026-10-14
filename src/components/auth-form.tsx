"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Globe2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { firebaseConfigured } from "@/lib/firebase/client";
import { useStorefront } from "@/components/storefront-provider";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useStorefront();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignUp = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (isSignUp) await signUp(name.trim(), email.trim(), password);
      else await signIn(email.trim(), password);
      router.push("/account");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete that request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await signInWithGoogle();
      router.push("/account");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in didn't complete.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReset() {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Enter your email first and we'll send a reset link.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setMessage("If that address has an account, a password reset link is on its way.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't send a reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-visual">
        <Link className="auth-back" href="/"><ArrowLeft size={15} /> Back to the edit</Link>
        <div><span>FASHION X · MEMBER NOTES</span><h1>Good things<br /><i>come around.</i></h1><p>Save your favourites, check on your orders, and pick up right where you left off.</p></div>
        <span className="auth-visual-foot">The everyday, considered.</span>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">{isSignUp ? "A little more personal" : "Welcome back"}</span>
          <h2>{isSignUp ? "Create your account" : "Sign in to your account"}</h2>
          <p>{isSignUp ? "A home for your saved pieces and orders." : "Your saved pieces are right where you left them."}</p>
          {!firebaseConfigured && <div className="config-notice">Account sign-in is awaiting Firebase setup. You can still browse and fill your bag.</div>}
          <button className="google-button" type="button" onClick={googleSignIn} disabled={busy || !firebaseConfigured}><Globe2 size={17} /> Continue with Google</button>
          <div className="form-divider"><span>or continue with email</span></div>
          <form className="auth-form" onSubmit={submit}>
            {isSignUp && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} /></label>}
            <label>Email address<span className="input-with-icon"><Mail size={16} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></span></label>
            <label>Password<input type="password" autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={isSignUp ? 8 : 1} /></label>
            {!isSignUp && <button className="text-action forgot-action" type="button" onClick={sendReset} disabled={busy || !firebaseConfigured}>Forgot password?</button>}
            {error && <p className="form-error" role="alert">{error}</p>}
            {message && <p className="form-success" role="status">{message}</p>}
            <button className="button button-dark auth-submit" type="submit" disabled={busy || !firebaseConfigured}>{busy ? "One moment…" : isSignUp ? "Create account" : "Sign in"} <ArrowRight size={16} /></button>
          </form>
          <p className="auth-switch">{isSignUp ? "Already have an account?" : "New around here?"} <Link href={isSignUp ? "/signin" : "/signup"}>{isSignUp ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </div>
    </section>
  );
}
