/** Хелперы отображения форума на клиенте */

export function forumAuthorName(author: {
  username: string | null;
  profile: { firstName: string | null; lastName: string | null } | null;
}): string {
  const first = author.profile?.firstName?.trim();
  const last = author.profile?.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  if (author.username) return `@${author.username}`;
  return "Member";
}

export function formatForumTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
