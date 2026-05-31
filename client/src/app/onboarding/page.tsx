"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { getMe } from "@/app/actions/me";
import { normalizeRole, type AppRole } from "@/lib/roles";

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!username.trim()) return;
    setError("");
    startTransition(async () => {
      const me = await getMe();
      const cookieMatch =
        typeof document !== "undefined"
          ? document.cookie.match(/pending_role=([^;]+)/)
          : null;
      const role: AppRole =
        normalizeRole(me?.role) ??
        normalizeRole(cookieMatch?.[1]) ??
        "CLIENT";
      const result = await completeOnboarding({ role, username });
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      if (result && "success" in result && result.success) {
        localStorage.setItem("show_welcome", "1");
        router.push("/dashboard");
      }
    });
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

      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-bold tracking-tight">AI Marketplace</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Choose a username</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is how others will find you on the platform.
        </p>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
              @
            </span>
            <input
              type="text"
              placeholder="yourname"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full h-11 pl-7 pr-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-destructive px-1">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isPending || !username.trim()}
            className="w-full h-11 rounded-xl bg-gradient-primary text-white font-medium glow-primary hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Go to Dashboard <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
