"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import {
  addFavorite,
  checkFavorite,
  removeFavorite,
} from "@/app/actions/favorites";

type Props = {
  targetId: string;
  targetType: "freelancer" | "project" | "solution";
  className?: string;
};

/** Toggle избранного через /api/favorites */
export function FavoriteButton({ targetId, targetType, className = "" }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await checkFavorite(targetId, targetType);
      if (!cancelled) {
        setFavorited(!!res.favorited);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [targetId, targetType]);

  async function toggle() {
    if (busy || loading) return;
    setBusy(true);
    const next = !favorited;
    const result = next
      ? await addFavorite(targetId, targetType)
      : await removeFavorite(targetId, targetType);
    setBusy(false);
    const failed =
      result &&
      typeof result === "object" &&
      "error" in result &&
      !!(result as { error?: string }).error;
    if (!failed) setFavorited(next);
  }

  return (
    <button
      type="button"
      disabled={loading || busy}
      onClick={toggle}
      title={favorited ? "Remove from saved" : "Save"}
      className={`h-10 px-4 rounded-xl border text-sm font-medium inline-flex items-center gap-2 transition disabled:opacity-60 ${
        favorited
          ? "border-accent/50 bg-accent/15 text-accent"
          : "border-border hover:border-primary/40"
      } ${className}`}
    >
      <Bookmark className={`size-4 ${favorited ? "fill-current" : ""}`} />
      {favorited ? "Saved" : "Save"}
    </button>
  );
}
