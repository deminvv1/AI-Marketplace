"use client";

import type { TaxonomySkill } from "@/app/actions/taxonomy";
import { skillLabel } from "@/lib/taxonomy";

type Props = {
  skills: TaxonomySkill[];
  selected: string[];
  onChange: (slugs: string[]) => void;
  label?: string;
  hint?: string;
};

export function SkillTagPicker({
  skills,
  selected,
  onChange,
  label = "Skills",
  hint = "Choose from the list — filters stay accurate.",
}: Props) {
  function toggle(slug: string) {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium">{label}</label>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => {
          const on = selected.includes(s.slug);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.slug)}
              className={`h-8 px-3 rounded-lg text-xs border transition ${
                on
                  ? "bg-primary/15 border-primary/50 text-primary"
                  : "bg-white/5 border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {skillLabel(s.slug, skills)}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected: {selected.map((s) => skillLabel(s, skills)).join(", ")}
        </p>
      )}
    </div>
  );
}
