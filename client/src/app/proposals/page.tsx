"use client";

/**
 * Мои отклики (фрилансер): GET /api/proposals/mine
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getMyProposals, type ProposalItem } from "@/app/actions/proposals";
import { projectStatusForUi } from "@/lib/projects";
import { proposalStatusLabel } from "@/lib/taxonomy";
import { StatusBadge } from "@/components/ui-bits";
import { ArrowLeft, Loader2, Send } from "lucide-react";

export default function MyProposalsPage() {
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getMyProposals();
      if ("error" in res && res.error) setError(res.error);
      else if (Array.isArray(res)) setItems(res);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell title="My proposals">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> Browse projects
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center">
          <Send className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My proposals</h2>
          <p className="text-sm text-muted-foreground">
            Track status of projects you applied to.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          No proposals yet.{" "}
          <Link href="/projects" className="text-primary hover:underline">
            Find a project
          </Link>
          .
        </div>
      )}

      <ul className="space-y-3 max-w-3xl">
        {items.map((p) => {
          const ps = proposalStatusLabel(p.status, p.project?.status);
          return (
          <li key={p.id}>
            <Link
              href={p.project ? `/projects/${p.project.id}` : `/projects/${p.projectId}`}
              className="block glass rounded-xl p-4 hover:border-primary/40 border border-transparent transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {p.project?.title ?? "Project"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                    {p.project?.client?.username && (
                      <span>Client @{p.project.client.username}</span>
                    )}
                    {p.proposedBudget && <span>· {p.proposedBudget}</span>}
                    {p.estimatedDays != null && (
                      <span>· {p.estimatedDays} days</span>
                    )}
                  </div>
                  {ps.hint && (
                    <p className="text-xs text-muted-foreground mt-1">{ps.hint}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] uppercase tracking-widest font-medium ${
                      p.status === "ACCEPTED"
                        ? "text-green-400"
                        : p.status === "REJECTED"
                          ? "text-muted-foreground"
                          : "text-primary"
                    }`}
                  >
                    {ps.label}
                  </span>
                  {p.project && (
                    <StatusBadge status={projectStatusForUi(p.project.status)} />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {p.coverLetter}
              </p>
            </Link>
          </li>
        );
        })}
      </ul>
    </AppShell>
  );
}
