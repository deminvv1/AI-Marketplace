"use client";

import Link from "next/link";
import { Stars } from "@/components/ui-bits";
import type { ReviewItem } from "@/app/actions/reviews";
import { freelancerDisplayName } from "@/lib/projects";

function reviewerName(r: ReviewItem) {
  return freelancerDisplayName({
    username: r.fromUser.username,
    profile: r.fromUser.profile,
  });
}

export function ReviewsList({
  reviews,
  emptyMessage = "No reviews yet.",
}: {
  reviews: ReviewItem[];
  emptyMessage?: string;
}) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="p-4 rounded-xl bg-white/5 border border-border"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-sm">{reviewerName(r)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
            <Stars value={r.rating} />
          </div>
          {r.project && (
            <p className="text-xs text-muted-foreground mt-2">
              Project:{" "}
              <Link
                href={`/projects/${r.project.id}`}
                className="text-primary hover:underline"
              >
                {r.project.title}
              </Link>
            </p>
          )}
          {r.text && (
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
              {r.text}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
