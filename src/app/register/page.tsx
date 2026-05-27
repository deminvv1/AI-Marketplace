"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "sent">("form");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleMagicLink() {
    const trimmed = email.trim();
    if (!trimmed) return;
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setStep("sent");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(99,102,241,0.25), transparent 60%), radial-gradient(ellipse at bottom right, rgba(139,92,246,0.2), transparent 60%)",
        }}
      />
      <div className="w-full max-w-md glass rounded-2xl p-8 glow-primary">
        <div className="flex items-center gap-2 mb-8">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-bold tracking-tight">AI Marketplace</span>
        </div>

        {step === "sent" ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="size-16 rounded-2xl bg-primary/15 border border-primary/40 grid place-items-center glow-primary mb-6">
              <CheckCircle2 className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Check your inbox</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              We sent a magic link to{" "}
              <span className="text-foreground font-medium">{email}</span>.
              Click it to sign in — no password needed.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Wrong email?{" "}
              <button
                onClick={() => { setStep("form"); setError(""); }}
                className="text-primary hover:underline"
              >
                Go back
              </button>
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join 12,840 AI specialists and clients worldwide.
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={handleGoogle}
                className="w-full h-11 rounded-xl bg-white/5 border border-border hover:border-primary/50 hover:bg-white/10 transition flex items-center justify-center gap-3 text-sm font-medium"
              >
                <span className="size-5 rounded-md bg-white/10 grid place-items-center text-xs">G</span>
                Continue with Google
              </button>
              {[
                { label: "Continue with Apple", icon: "" },
                { label: "Continue with Facebook", icon: "f" },
                { label: "Continue with Telegram", icon: "T" },
              ].map((b) => (
                <button
                  key={b.label}
                  className="w-full h-11 rounded-xl bg-white/5 border border-border hover:border-primary/50 hover:bg-white/10 transition flex items-center justify-center gap-3 text-sm font-medium"
                >
                  <span className="size-5 rounded-md bg-white/10 grid place-items-center text-xs">
                    {b.icon}
                  </span>
                  {b.label}
                </button>
              ))}
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />— or —
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {error && (
                <p className="text-xs text-destructive px-1">{error}</p>
              )}

              <button
                onClick={handleMagicLink}
                disabled={loading || !email.trim()}
                className="w-full h-11 rounded-xl bg-gradient-primary text-white font-medium glow-primary hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>Send Magic Link <ArrowRight className="size-4" /></>
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
