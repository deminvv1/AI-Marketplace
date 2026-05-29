"use client";

import { useState } from "react";
import { Ban, Flag, Loader2 } from "lucide-react";
import { blockUser } from "@/app/actions/blocks";
import { createReport } from "@/app/actions/reports";

const REPORT_TYPES = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "other", label: "Other" },
] as const;

type Props = {
  targetId: string;
  targetType: "user" | "project" | "forum_post" | "solution";
  targetLabel?: string;
};

export function UserSafetyActions({ targetId, targetType, targetLabel }: Props) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState("spam");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState<"report" | "block" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleReport() {
    setBusy("report");
    setMsg(null);
    const res = await createReport({
      type: reportType,
      targetId,
      targetType,
      description: description.trim() || undefined,
    });
    setBusy(null);
    if ("error" in res && res.error) {
      setMsg(res.error);
      return;
    }
    setMsg("Report submitted. Our team will review it.");
    setReportOpen(false);
    setDescription("");
  }

  async function handleBlock() {
    if (targetType !== "user") return;
    if (!confirm(`Block ${targetLabel ?? "this user"}? They will not be able to message you.`)) {
      return;
    }
    setBusy("block");
    setMsg(null);
    const res = await blockUser(targetId);
    setBusy(null);
    if ("error" in res && res.error) setMsg(res.error);
    else setMsg("User blocked.");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setReportOpen((v) => !v)}
        className="h-9 px-3 rounded-lg border border-border text-xs inline-flex items-center gap-1.5 hover:border-primary/40"
      >
        <Flag className="size-3.5" />
        Report
      </button>
      {targetType === "user" && (
        <button
          type="button"
          disabled={busy === "block"}
          onClick={handleBlock}
          className="h-9 px-3 rounded-lg border border-destructive/40 text-destructive text-xs inline-flex items-center gap-1.5 hover:bg-destructive/10 disabled:opacity-60"
        >
          {busy === "block" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Ban className="size-3.5" />
          )}
          Block
        </button>
      )}
      {msg && <span className="text-xs text-muted-foreground w-full">{msg}</span>}
      {reportOpen && (
        <div className="w-full glass rounded-xl p-4 space-y-3 border border-border">
          <p className="text-xs text-muted-foreground">
            Report {targetLabel ?? "content"} to moderators.
          </p>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-white/5 border border-border text-sm"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm resize-none"
          />
          <button
            type="button"
            disabled={busy === "report"}
            onClick={handleReport}
            className="h-8 px-4 rounded-lg bg-gradient-primary text-white text-xs disabled:opacity-60"
          >
            {busy === "report" ? "Sending…" : "Submit report"}
          </button>
        </div>
      )}
    </div>
  );
}
