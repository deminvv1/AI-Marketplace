"use client";

import { useState, useTransition } from "react";
import { Briefcase, Code2, Layers, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Role } from "@prisma/client";

const ROLES = [
  {
    value: Role.CUSTOMER,
    label: "Customer",
    desc: "I post AI projects and hire specialists.",
    icon: Briefcase,
    color: "primary",
  },
  {
    value: Role.EXECUTOR,
    label: "Executor",
    desc: "I offer AI services and complete projects.",
    icon: Code2,
    color: "secondary",
  },
  {
    value: Role.BOTH,
    label: "Both",
    desc: "I do both — hire and offer services.",
    icon: Layers,
    color: "primary",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleRoleSelect(r: Role) {
    setRole(r);
    setStep(2);
  }

  function handleSubmit() {
    if (!role || !username.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await completeOnboarding({ role, username });
      if (result?.error) setError(result.error);
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold tracking-tight">What's your role?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You can change this later in settings.
            </p>
            <div className="mt-8 space-y-3">
              {ROLES.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleRoleSelect(value)}
                  className="w-full glass glass-hover rounded-2xl p-5 text-left flex items-center gap-4 group"
                >
                  <div className="size-12 rounded-xl bg-primary/15 border border-primary/40 grid place-items-center flex-shrink-0">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{label}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
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
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
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
                  <>Go to Dashboard <ArrowRight className="size-4" /></>
                )}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition"
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
