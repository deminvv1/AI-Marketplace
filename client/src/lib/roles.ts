export type AppRole = "CLIENT" | "FREELANCER" | "BOTH" | "ADMIN";

export const VALID_ROLES: AppRole[] = ["CLIENT", "FREELANCER", "BOTH", "ADMIN"];

/** Maps legacy enum values from cookies / old sessions. */
export function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  const map: Record<string, AppRole> = {
    CLIENT: "CLIENT",
    FREELANCER: "FREELANCER",
    BOTH: "BOTH",
    ADMIN: "ADMIN",
    CUSTOMER: "CLIENT",
    EXECUTOR: "FREELANCER",
  };
  return map[role] ?? null;
}
