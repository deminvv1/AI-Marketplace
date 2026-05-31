"use client";

import { useEffect, useState } from "react";
import {
  getTaxonomy,
  type TaxonomyCategory,
  type TaxonomySkill,
} from "@/app/actions/taxonomy";

/** Единая загрузка справочника для каталогов и форм */
export function useTaxonomy() {
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [skills, setSkills] = useState<TaxonomySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTaxonomy().then((res) => {
      if (cancelled) return;
      if ("error" in res && res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      if (Array.isArray(res)) {
        setCategories(res);
        setSkills(res.flatMap((c) => c.skills));
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, skills, loading, error };
}
