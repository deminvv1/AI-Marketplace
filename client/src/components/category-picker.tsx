"use client";

import type { TaxonomyCategory } from "@/app/actions/taxonomy";

type Props = {
  categories: TaxonomyCategory[];
  value: string;
  onChange: (name: string) => void;
  label?: string;
};

/** Одна industry (Category.name) — сетка как на /projects/new */
export function CategoryPicker({
  categories,
  value,
  onChange,
  label = "Industry",
}: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.name)}
            className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 transition ${
              value === c.name
                ? "bg-primary/15 border-primary/50 glow-primary"
                : "bg-white/5 border-border hover:border-primary/40"
            }`}
          >
            <span className="text-xl">{c.icon ?? "🌐"}</span>
            <span className="text-[10px] font-medium text-center px-1 leading-tight">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

type MultiProps = {
  categories: TaxonomyCategory[];
  selected: string[];
  onChange: (names: string[]) => void;
  label?: string;
};

export function CategoryMultiPicker({
  categories,
  selected,
  onChange,
  label = "Industries",
}: MultiProps) {
  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((n) => n !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const on = selected.includes(c.name);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.name)}
              className={`h-8 px-3 rounded-lg text-xs border inline-flex items-center gap-1.5 ${
                on
                  ? "bg-primary/15 border-primary/50 text-primary"
                  : "bg-white/5 border-border text-muted-foreground"
              }`}
            >
              <span>{c.icon}</span>
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
