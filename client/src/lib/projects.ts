/**
 * Хелперы отображения Project/Proposal на фронте.
 * В БД статусы UPPER_SNAKE (OPEN), в UI-бейджах — lower snake (open).
 */

export function projectStatusForUi(status: string): string {
  const map: Record<string, string> = {
    OPEN: "open",
    IN_PROGRESS: "in_progress",
    COMPLETED: "closed",
    CANCELLED: "closed",
  };
  return map[status] ?? status.toLowerCase();
}

export function formatPostedAt(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDeadline(iso: string | null): string {
  if (!iso) return "Flexible";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Имя для карточки отклика: profile.firstName или @username */
export function freelancerDisplayName(p: {
  username: string | null;
  profile: { firstName: string | null; lastName: string | null } | null;
}): string {
  const first = p.profile?.firstName?.trim();
  const last = p.profile?.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  if (p.username) return `@${p.username}`;
  return "Freelancer";
}
