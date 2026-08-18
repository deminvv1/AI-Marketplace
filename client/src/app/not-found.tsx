"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("app");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl bg-gradient-primary" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.62 0.25 295)" }} />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="size-16 rounded-2xl bg-gradient-primary grid place-items-center glow-primary">
            <Sparkles className="size-8 text-white" />
          </div>
        </div>

        {/* 404 */}
        <div className="text-[120px] sm:text-[160px] font-black leading-none text-gradient select-none">
          404
        </div>

        <h1 className="mt-2 text-2xl font-bold text-foreground">{t("not_found.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {t("not_found.desc")}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition"
          >
            <Home className="size-4" />
            {t("common.go_home")}
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl glass border border-border text-sm font-medium hover:bg-muted/60 transition"
          >
            <Search className="size-4" />
            {t("common.search")}
          </Link>
          <button
            type="button"
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="size-4" />
            {t("common.go_back")}
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-border/40">
          <p className="text-xs text-muted-foreground mb-3">{t("common.orJumpTo")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { href: "/dashboard", label: t("nav.dashboard") },
              { href: "/projects", label: t("nav.projects") },
              { href: "/specialists", label: t("nav.freelancers") },
              { href: "/forum", label: t("nav.forum") },
              { href: "/messages", label: t("nav.messages") },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-xs glass border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
