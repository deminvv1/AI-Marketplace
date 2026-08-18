"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mail, ArrowRight, Sparkles, CheckCircle2, Loader2, LogIn, LogOut, Lock, KeyRound, Eye, EyeOff, Briefcase, Laptop } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { checkEmail } from "@/app/actions/check-email";
import { PROVIDERS } from "@/components/auth/providers";

type Role = "CLIENT" | "FREELANCER";
type Step = "role" | "form" | "sent-link" | "sent-confirm";
type Mode = "signup" | "signin";
type Method = "password" | "link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function setCookie(name: string, value: string, maxAge = 3600) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// ── Role picker ───────────────────────────────────────────────────────────────
function RoleSelect({ onSelect }: { onSelect: (role: Role) => void }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [hovered, setHovered] = useState<Role | null>(null);
  const loginHref = `${locale === "en" ? "" : `/${locale}`}/register?skip_role=1`;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "linear-gradient(160deg, #f8f9ff 0%, #f0f4ff 50%, #faf5ff 100%)",
        fontFamily: "system-ui, -apple-system, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 56 }}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#6366f1"/>
          <circle cx="16" cy="9"  r="2.6" fill="white"/>
          <circle cx="9"  cy="23" r="2.6" fill="white"/>
          <circle cx="23" cy="23" r="2.6" fill="white"/>
          <line x1="16" y1="9"  x2="9"  y2="23" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="16" y1="9"  x2="23" y2="23" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="9"  y1="23" x2="23" y2="23" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "#111827" }}>
          AI Marketplace
        </span>
      </div>

      <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", textAlign: "center", marginBottom: 12 }}>
        {t("welcomeTitle")}
      </h1>
      <p style={{ fontSize: "1rem", color: "#6b7280", marginBottom: 48, textAlign: "center" }}>
        {t("roleQuestion")}
      </p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 600 }}>
        {([
          {
            role: "CLIENT" as Role,
            label: t("roleClient"),
            sub: t("roleClientSub"),
            icon: Briefcase,
            grad: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 60%, #f5f3ff 100%)",
            gradHover: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 60%, #ede9fe 100%)",
            iconColor: "#6366f1",
          },
          {
            role: "FREELANCER" as Role,
            label: t("roleSpecialist"),
            sub: t("roleSpecialistSub"),
            icon: Laptop,
            grad: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 60%, #eef2ff 100%)",
            gradHover: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 60%, #e0e7ff 100%)",
            iconColor: "#8b5cf6",
          },
        ]).map(({ role, label, sub, icon: Icon, grad, gradHover, iconColor }) => (
          <button
            key={role}
            onMouseEnter={() => setHovered(role)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(role)}
            style={{
              flex: "1 1 220px",
              maxWidth: 260,
              border: hovered === role ? "2px solid #6366f1" : "2px solid #e5e7eb",
              borderRadius: 16,
              padding: "0 0 28px",
              cursor: "pointer",
              background: "#fff",
              transition: "all 0.18s",
              boxShadow: hovered === role
                ? "0 8px 32px rgba(99,102,241,0.18)"
                : "0 2px 8px rgba(0,0,0,0.06)",
              transform: hovered === role ? "translateY(-2px)" : "none",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <div style={{
              height: 180,
              background: hovered === role ? gradHover : grad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              transition: "background 0.18s",
            }}>
              <Icon size={56} style={{ color: iconColor, opacity: 0.75 }} strokeWidth={1.2} />
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              {label} →
            </div>
            <div style={{ fontSize: "0.88rem", color: "#6b7280" }}>{sub}</div>
          </button>
        ))}
      </div>

      <p style={{ marginTop: 48, fontSize: "0.88rem", color: "#6b7280" }}>
        {t("haveAccount")}{" "}
        <Link href={loginHref} style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
          {t("logIn")}
        </Link>
      </p>
    </div>
  );
}

// ── Register / sign-in form ───────────────────────────────────────────────────
function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const p = locale === "en" ? "" : `/${locale}`;

  const searchParams = useSearchParams();

  // Derived on the first render, not in an effect — otherwise the role picker
  // paints first and is then swapped for the form, which reads as a glitch.
  const authError = searchParams.get("error");
  const signedOut = searchParams.get("signed-out") === "1";
  const authRequired = searchParams.get("auth") === "required";
  const skipRole = searchParams.get("skip_role") === "1";
  const startOnForm = Boolean(authError) || signedOut || authRequired || skipRole;

  const [step, setStep] = useState<Step>(startOnForm ? "form" : "role");
  const [mode, setMode] = useState<Mode>(
    signedOut || authRequired || skipRole ? "signin" : "signup"
  );
  const [method, setMethod] = useState<Method>("password");
  const [role, setRole] = useState<Role>("CLIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    authError ? (authError === "link_expired" ? t("errorLinkExpired") : t("errorGeneric")) : ""
  );
  const [notice, setNotice] = useState<"signed-out" | "auth-required" | null>(
    signedOut ? "signed-out" : authRequired ? "auth-required" : null
  );
  const [existingAccount, setExistingAccount] = useState(false);

  function handleRoleSelect(r: Role) {
    setRole(r);
    setCookie("pending_role", r);
    setMode("signup");
    setStep("form");
  }

  function switchMode() {
    setMode((m) => (m === "signup" ? "signin" : "signup"));
    setError("");
    setExistingAccount(false);
    setNotice(null);
  }

  async function handleEmailBlur() {
    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) return;
    const { exists } = await checkEmail(trimmed);
    setExistingAccount(exists);
    if (exists) setError("");
  }

  async function handleOAuth(provider: string) {
    setError("");
    if (mode === "signup") setCookie("pending_role", role);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provider: provider as any,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(t("errorProviderDisabled"));
  }

  /** Maps Supabase's English auth errors onto our translated copy. */
  function translateAuthError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("invalid login credentials")) return t("wrongCredentials");
    if (m.includes("email not confirmed")) return t("emailNotConfirmed");
    if (m.includes("already registered") || m.includes("already been registered")) return t("emailInUse");
    if (m.includes("password")) return t("passwordTooShort");
    return message;
  }

  async function handlePasswordSubmit() {
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(t("errorInvalidEmail"));
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(t("passwordTooShort"));
      return;
    }
    setError("");
    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      setCookie("pending_role", role);
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) { setError(translateAuthError(error.message)); return; }
      // A session right away means email confirmation is switched off.
      if (data.session) { window.location.href = "/auth/callback?verified=1"; return; }
      setStep("sent-confirm");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    setLoading(false);
    if (error) { setError(translateAuthError(error.message)); return; }
    window.location.href = "/auth/callback?verified=1";
  }

  async function handleMagicLink() {
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(t("errorInvalidEmail"));
      return;
    }
    setError("");
    setLoading(true);
    if (mode === "signup") setCookie("pending_role", role);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(translateAuthError(error.message));
    else setStep("sent-link");
  }

  const submit = method === "password" ? handlePasswordSubmit : handleMagicLink;

  if (step === "role") {
    return <RoleSelect onSelect={handleRoleSelect} />;
  }

  const isReturning = mode === "signin" || existingAccount;
  const title = existingAccount && mode === "signup"
    ? t("welcomeBackTitle")
    : mode === "signin" ? t("signInTitle") : t("createTitle");
  const subtitle = existingAccount && mode === "signup"
    ? t("welcomeBackSubtitle")
    : mode === "signin" ? t("signInSubtitle") : t("createSubtitle");

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

        {notice === "signed-out" && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800">
            <LogOut className="size-4 shrink-0" />
            <p className="text-sm">{t("signedOut")}</p>
          </div>
        )}
        {notice === "auth-required" && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800">
            <Lock className="size-4 shrink-0" />
            <p className="text-sm">{t("signInRequired")}</p>
          </div>
        )}

        {step === "sent-link" || step === "sent-confirm" ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="size-16 rounded-2xl bg-primary/15 border border-primary/40 grid place-items-center glow-primary mb-6">
              <CheckCircle2 className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {step === "sent-confirm" ? t("confirmTitle") : t("sentTitle")}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              {step === "sent-confirm"
                ? t("confirmBody", { email })
                : isReturning
                  ? t("sentSignIn", { email })
                  : t("sentRegister", { email })}
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              {t("wrongEmail")}{" "}
              <button
                onClick={() => { setStep("form"); setError(""); setExistingAccount(false); }}
                className="text-primary hover:underline"
              >
                {t("goBack")}
              </button>
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

            {PROVIDERS.length > 0 && (
              <>
                <div className="mt-8 space-y-3">
                  {PROVIDERS.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => handleOAuth(pr.provider)}
                      className="w-full h-11 rounded-xl bg-white/5 border border-border hover:border-primary/50 hover:bg-white/10 transition flex items-center justify-center gap-3 text-sm font-medium"
                    >
                      <span
                        className="size-5 rounded-md grid place-items-center text-xs font-bold text-white"
                        style={{ background: pr.brand }}
                        aria-hidden="true"
                      >
                        {pr.mark}
                      </span>
                      {t("continueWith", { provider: pr.name })}
                    </button>
                  ))}
                </div>

                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex-1 h-px bg-border" />{t("or")}
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            <div className={PROVIDERS.length > 0 ? "space-y-3" : "mt-8 space-y-3"}>
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); setExistingAccount(false); }}
                  onBlur={handleEmailBlur}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className={inputClass}
                />
              </div>

              {method === "password" && (
                <div className="relative">
                  <KeyRound className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
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
              )}

              {existingAccount && mode === "signup" && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <LogIn className="size-4 text-primary flex-shrink-0" />
                  <p className="text-xs text-primary">{t("emailInUse")}</p>
                </div>
              )}

              {error && <p className="text-xs text-destructive px-1">{error}</p>}

              <button
                onClick={submit}
                disabled={loading || !email.trim() || (method === "password" && !password)}
                className="w-full h-11 rounded-xl bg-gradient-primary text-white font-medium glow-primary hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : method === "link" ? (
                  <>{isReturning ? t("sendSignInLink") : t("sendMagicLink")} <ArrowRight className="size-4" /></>
                ) : (
                  <>{mode === "signin" ? t("signInCta") : t("signUpCta")} <ArrowRight className="size-4" /></>
                )}
              </button>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => { setMethod((m) => (m === "password" ? "link" : "password")); setError(""); }}
                  className="text-xs text-muted-foreground hover:text-primary transition text-left"
                >
                  {method === "password" ? t("useMagicLink") : t("usePassword")}
                </button>
                {method === "password" && mode === "signin" && (
                  <Link href={`${p}/reset-password`} className="text-xs text-muted-foreground hover:text-primary transition whitespace-nowrap">
                    {t("forgotPassword")}
                  </Link>
                )}
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground leading-relaxed">
              {t.rich("termsNote", {
                terms: (chunks) => (
                  <Link href={`${p}/terms`} className="text-primary hover:underline">{chunks}</Link>
                ),
                privacy: (chunks) => (
                  <Link href={`${p}/privacy-policy`} className="text-primary hover:underline">{chunks}</Link>
                ),
              })}
            </p>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? t("newHere") : t("haveAccount")}{" "}
              <button onClick={switchMode} className="text-primary hover:underline font-medium">
                {mode === "signin" ? t("createNewAccount") : t("logIn")}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
