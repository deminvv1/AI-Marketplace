import type { MessageParticipant } from "@/app/actions/messages";

export function messageUserName(u: MessageParticipant | null): string {
  if (!u) return "Unknown";
  const first = u.profile?.firstName?.trim();
  const last = u.profile?.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  if (u.username) return `@${u.username}`;
  return "User";
}

export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
