import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="size-16 rounded-2xl glass border border-border/60 grid place-items-center mb-4">
        <Icon className="size-7 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 h-9 px-5 rounded-xl bg-gradient-primary text-white text-xs font-medium glow-primary hover:opacity-90 transition"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center gap-2 h-9 px-5 rounded-xl bg-gradient-primary text-white text-xs font-medium glow-primary hover:opacity-90 transition"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
