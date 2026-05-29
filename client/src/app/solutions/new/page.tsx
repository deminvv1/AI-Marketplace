"use client";

/**
 * Публикация Solution: POST /api/solutions (FREELANCER / BOTH)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { INDUSTRIES } from "@/lib/mock-data";
import { createSolution } from "@/app/actions/solutions";
import { SOLUTION_FORMATS } from "@/lib/solutions";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export default function NewSolutionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]?.name ?? "");
  const [format, setFormat] = useState<string>(SOLUTION_FORMATS[0]);
  const [price, setPrice] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("English");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createSolution({
      title,
      description,
      preview: preview || undefined,
      industry: industry || undefined,
      format,
      price: price || undefined,
      country: country || undefined,
      language: language || undefined,
      tags: tagList.length ? tagList : undefined,
      isPublished: true,
    });

    setSubmitting(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if ("id" in result) {
      router.push(`/solutions/${result.id}`);
      router.refresh();
    }
  }

  return (
    <AppShell title="Publish solution">
      <Link
        href="/solutions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> Back to catalog
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
            placeholder="MediScan Pro — radiology triage SaaS"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Short preview</label>
          <input
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
            placeholder="One-line pitch for the card"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            required
            minLength={20}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-border text-sm resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
            >
              {SOLUTION_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="$499 / mo"
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
            />
          </div>
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

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Language</label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="LLM, NLP, SaaS"
            className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="h-10 px-6 rounded-xl bg-gradient-primary text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Publish
        </button>
      </form>
    </AppShell>
  );
}
