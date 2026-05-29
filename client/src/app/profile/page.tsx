"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getMyProfile, updateProfile, type MyProfile } from "@/app/actions/profile";
import {
  getMyCompletedProjects,
  type CompletedProjectsMine,
} from "@/app/actions/projects";
import { getReviewsForUser, type ReviewItem } from "@/app/actions/reviews";
import { StatusBadge } from "@/components/ui-bits";
import { flag } from "@/lib/mock-data";
import { formatPostedAt, projectStatusForUi } from "@/lib/projects";
import { getTaxonomy, type TaxonomyCategory } from "@/app/actions/taxonomy";
import { CategoryMultiPicker } from "@/components/category-picker";
import { PortfolioTab } from "@/app/profile/portfolio-tab";
import { ReviewsList } from "@/components/reviews-list";
import {
  Edit2, Save, X, Plus, Star, CheckCircle2,
  MessageCircle, Loader2, Globe, CalendarDays, Briefcase, Eye,
} from "lucide-react";

type Tab = "about" | "portfolio" | "offers" | "completed" | "reviews";

const TABS: { key: Tab; label: string }[] = [
  { key: "about", label: "About" },
  { key: "portfolio", label: "Portfolio" },
  { key: "offers", label: "Solutions" },
  { key: "completed", label: "Completed Projects" },
  { key: "reviews", label: "Reviews" },
];

type CompletedProjectRow = CompletedProjectsMine["asClient"][number];

function CompletedProjectsSection({
  title,
  empty,
  projects,
  showFreelancer = true,
}: {
  title: string;
  empty: string;
  projects: CompletedProjectRow[];
  showFreelancer?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-semibold mb-4">{title}</h2>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block p-4 rounded-xl bg-white/5 border border-border hover:border-primary/40 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {p.industry && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary">
                        {p.industry}
                      </span>
                    )}
                    {p.budget && <span>{p.budget}</span>}
                    {p.country && (
                      <span>
                        {flag(p.country)} {p.country}
                      </span>
                    )}
                    <span>{formatPostedAt(p.createdAt)}</span>
                    {showFreelancer && p.freelancer?.username && (
                      <span>
                        · Freelancer @{p.freelancer.username}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={projectStatusForUi(p.status)} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formFromData(data: MyProfile) {
  return {
    firstName: data.profile?.firstName ?? "",
    lastName: data.profile?.lastName ?? "",
    bio: data.profile?.bio ?? "",
    specialization: data.profile?.specialization ?? "",
    industries: data.profile?.industries ?? [],
    experience: data.profile?.experience ?? "",
    country: data.profile?.country ?? "",
    phone: data.profile?.phone ?? "",
  };
}

export default function ProfilePage() {
  const [data, setData] = useState<MyProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", bio: "", specialization: "",
    industries: [] as string[], experience: "", country: "", phone: "",
  });
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [myReviews, setMyReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [completed, setCompleted] = useState<CompletedProjectsMine | null>(null);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [completedError, setCompletedError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== "reviews" || !data?.id) return;
    let cancelled = false;
    setReviewsLoading(true);
    (async () => {
      const res = await getReviewsForUser(data.id);
      if (!cancelled) {
        if (Array.isArray(res)) setMyReviews(res);
        setReviewsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, data?.id]);

  useEffect(() => {
    if (activeTab !== "completed") return;
    let cancelled = false;
    setCompletedLoading(true);
    setCompletedError(null);
    (async () => {
      const res = await getMyCompletedProjects();
      if (cancelled) return;
      if ("error" in res && res.error) {
        setCompletedError(res.error);
        setCompleted(null);
      } else if (res && "asClient" in res) {
        setCompleted(res);
      }
      setCompletedLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const reload = useCallback(async () => {
    const d = await getMyProfile();
    if (d) {
      setData(d);
      setForm(formFromData(d));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    getTaxonomy().then((res) => {
      if (Array.isArray(res)) setCategories(res);
    });
  }, []);

  function startEdit() { setEditing(true); setError(""); }
  function cancelEdit() {
    if (!data) return;
    setEditing(false);
    setForm(formFromData(data));
    setError("");
  }
  async function save() {
    setSaving(true);
    setError("");
    const result = await updateProfile(form);
    setSaving(false);
    if (!result || !("success" in result) || !result.success) {
      setError("error" in result && result.error ? result.error : "Failed to save.");
      return;
    }
    await reload();
    setEditing(false);
  }
  if (!data) {
    return (
      <AppShell title="Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const displayName =
    [editing ? form.firstName : data.profile?.firstName, editing ? form.lastName : data.profile?.lastName]
      .filter(Boolean).join(" ") ||
    data.username ||
    data.email.split("@")[0];

  const initials = displayName.slice(0, 2).toUpperCase();
  const memberYear = new Date(data.createdAt).getFullYear();
  const specTags: string[] = (editing ? form.specialization : (data.profile?.specialization ?? ""))
    .split(",").map((s: string) => s.trim()).filter(Boolean);
  const industries: string[] = editing ? form.industries : (data.profile?.industries ?? []);

  return (
    <AppShell title="">
      {/* ── Break out of AppShell padding ── */}
      <div className="-mx-8 -mt-8">

        {/* Banner */}
        <div
          className="h-36 w-full"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 30%, #4f46e5 60%, #0ea5e9 100%)" }}
        />

        {/* Profile header */}
        <div className="px-8 pb-5 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex items-end gap-5 -mt-12">

            {/* Avatar */}
            <div className="size-24 rounded-2xl bg-gradient-primary border-[3px] border-background grid place-items-center text-2xl font-bold text-white flex-shrink-0 glow-primary select-none z-10">
              {initials}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {/* Name */}
                  {editing ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        placeholder="First name"
                        className="w-36 h-9 px-3 rounded-lg bg-white/5 border border-border text-base font-bold focus:outline-none focus:border-primary transition-all"
                      />
                      <input
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        placeholder="Last name"
                        className="w-36 h-9 px-3 rounded-lg bg-white/5 border border-border text-base font-bold focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold tracking-tight mt-2">{displayName}</h2>
                  )}

                  {/* Username + public link */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {data.username ? (
                      <>
                        <span className="text-sm text-muted-foreground">@{data.username}</span>
                        <Link
                          href={`/freelancers/${data.username}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Public page →
                        </Link>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Set username in Settings to get a public page
                      </span>
                    )}
                    {editing ? (
                      <input
                        value={form.country}
                        onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                        placeholder="Country"
                        className="w-24 h-6 px-2 rounded-md bg-white/5 border border-border text-xs focus:outline-none focus:border-primary transition-all"
                      />
                    ) : data.profile?.country ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-border text-muted-foreground">
                        {data.profile.country}
                      </span>
                    ) : null}
                  </div>

                  {/* Rating + specialization */}
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                    {(data.profile?.rating ?? 0) > 0 && (
                      <>
                        <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                          <Star className="size-3.5 fill-yellow-400" />
                          {data.profile!.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span>{data.profile!.reviewsCount} reviews</span>
                        {data.profile?.specialization && <span>·</span>}
                      </>
                    )}
                    {data.profile?.specialization && (
                      <span>{data.profile.specialization.split(",")[0].trim()}</span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-3 flex-shrink-0">
                  {editing ? (
                    <>
                      <button
                        onClick={cancelEdit}
                        className="h-9 px-4 rounded-lg bg-white/5 border border-border text-sm hover:bg-white/10 transition flex items-center gap-2"
                      >
                        <X className="size-4" /> Cancel
                      </button>
                      <button
                        onClick={save}
                        disabled={saving}
                        className="h-9 px-4 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startEdit}
                      className="h-9 px-4 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition flex items-center gap-2"
                    >
                      <Edit2 className="size-4" /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b border-border/60 bg-background/60 backdrop-blur-xl flex gap-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mt-6 grid grid-cols-3 gap-6">

        {/* Main — 2/3 */}
        <div className="col-span-2 space-y-5">
          {activeTab === "about" && (
            <>
              {/* About card */}
              <div className="glass rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold">About</h3>

                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell others about yourself…"
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.profile?.bio || (
                      <span className="italic text-muted-foreground/50">
                        No bio yet — click "Edit Profile" to add one.
                      </span>
                    )}
                  </p>
                )}

                {/* Specialization */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Specialization
                  </p>
                  {editing ? (
                    <input
                      value={form.specialization}
                      onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                      placeholder="e.g. NLP, LLM fine-tuning, RAG systems"
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {specTags.length > 0 ? (
                        specTags.map((tag) => (
                          <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-border">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm italic text-muted-foreground/50">Not specified</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Industries */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Industries
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/5 border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                    {industries.length === 0 && !editing && (
                      <span className="text-sm italic text-muted-foreground/50">Not specified</span>
                    )}
                  </div>
                  {editing && categories.length > 0 && (
                    <CategoryMultiPicker
                      categories={categories}
                      selected={form.industries}
                      onChange={(names) =>
                        setForm((f) => ({ ...f, industries: names }))
                      }
                    />
                  )}
                </div>

                {/* Experience */}
                {(editing || data.profile?.experience) && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Experience
                    </p>
                    {editing ? (
                      <textarea
                        value={form.experience}
                        onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                        placeholder="Describe your background…"
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all resize-none"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {data.profile?.experience}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Portfolio cases are managed in the{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("portfolio")}
                  className="text-primary hover:underline"
                >
                  Portfolio tab
                </button>
                .
              </p>
            </>
          )}

          {activeTab === "portfolio" && (
            <PortfolioTab
              items={data.profile?.portfolioItems ?? []}
              onChanged={reload}
            />
          )}

          {activeTab === "offers" && (
            <div className="glass rounded-2xl p-10 text-center space-y-4">
              <p className="text-muted-foreground text-sm">
                Publish and manage your ready-made AI solutions.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/solutions/new"
                  className="h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-medium"
                >
                  Publish solution
                </Link>
                <Link href="/solutions" className="h-10 px-5 rounded-xl border border-border text-sm">
                  Browse catalog
                </Link>
              </div>
            </div>
          )}

          {activeTab === "completed" && (
            <div className="space-y-6">
              {completedLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : completedError ? (
                <p className="text-sm text-destructive">{completedError}</p>
              ) : (
                <>
                  <CompletedProjectsSection
                    title="Posted as client"
                    empty="No completed projects you posted yet."
                    projects={completed?.asClient ?? []}
                  />
                  <CompletedProjectsSection
                    title="Worked as freelancer"
                    empty="No completed projects you delivered on yet."
                    projects={completed?.asFreelancer ?? []}
                    showFreelancer={false}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Reviews about you</h2>
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ReviewsList
                  reviews={myReviews}
                  emptyMessage="No reviews yet. Reviews appear after clients rate completed projects."
                />
              )}
            </div>
          )}
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-sm">Quick stats</h3>
            {[
              { icon: CheckCircle2, label: "Projects completed", value: data.profile?.completedProjectsCount ?? 0, color: "text-green-400" },
              { icon: Star, label: "Rating", value: (data.profile?.rating ?? 0) > 0 ? `${data.profile!.rating.toFixed(1)} / 5` : "—", color: "text-yellow-400" },
              { icon: Globe, label: "Languages", value: data.profile?.language || "—", color: "text-primary" },
              { icon: MessageCircle, label: "Reviews", value: data.profile?.reviewsCount ?? 0, color: "text-blue-400" },
              { icon: Eye, label: "Profile views", value: data.profile?.viewCount ?? 0, color: "text-primary" },
              { icon: CalendarDays, label: "Member since", value: memberYear, color: "text-muted-foreground" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon className={`size-4 ${color}`} />
                  {label}
                </span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* Availability */}
          <div className="glass rounded-2xl p-5 flex items-start gap-3">
            <div className="size-9 rounded-xl bg-green-500/15 border border-green-500/30 grid place-items-center flex-shrink-0">
              <Briefcase className="size-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Open to new projects</p>
              <p className="text-xs text-muted-foreground mt-0.5">Available now</p>
            </div>
          </div>

          {/* Phone (edit mode only) */}
          {editing && (
            <div className="glass rounded-2xl p-5 space-y-2">
              <label className="text-xs text-muted-foreground">
                Phone <span className="text-muted-foreground/50">(private)</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
