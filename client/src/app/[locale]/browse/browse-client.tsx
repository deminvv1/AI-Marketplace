"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, X, ChevronDown, Loader2, Lock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { listFreelancers, type FreelancerListItem } from "@/app/actions/freelancers";
import { CATEGORIES } from "@/lib/categories";


// Подписи переводятся, значения остаются английскими — они уходят в запрос.
const BUDGETS = [
  { key: "anyBudget", value: "" },
  { key: "under25",   value: "under25" },
  { key: "b2550",     value: "25-50" },
  { key: "b50100",    value: "50-100" },
  { key: "b100",      value: "100plus" },
];

const SORT_OPTIONS = [
  { key: "sortMatch",   value: "match" },
  { key: "sortRating",  value: "rating" },
  { key: "sortReviews", value: "reviews" },
];

function displayName(item: FreelancerListItem): string {
  const p = item.profile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(" ");
  return item.username ?? "Specialist";
}

function initials(name: string): string {
  return name.split(" ").map(n => n[0]).filter(Boolean).join("").slice(0, 2).toUpperCase();
}

function SpecialistCard({ item, registerHref, lockedLabel }: {
  item: FreelancerListItem;
  registerHref: string;
  lockedLabel: string;
}) {
  const [hovered, setHovered] = useState(false);
  const p = item.profile;
  // Guests get no name and no profile link — signing up unlocks both.
  const locked = item.anonymous || !item.username;
  const name = locked ? lockedLabel : displayName(item);

  return (
    <Link
      href={locked ? registerHref : `/specialists/${item.username}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textDecoration: "none",
        borderRadius: 12,
        border: `1px solid ${hovered ? "rgba(99,102,241,0.38)" : "#e5e7eb"}`,
        background: "#fff",
        padding: "20px",
        transition: "box-shadow 0.2s, border-color 0.2s",
        boxShadow: hovered ? "0 4px 20px rgba(99,102,241,0.13)" : "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        {item.avatarUrl ? (
          <img
            src={item.avatarUrl}
            alt={name}
            style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: "1rem",
          }}>
            {locked ? <Lock size={18} /> : initials(name)}
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "0.92rem", color: locked ? "#6b7280" : "#111827", display: "flex", alignItems: "center", gap: 6 }}>
            {locked ? <Lock size={12} style={{ color: "#9ca3af", flexShrink: 0 }} /> : null}
            {name}
            {p?.onlineStatus && (
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            )}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }}>
            {p?.specialization ?? "AI Specialist"}
            {p?.country && <span style={{ marginLeft: 6 }}>{p.country}</span>}
          </div>
        </div>
      </div>

      {p && (p.rating > 0 || p.reviewsCount > 0) && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <Star size={12} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>{p.rating.toFixed(1)}</span>
          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>({p.reviewsCount})</span>
        </div>
      )}
    </Link>
  );
}

function BrowseContent({ initialItems, apiError }: { initialItems: FreelancerListItem[]; apiError: string | null }) {
  const searchParams = useSearchParams();
  const t = useTranslations("browse");
  const tHire = useTranslations("hire");
  const tCatalog = useTranslations("catalog");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const p = locale === "en" ? "" : `/${locale}`;
  const registerHref = `${p}/register`;

  const [items, setItems] = useState<FreelancerListItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The API tells us: anonymous cards mean nobody is signed in.
  const isGuest = items.length > 0 && items.every((i) => i.anonymous);

  const [query, setQuery]       = useState(searchParams.get("q") ?? "");
  const [debouncedQ, setDebouncedQ] = useState(query);
  const [budget, setBudget]     = useState("");
  const [sort, setSort]         = useState("match");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // The first page render already carries server-fetched data, so only refetch
  // once the visitor actually changes the query.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setLoading(true);
    listFreelancers({ q: debouncedQ || undefined }).then(result => {
      if ("error" in result && result.error) setError(result.error);
      else if (Array.isArray(result)) { setItems(result); setError(null); }
      setLoading(false);
    });
  }, [debouncedQ]);

  // Client-side sort (server returns best match by default)
  const sorted = [...items].sort((a, b) => {
    if (sort === "rating") return (b.profile?.rating ?? 0) - (a.profile?.rating ?? 0);
    if (sort === "reviews") return (b.profile?.reviewsCount ?? 0) - (a.profile?.reviewsCount ?? 0);
    return 0;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      {/* Guests see the catalogue with names withheld — say so plainly. */}
      {isGuest && (
        <div style={{ background: "#eef2ff", borderBottom: "1px solid #c7d2fe", padding: "14px 24px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Lock size={16} style={{ color: "#4338ca", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#312e81" }}>{t("guestBannerTitle")}</div>
              <div style={{ fontSize: "0.82rem", color: "#4338ca", marginTop: 2 }}>{t("guestBannerText")}</div>
            </div>
            <Link
              href={registerHref}
              style={{ padding: "9px 20px", borderRadius: 30, background: "#4f46e5", color: "#fff", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
            >
              {t("guestBannerCta")}
            </Link>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "32px 24px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#111827", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
            {t("heading")}
            {!loading && (
              <span style={{ fontSize: "0.95rem", fontWeight: 400, color: "#6b7280", marginLeft: 12 }}>
                {t("count", { count: sorted.length })}
              </span>
            )}
          </h1>

          {/* Search bar */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240, display: "flex", background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, overflow: "hidden" }}>
              <Search size={16} style={{ margin: "0 12px", alignSelf: "center", color: "#9ca3af", flexShrink: 0 }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by skill, role, or name…"
                style={{ flex: 1, border: "none", outline: "none", padding: "10px 12px 10px 0", fontSize: "0.9rem", color: "#111827" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ padding: "0 12px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 16px", borderRadius: 8, border: "1px solid #d1d5db",
                background: showFilters ? "#ede9fe" : "#fff", color: showFilters ? "#4338ca" : "#374151",
                fontWeight: 500, fontSize: "0.88rem", cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={15} /> {t("filters")}
            </button>
          </div>

          {/* Filters row */}
          {showFilters && (
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <select
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  style={{ appearance: "none", padding: "8px 32px 8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "0.85rem", color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {BUDGETS.map(b => <option key={b.value} value={b.value}>{t(b.key)}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
              </div>

              <div style={{ position: "relative" }}>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  style={{ appearance: "none", padding: "8px 32px 8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "0.85rem", color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.key)}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Направления. Раньше это были кнопки, которые меняли только заголовок и
          ничего не фильтровали. Теперь каждая ведёт на свою страницу — с
          отфильтрованным списком, своим текстом и своим адресом. */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", overflowX: "auto" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 8, padding: "12px 24px", whiteSpace: "nowrap" }}>
          <span
            style={{
              padding: "6px 14px", borderRadius: 20, border: "1px solid #6366f1",
              background: "#ede9fe", color: "#4338ca", fontSize: "0.82rem",
              fontWeight: 600, whiteSpace: "nowrap",
            }}
          >
            {tCatalog("allCategories")}
          </span>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`${p}/browse/${c.slug}`}
              style={{
                padding: "6px 14px", borderRadius: 20, border: "1px solid #e5e7eb",
                background: "#fff", color: "#6b7280", fontSize: "0.82rem",
                whiteSpace: "nowrap", textDecoration: "none",
              }}
            >
              {tHire(c.nameKey)}
            </Link>
          ))}
        </div>
      </div>

      {/* Results grid */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#6366f1" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#ef4444", fontSize: "0.9rem" }}>
            {error}
          </div>
        ) : apiError && sorted.length === 0 ? (
          /* An outage must not read as "there are no specialists here". */
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: 8 }}>{t("apiDownTitle")}</div>
            <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{t("apiDownText")}</div>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: 8 }}>{t("noSpecialists")}</div>
            <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{t("adjustFilters")}</div>
            <button onClick={() => setQuery("")} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
              {t("clearFilters")}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            {sorted.map(item => (
              <SpecialistCard key={item.id} item={item} registerHref={registerHref} lockedLabel={t("lockedName")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowseClient({ initialItems, apiError }: { initialItems: FreelancerListItem[]; apiError: string | null }) {
  return (
    <Suspense>
      <BrowseContent initialItems={initialItems} apiError={apiError} />
    </Suspense>
  );
}
