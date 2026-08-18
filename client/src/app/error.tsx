"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Home, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("app");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.62 0.3 25)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl bg-gradient-primary" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="size-16 rounded-2xl bg-gradient-primary grid place-items-center glow-primary">
            <Sparkles className="size-8 text-white" />
          </div>
        </div>

        {/* Error icon */}
        <div className="flex justify-center mb-4">
          <div className="size-20 rounded-full bg-destructive/10 border border-destructive/30 grid place-items-center">
            <AlertTriangle className="size-10 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">{t("error.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {t("error.desc")}
        </p>

        {error.digest && (
          <p className="mt-2 text-[11px] text-muted-foreground/60 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition"
          >
            <RefreshCw className="size-4" />
            {t("common.try_again")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl glass border border-border text-sm font-medium hover:bg-muted/60 transition"
          >
            <Home className="size-4" />
            {t("common.go_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
