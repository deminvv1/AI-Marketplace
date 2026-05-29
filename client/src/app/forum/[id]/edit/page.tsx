"use client";

/** Редактирование темы: PATCH /api/forum/posts/:id — только автор */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { INDUSTRIES } from "@/lib/mock-data";
import { getMe } from "@/app/actions/me";
import { getForumPost, updateForumPost } from "@/app/actions/forum";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export default function EditForumTopicPage() {
  const params = useParams();
  const router = useRouter();
  const postId = typeof params.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [industry, setIndustry] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      const [result, me] = await Promise.all([getForumPost(postId), getMe()]);
      if ("error" in result && result.error) {
        setForbidden(result.error);
        setLoading(false);
        return;
      }
      if (!("id" in result) || !("authorId" in result)) {
        setForbidden("Topic not found");
        setLoading(false);
        return;
      }

      if (!me?.id || me.id !== result.authorId) {
        setForbidden("Only the author can edit this topic");
        setLoading(false);
        return;
      }

      setTitle(result.title);
      setContent(result.content);
      setIndustry(result.industry ?? "");
      setTags(result.tags?.join(", ") ?? "");
      setLoading(false);
    })();
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateForumPost(postId, {
      title,
      content,
      industry: industry || undefined,
      tags: tagList.length ? tagList : undefined,
    });

    setSubmitting(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    router.push(`/forum/${postId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <AppShell title="Edit topic">
        <div className="flex justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (forbidden) {
    return (
      <AppShell title="Edit topic">
        <p className="text-destructive text-sm">{forbidden}</p>
        <Link href={`/forum/${postId}`} className="text-primary text-sm mt-4 inline-block">
          ← Back
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit topic">
      <Link
        href={`/forum/${postId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> Back to topic
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl glass rounded-2xl p-8 space-y-5">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            required
            minLength={5}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-2 w-full h-10 px-3 rounded-xl bg-white/5 border border-border text-sm"
          >
            <option value="">—</option>
            {INDUSTRIES.map((i) => (
              <option key={i.name} value={i.name}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Content</label>
          <textarea
            required
            minLength={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-border text-sm resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-2 w-full h-10 px-3 rounded-xl bg-white/5 border border-border text-sm"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="h-10 px-6 rounded-xl bg-gradient-primary text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Save changes
        </button>
      </form>
    </AppShell>
  );
}
