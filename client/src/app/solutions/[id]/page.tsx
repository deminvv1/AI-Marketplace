"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getMe } from "@/app/actions/me";
import {
  deleteSolution,
  getSolution,
  updateSolution,
  type SolutionListItem,
} from "@/app/actions/solutions";
import { solutionAuthorName } from "@/lib/solutions";
import { Stars } from "@/components/ui-bits";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

export default function SolutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [item, setItem] = useState<SolutionListItem | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [result, me] = await Promise.all([getSolution(id), getMe()]);
      if ("error" in result && result.error) setError(result.error);
      else if (result && "id" in result) setItem(result as SolutionListItem);
      setMeId(me?.id ?? null);
      setLoading(false);
    })();
  }, [id]);

  const isOwner = !!(item && meId && item.freelancer.id === meId);

  async function handleDelete() {
    if (!id || !confirm("Delete this solution permanently?")) return;
    setDeleting(true);
    const result = await deleteSolution(id);
    setDeleting(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    router.push("/solutions");
    router.refresh();
  }

  async function handleTogglePublish() {
    if (!item || !id) return;
    setToggling(true);
    const result = await updateSolution(id, {
      title: item.title,
      description: item.description,
      isPublished: !item.isPublished,
    });
    setToggling(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if ("id" in result) setItem(result);
  }

  if (loading) {
    return (
      <AppShell title="Solution">
        <div className="flex justify-center py-24">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error || !item) {
    return (
      <AppShell title="Solution">
        <p className="text-destructive text-sm">{error ?? "Not found"}</p>
        <Link href="/solutions" className="text-primary text-sm mt-4 inline-block">
          ← Catalog
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={item.title}>
      <Link
        href="/solutions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> All solutions
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          {item.preview && (
            <p className="text-lg text-muted-foreground">{item.preview}</p>
          )}
          <div className="glass rounded-2xl p-6 text-sm whitespace-pre-wrap leading-relaxed">
            {item.description}
          </div>
          <div className="flex flex-wrap gap-2">
            {item.format && (
              <span className="px-3 py-1 rounded-lg bg-primary/15 text-primary text-sm border border-primary/30">
                {item.format}
              </span>
            )}
            {item.industry && (
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-border text-sm">
                {item.industry}
              </span>
            )}
            {item.tags.map((t) => (
              <span key={t} className="px-2 py-1 rounded-md text-xs bg-white/5 border border-border">
                {t}
              </span>
            ))}
          </div>
          <p className="text-2xl font-bold">{item.price || "Price on request"}</p>
          <p className="text-xs text-muted-foreground">{item.viewsCount} views</p>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-sm mb-3">Author</h2>
            {item.freelancer.username ? (
              <Link
                href={`/freelancers/${item.freelancer.username}`}
                className="text-primary hover:underline font-medium"
              >
                {solutionAuthorName(item.freelancer)}
              </Link>
            ) : (
              <span>{solutionAuthorName(item.freelancer)}</span>
            )}
            {(item.freelancer.profile?.rating ?? 0) > 0 && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                <Stars value={item.freelancer.profile!.rating} />
                {item.freelancer.profile!.rating.toFixed(1)}
              </div>
            )}
            <Link
              href="/messages"
              className="mt-4 w-full h-10 rounded-xl bg-gradient-primary text-white text-sm font-medium grid place-items-center"
            >
              Contact
            </Link>
          </div>

          {isOwner && (
            <>
              <div className="glass rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Status: {item.isPublished ? "Published" : "Hidden from catalog"}
                </p>
                <button
                  type="button"
                  disabled={toggling}
                  onClick={handleTogglePublish}
                  className="w-full h-10 rounded-xl border border-border text-sm hover:border-primary/50 disabled:opacity-60"
                >
                  {toggling ? "…" : item.isPublished ? "Unpublish" : "Publish"}
                </button>
              </div>
              <div className="glass rounded-2xl p-6 border border-destructive/20">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="w-full h-10 rounded-xl border border-destructive/50 text-destructive text-sm inline-flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Delete solution
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
