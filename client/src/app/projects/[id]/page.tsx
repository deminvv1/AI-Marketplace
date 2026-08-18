"use client";

/**
 * Карточка проекта + отклики.
 * Заказчик: accept/reject → freelancerId + IN_PROGRESS.
 * Фрилансер: форма отклика (если OPEN).
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui-bits";
import { getMe } from "@/app/actions/me";
import {
  completeProject,
  deleteProject,
  getProject,
  type ProjectDetail,
} from "@/app/actions/projects";
import {
  acceptProposal,
  createProposal,
  getMyProposalOnProject,
  getProjectProposals,
  rejectProposal,
  type ProposalItem,
} from "@/app/actions/proposals";
import { flag } from "@/lib/countries";
import { useTaxonomy } from "@/lib/use-taxonomy";
import { skillLabel } from "@/lib/taxonomy";
import { normalizeRole } from "@/lib/roles";
import { useActiveMode } from "@/lib/use-active-mode";
import {
  formatDeadline,
  formatPostedAt,
  freelancerDisplayName,
  projectStatusForUi,
} from "@/lib/projects";
import {
  createReview,
  getReviewForProject,
  type ReviewItem,
} from "@/app/actions/reviews";
import { FavoriteButton } from "@/components/favorite-button";
import { UserSafetyActions } from "@/components/user-safety-actions";
import { ReviewsList } from "@/components/reviews-list";
import { ArrowLeft, Loader2, Pencil, Send, Star, Trash2 } from "lucide-react";
import { TranslateButton } from "@/components/translate-button";

export default function ProjectDetailPage() {
  const t = useTranslations("projectDetail");
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.id === "string" ? params.id : "";
  const { skills } = useTaxonomy();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>();
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [myProposal, setMyProposal] = useState<ProposalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mode, mounted } = useActiveMode(userRole);
  const isOwner = !!(project && meId && project.client.id === meId);
  const canPropose =
    mounted &&
    project?.status === "OPEN" &&
    !isOwner &&
    mode === "FREELANCER";

  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [proposalActionId, setProposalActionId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [projectReview, setProjectReview] = useState<ReviewItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);

  const loadProjectData = useCallback(async () => {
    const [projResult, me] = await Promise.all([getProject(projectId), getMe()]);

    if ("error" in projResult && projResult.error) {
      setError(projResult.error);
      return;
    }
    if (!("id" in projResult)) {
      setError(t("projectNotFound"));
      return;
    }

    const proj = projResult as ProjectDetail;
    setProject(proj);
    setUserRole(me?.role);
    setMeId(me?.id ?? null);

    const role = normalizeRole(me?.role);

    if (me?.id && proj.client.id === me.id) {
      const list = await getProjectProposals(projectId);
      if (Array.isArray(list)) setProposals(list);
      if (proj.status === "COMPLETED") {
        const rev = await getReviewForProject(projectId);
        if (rev && !("error" in rev)) setProjectReview(rev as ReviewItem | null);
      }
    } else if (role === "FREELANCER" || role === "BOTH") {
      const mine = await getMyProposalOnProject(projectId);
      if (mine && !("error" in mine)) setMyProposal(mine as ProposalItem | null);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    loadProjectData().finally(() => setLoading(false));
  }, [projectId, loadProjectData]);

  async function handleAccept(proposalId: string) {
    setProposalActionId(proposalId);
    const result = await acceptProposal(projectId, proposalId);
    setProposalActionId(null);
    if ("error" in result && result.error) {
      setSubmitError(result.error);
      return;
    }
    setSubmitError(null);
    await loadProjectData();
    router.refresh();
  }

  async function handleCompleteProject() {
    if (!projectId) return;
    setCompleting(true);
    const result = await completeProject(projectId);
    setCompleting(false);
    if ("error" in result && result.error) {
      setSubmitError(result.error);
      return;
    }
    setSubmitError(null);
    await loadProjectData();
    router.refresh();
  }

  async function handleDeleteProject() {
    if (!projectId) return;
    const msg =
      project?.status === "IN_PROGRESS"
        ? t("confirmDeleteAssigned")
        : t("confirmDelete");
    if (!confirm(msg)) return;

    setDeleting(true);
    const result = await deleteProject(projectId);
    setDeleting(false);

    if ("error" in result && result.error) {
      setSubmitError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleReject(proposalId: string) {
    setProposalActionId(proposalId);
    const result = await rejectProposal(projectId, proposalId);
    setProposalActionId(null);
    if ("error" in result && result.error) {
      setSubmitError(result.error);
      return;
    }
    await loadProjectData();
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project?.freelancerId) return;
    setReviewSubmitting(true);
    const result = await createReview({
      toUserId: project.freelancerId,
      rating: reviewRating,
      text: reviewText || undefined,
      projectId,
    });
    setReviewSubmitting(false);
    if ("error" in result && result.error) {
      setSubmitError(result.error);
      return;
    }
    if ("id" in result) {
      setProjectReview(result);
      setSubmitError(null);
    }
  }

  async function handleProposalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setSubmitError(null);
    setSubmitting(true);

    const days = estimatedDays ? parseInt(estimatedDays, 10) : undefined;
    const result = await createProposal(projectId, {
      coverLetter,
      proposedBudget: proposedBudget || undefined,
      estimatedDays: days,
    });

    setSubmitting(false);

    if ("error" in result && result.error) {
      setSubmitError(result.error);
      return;
    }
    if ("id" in result) {
      setMyProposal(result);
      router.refresh();
    }
  }

  if (loading) {
    return (
      <AppShell title={t("project")}>
        <div className="flex justify-center py-24 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell title={t("project")}>
        <p className="text-destructive">{error ?? t("notFound")}</p>
        <Link href="/projects" className="text-primary text-sm mt-4 inline-block">
          ← Back to projects
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={project.title}>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> {t("allProjects")}
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Левая колонка: описание заказа */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {isOwner && project.status === "OPEN" && (
                <Link
                  href={`/projects/${projectId}/edit`}
                  className="h-9 px-3 rounded-lg border border-border text-sm inline-flex items-center gap-2 hover:border-primary/40"
                >
                  <Pencil className="size-4" />
                  {t("edit")}
                </Link>
              )}
              {!isOwner && meId && (
                <UserSafetyActions
                  targetId={projectId}
                  targetType="project"
                  targetLabel={project.title}
                />
              )}
              <StatusBadge status={projectStatusForUi(project.status)} />
            </div>
          </div>

          {project.shortDescription && (
            <p className="text-lg text-muted-foreground">{project.shortDescription}</p>
          )}

          <div className="glass rounded-2xl p-6 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap">{translatedDesc ?? project.description}</p>
            {translatedDesc && (
              <p className="text-[11px] text-muted-foreground/60 mt-1 italic">{t("translated")}</p>
            )}
            <div className="mt-3">
              <TranslateButton
                text={project.description}
                translated={translatedDesc !== null}
                onTranslated={setTranslatedDesc}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.industry && (
              <span className="px-3 py-1 rounded-lg bg-primary/15 text-primary border border-primary/30 text-sm">
                {project.industry}
              </span>
            )}
            {project.country && (
              <span className="px-3 py-1 rounded-lg bg-muted/60 border border-border text-sm text-muted-foreground">
                {flag(project.country)} {project.country}
              </span>
            )}
            {project.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground"
              >
                {skillLabel(t, skills)}
              </span>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="glass rounded-xl p-4">
              <div className="text-muted-foreground">{t("budget")}</div>
              <div className="font-semibold mt-1">{project.budget || "TBD"}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-muted-foreground">{t("deadline")}</div>
              <div className="font-semibold mt-1">{formatDeadline(project.deadline)}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-muted-foreground">{t("posted")}</div>
              <div className="font-semibold mt-1">{formatPostedAt(project.createdAt)}</div>
            </div>
          </div>

          {project.client.username && (
            <p className="text-xs text-muted-foreground">
              Client: @{project.client.username}
            </p>
          )}

          {project.freelancer?.username && (
            <p className="text-sm mt-4">
              Assigned specialist:{" "}
              <Link
                href={`/specialists/${project.freelancer.username}`}
                className="text-primary hover:underline"
              >
                @{project.freelancer.username}
              </Link>
            </p>
          )}
        </div>

        {/* Правая колонка: отклики или форма */}
        <aside className="space-y-4">
          {isOwner && submitError && (
            <p className="text-sm text-destructive glass rounded-xl p-3">{submitError}</p>
          )}

          {isOwner && project.status === "IN_PROGRESS" && (
            <div className="glass rounded-2xl p-6 border border-success/30">
              <h2 className="font-semibold text-sm">{t("workInProgress")}</h2>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Mark as completed when the specialist has delivered. The project will leave the
                open catalog.
              </p>
              <button
                type="button"
                disabled={completing}
                onClick={handleCompleteProject}
                className="w-full h-10 rounded-xl bg-success/20 text-success border border-success/40 text-sm font-medium hover:bg-success/30 disabled:opacity-60"
              >
                {completing ? t("saving") : t("markCompleted")}
              </button>
            </div>
          )}

          {isOwner && project.status === "COMPLETED" && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-sm">{t("projectCompleted")}</h2>
              {projectReview ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">{t("yourReview")}</p>
                  <ReviewsList reviews={[projectReview]} />
                </div>
              ) : project.freelancerId ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {t("rateHint")}
                  </p>
                  <div>
                    <label className="text-sm font-medium">{t("rating")}</label>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          className="p-1"
                        >
                          <Star
                            className={`size-6 ${
                              n <= reviewRating
                                ? "fill-warning text-warning"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("commentOptional")}</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      className="mt-2 w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-sm resize-none"
                      placeholder={t("howWasIt")}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full h-10 rounded-xl bg-gradient-primary text-white text-sm font-medium disabled:opacity-60"
                  >
                    {reviewSubmitting ? t("submitting") : t("submitReview")}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("noSpecialist")}
                </p>
              )}
            </div>
          )}

          {!isOwner && (
            <div className="flex justify-end">
              <FavoriteButton targetId={projectId} targetType="project" />
            </div>
          )}

          {isOwner && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">
                Proposals ({proposals.length})
              </h2>
              {proposals.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noProposals")}</p>
              ) : (
                <ul className="space-y-4">
                  {proposals.map((p) => (
                    <li
                      key={p.id}
                      className="p-4 rounded-xl bg-muted/60 border border-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        {p.freelancer.username ? (
                          <Link
                            href={`/specialists/${p.freelancer.username}`}
                            className="font-medium text-sm text-primary hover:underline"
                          >
                            {freelancerDisplayName(p.freelancer)}
                          </Link>
                        ) : (
                          <span className="font-medium text-sm">
                            {freelancerDisplayName(p.freelancer)}
                          </span>
                        )}
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {p.status.toLowerCase()}
                        </span>
                      </div>
                      {p.freelancer.profile?.specialization && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {p.freelancer.profile.specialization}
                        </div>
                      )}
                      <p className="text-sm mt-2 line-clamp-4">{p.coverLetter}</p>
                      <div className="mt-2 text-xs text-muted-foreground flex gap-3">
                        {p.proposedBudget && <span>{p.proposedBudget}</span>}
                        {p.estimatedDays != null && (
                          <span>{p.estimatedDays} days</span>
                        )}
                      </div>
                      {project.status === "OPEN" && p.status === "PENDING" && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={proposalActionId !== null}
                            onClick={() => handleAccept(p.id)}
                            className="h-8 px-3 rounded-lg bg-gradient-primary text-white text-xs font-medium disabled:opacity-60"
                          >
                            {proposalActionId === p.id ? "…" : t("accept")}
                          </button>
                          <button
                            type="button"
                            disabled={proposalActionId !== null}
                            onClick={() => handleReject(p.id)}
                            className="h-8 px-3 rounded-lg border border-border text-xs hover:border-destructive/50"
                          >
                            {t("reject")}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {canPropose && !myProposal && (
            <form onSubmit={handleProposalSubmit} className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">{t("sendProposal")}</h2>
              <div>
                <label className="text-sm font-medium">{t("coverLetter")}</label>
                <textarea
                  required
                  minLength={10}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder={t("coverLetterHint")}
                  className="mt-2 w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("yourBudget")}</label>
                <input
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  placeholder="$4,000"
                  className="mt-2 w-full h-10 px-3 rounded-xl bg-muted/60 border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("estimatedDays")}</label>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  className="mt-2 w-full h-10 px-3 rounded-xl bg-muted/60 border border-border text-sm"
                />
              </div>
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-xl bg-gradient-primary text-white text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {t("sendProposal")}
              </button>
            </form>
          )}

          {myProposal && (
            <div className="glass rounded-2xl p-6 border border-primary/30">
              <h2 className="font-semibold text-primary">{t("proposalSent")}</h2>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-6">
                {myProposal.coverLetter}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                Status: {myProposal.status.toLowerCase()}
              </div>
            </div>
          )}

          {!isOwner && !canPropose && !myProposal && project.status === "OPEN" && (
            <p className="text-sm text-muted-foreground glass rounded-2xl p-6">
              Sign in as a specialist to send a proposal. Users with role BOTH can switch
              mode in the header.
            </p>
          )}

          {isOwner && (
            <div className="glass rounded-2xl p-6 border border-destructive/20">
              <h2 className="font-semibold text-sm text-destructive">{t("dangerZone")}</h2>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {t("deleteHint")}
              </p>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteProject}
                className="w-full h-10 rounded-xl border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete project
              </button>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
