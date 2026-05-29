"use client";

import type { TaxonomyCategory, TaxonomySkill } from "@/app/actions/taxonomy";
import { skillLabel } from "@/lib/taxonomy";

type IndustryListProps = {
  categories: TaxonomyCategory[];
  value: string | null;
  onChange: (name: string | null) => void;
  title?: string;
  allLabel?: string;
};

/** Вертикальный список industry (каталог projects / forum) */
export function CatalogIndustryList({
  categories,
  value,
  onChange,
  title = "Industries",
  allLabel = "All industries",
}: IndustryListProps) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
        {title}
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`w-full px-3 py-2 rounded-lg text-sm text-left transition ${
              !value
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:bg-white/5"
            }`}
          >
            {allLabel}
          </button>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onChange(c.name)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                value === c.name
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <span>{c.icon ?? "🌐"}</span>
              {c.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type SkillChipsProps = {
  skills: TaxonomySkill[];
  value: string | null;
  onChange: (slug: string | null) => void;
  title?: string;
  className?: string;
};

/** Фильтр по skill slug — чипы */
export function CatalogSkillChips({
  skills,
  value,
  onChange,
  title = "Skills",
  className = "",
}: SkillChipsProps) {
  if (skills.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`h-8 px-3 rounded-lg text-xs border transition ${
            !value
              ? "border-primary/50 text-primary bg-primary/10"
              : "border-border text-muted-foreground hover:border-primary/40"
          }`}
        >
          All skills
        </button>
        {skills.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(value === s.slug ? null : s.slug)}
            className={`h-8 px-3 rounded-lg text-xs border transition ${
              value === s.slug
                ? "border-primary/50 text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {skillLabel(s.slug, skills)}
          </button>
        ))}
      </div>
    </div>
  );
}

type IndustryChipsProps = {
  categories: TaxonomyCategory[];
  value: string | null;
  onChange: (name: string | null) => void;
};

/** Горизонтальные чипы industry (solutions) */
export function CatalogIndustryChips({
  categories,
  value,
  onChange,
}: IndustryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`h-8 px-3 rounded-lg text-xs ${
          !value ? "text-primary" : "text-muted-foreground"
        }`}
      >
        All industries
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.name)}
          className={`h-8 px-3 rounded-lg text-xs border ${
            value === c.name
              ? "border-primary/50 text-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          {c.icon} {c.name}
        </button>
      ))}
    </div>
  );
}
