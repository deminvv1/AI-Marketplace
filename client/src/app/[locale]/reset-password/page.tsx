"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mail, KeyRound, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/**
 * Two jobs in one route:
 *  - "request": ask for an email, send the reset link
 *  - "set": the user arrived from that link and now picks a new password
 * Which one runs depends on whether a recovery session exists.
 */
type Stage = "request" | "sent" | "set" | "done";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const p = locale === "en" ? "" : `/${locale}`;
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>(
    searchParams.get("stage") === "set" ? "set" : "request"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Arriving from the email link, Supabase puts us in a recovery session.
  useEffect(() => {
    if (stage !== "set") return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) setError(t("resetLinkInvalid"));
    });
  }, [stage, t]);

  async function sendResetLink() {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) { setError(t("errorInvalidEmail")); return; }
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`${p}/reset-password?stage=set`)}`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setStage("sent");
  }

  async function saveNewPassword() {
    if (password.length < MIN_PASSWORD) { setError(t("passwordTooShort")); return; }
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setStage("done");
    setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
  }

  const inputClass =
    "w-full h-11 pl-9 pr-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all";

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
        <Link href={p || "/"} className="flex items-center gap-2 mb-8" style={{ textDecoration: "none" }}>
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-bold tracking-tight">AI Marketplace</span>
        </Link>

        {stage === "sent" || stage === "done" ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="size-16 rounded-2xl bg-primary/15 border border-primary/40 grid place-items-center glow-primary mb-6">
              <CheckCircle2 className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {stage === "done" ? t("newPasswordTitle") : t("resetSentTitle")}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              {stage === "done" ? t("passwordUpdated") : t("resetSentBody", { email })}
            </p>
            {stage === "sent" && (
              <Link href={`${p}/register?skip_role=1`} className="mt-6 text-xs text-primary hover:underline">
                {t("backToSignIn")}
              </Link>
            )}
          </div>
        ) : stage === "set" ? (
          <>
            <h1 className="text-3xl font-bold tracking-tight">{t("newPasswordTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("newPasswordSubtitle")}</p>

            <div className="mt-8 space-y-3">
              <div className="relative">
                <KeyRound className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("newPasswordPlaceholder")}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && saveNewPassword()}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-destructive px-1">{error}</p>}

              <button
                onClick={saveNewPassword}
                disabled={loading || !password}
                className="w-full h-11 rounded-xl bg-gradient-primary text-white font-medium glow-primary hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <>{t("newPasswordCta")} <ArrowRight className="size-4" /></>}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">{t("resetTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("resetSubtitle")}</p>

            <div className="mt-8 space-y-3">
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && sendResetLink()}
                  className={inputClass}
                />
              </div>

              {error && <p className="text-xs text-destructive px-1">{error}</p>}

              <button
                onClick={sendResetLink}
                disabled={loading || !email.trim()}
                className="w-full h-11 rounded-xl bg-gradient-primary text-white font-medium glow-primary hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <>{t("resetCta")} <ArrowRight className="size-4" /></>}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href={`${p}/register?skip_role=1`} className="text-primary hover:underline">
                {t("backToSignIn")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
