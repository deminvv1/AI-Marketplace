"use client";

/** Новая тема: POST /api/forum/posts */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createForumPost } from "@/app/actions/forum";
import { getTaxonomy, type TaxonomyCategory, type TaxonomySkill } from "@/app/actions/taxonomy";
import { SkillTagPicker } from "@/components/skill-tag-picker";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export default function NewForumTopicPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [allSkills, setAllSkills] = useState<TaxonomySkill[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [industry, setIndustry] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTaxonomy().then((res) => {
      if (Array.isArray(res)) {
        setCategories(res);
        setAllSkills(res.flatMap((c) => c.skills));
        if (res[0]) setIndustry(res[0].name);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createForumPost({
      title,
      content,
      industry: industry || undefined,
      tags: tags.length ? tags : undefined,
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
            {categories.map((i) => (
              <option key={i.id} value={i.name}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        {allSkills.length > 0 && (
          <SkillTagPicker skills={allSkills} selected={tags} onChange={setTags} />
        )}
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
