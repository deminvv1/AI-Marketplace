import { api } from "@/lib/api";

export type TaxonomySkill = {
  id: string;
  name: string;
  slug: string;
};

export type TaxonomyCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  skills: TaxonomySkill[];
};

export async function getTaxonomy() {
  try {
    return await api.get<TaxonomyCategory[]>("/taxonomy");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load taxonomy";
    return { error: message };
  }
}

export async function getSkills() {
  try {
    return await api.get<TaxonomySkill[]>("/taxonomy/skills");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load skills";
    return { error: message };
  }
}
