import type { SolutionListItem } from "@/app/actions/solutions";

export function solutionAuthorName(s: SolutionListItem["freelancer"]): string {
  const first = s.profile?.firstName?.trim();
  const last = s.profile?.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  if (s.username) return `@${s.username}`;
  return "Author";
}

export const SOLUTION_FORMATS = ["SaaS", "API", "Script", "Consultation", "Other"] as const;
