"use client";

/** Новая тема: POST /api/forum/posts */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { INDUSTRIES } from "@/lib/mock-data";
import { createForumPost } from "@/app/actions/forum";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export default function NewForumTopicPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]?.name ?? "");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createForumPost({
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
    if ("id" in result) {
      router.push(`/forum/${result.id}`);
      router.refresh();
    }
  }

  return (
    <AppShell title="New topic">
      <Link
        href="/forum"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> Forum
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl glass rounded-2xl p-8 space-y-5">
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
          <label className="text-sm font-medium">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
          >
            {INDUSTRIES.map((i) => (
              <option key={i.name} value={i.name}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="h-10 px-6 rounded-xl bg-secondary text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Post topic
        </button>
      </form>
    </AppShell>
  );
}
