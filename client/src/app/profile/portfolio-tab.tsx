"use client";

import { useState } from "react";
import {
  createPortfolioItem,
  deletePortfolioItem,
  updatePortfolioItem,
  type PortfolioItem,
  type PortfolioItemInput,
} from "@/app/actions/profile";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

const PORTFOLIO_TYPES = ["case", "link", "image", "video", "text"] as const;

const emptyForm: PortfolioItemInput = {
  type: "case",
  title: "",
  content: "",
  url: "",
};

type Props = {
  items: PortfolioItem[];
  onChanged: () => void;
};

export function PortfolioTab({ items, onChanged }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PortfolioItemInput>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(item: PortfolioItem) {
    setEditingId(item.id);
    setForm({
      type: item.type,
      title: item.title ?? "",
      content: item.content ?? "",
      url: item.url ?? "",
    });
    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const payload: PortfolioItemInput = {
      type: form.type,
      title: form.title?.trim() || undefined,
      content: form.content?.trim() || undefined,
      url: form.url?.trim() || undefined,
    };

    const result = editingId
      ? await updatePortfolioItem(editingId, payload)
      : await createPortfolioItem(payload);

    setBusy(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    closeForm();
    onChanged();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this portfolio item?")) return;
    setBusy(true);
    const result = await deletePortfolioItem(id);
    setBusy(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Portfolio</h3>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="h-9 px-3 rounded-lg bg-gradient-primary text-white text-sm inline-flex items-center gap-2"
          >
            <Plus className="size-4" /> Add item
          </button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              {editingId ? "Edit item" : "New portfolio item"}
            </span>
            <button type="button" onClick={closeForm} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-white/5 border border-border text-sm"
            >
              {PORTFOLIO_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <input
              value={form.title ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-white/5 border border-border text-sm"
              placeholder="Radiology triage model"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <textarea
              value={form.content ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm resize-none"
              placeholder="What you built, stack, outcome…"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Link (optional)</label>
            <input
              value={form.url ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-white/5 border border-border text-sm"
              placeholder="https://…"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-medium disabled:opacity-60 inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {editingId ? "Save changes" : "Add to portfolio"}
          </button>
        </form>
      )}

      {items.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground text-center py-12 glass rounded-2xl">
          No portfolio items yet. Add your first case study — it will appear on your public
          freelancer page.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="glass rounded-2xl p-5 border border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-widest text-primary">
                    {item.type}
                  </span>
                  <h4 className="font-semibold mt-1">{item.title || "Untitled"}</h4>
                  {item.content && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line line-clamp-4">
                      {item.content}
                    </p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary mt-2 inline-block hover:underline"
                    >
                      {item.url}
                    </a>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="size-8 grid place-items-center rounded-lg hover:bg-white/10"
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(item.id)}
                    className="size-8 grid place-items-center rounded-lg hover:bg-destructive/20 text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
