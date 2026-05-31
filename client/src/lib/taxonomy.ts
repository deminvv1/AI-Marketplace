import type { TaxonomySkill } from "@/app/actions/taxonomy";

export function skillLabel(
  slug: string,
  skills?: TaxonomySkill[],
): string {
  const hit = skills?.find((s) => s.slug === slug);
  return hit?.name ?? slug.replace(/-/g, " ");
}

export function proposalStatusLabel(
  proposalStatus: string,
  projectStatus?: string,
): { label: string; hint?: string } {
  if (proposalStatus === "ACCEPTED") {
    return { label: "Hired", hint: "You were selected for this project" };
  }
  if (proposalStatus === "REJECTED") {
    if (projectStatus === "IN_PROGRESS" || projectStatus === "COMPLETED") {
      return {
        label: "Not selected",
        hint: "Another freelancer was hired",
      };
    }
    return { label: "Declined", hint: "Client declined your proposal" };
  }
  if (proposalStatus === "PENDING") {
    return { label: "Pending", hint: "Waiting for client decision" };
  }
  return { label: proposalStatus };
}
