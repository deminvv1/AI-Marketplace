"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Save, User, Shield, AlertTriangle,
  Mail, AtSign, Briefcase, Eye, Clock, Phone, CheckCircle2, LogOut, ToggleLeft,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  getSettings, updateAccount, updatePrivacy, deleteAccount,
} from "@/app/actions/settings";
import { useActiveMode } from "@/lib/use-active-mode";
import { createClient } from "@/lib/supabase/client";
import { normalizeRole } from "@/lib/roles";

type Role = "CLIENT" | "FREELANCER" | "BOTH";
const ROLES: Role[] = ["CLIENT", "FREELANCER", "BOTH"];

type Settings = Awaited<ReturnType<typeof getSettings>>;
type Tab = "account" | "privacy" | "danger";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "account", label: "Account", icon: User },
  { key: "privacy", label: "Privacy", icon: Shield },
  { key: "danger", label: "Danger Zone", icon: AlertTriangle },
];

/* ── Toggle ─────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-white/10 border border-border"
      }`}
    >
      <div
        className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

/* ── Section wrapper ─────────────────────────────── */
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center flex-shrink-0">
          <Icon className="size-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="border-t border-border/60 pt-5 space-y-4">{children}</div>
    </div>
  );
}

/* ── Field row ───────────────────────────────────── */
function Field({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="size-4 text-muted-foreground flex-shrink-0" />}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────── */
export default function SettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("account");

  // Account form
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Active mode (CLIENT/FREELANCER toggle for BOTH role)
  const { mode, setMode, mounted: modeMounted } = useActiveMode(data?.role);
  const [loggingOut, setLoggingOut] = useState(false);

  // Privacy form
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    onlineVisible: true,
    lastSeenVisible: true,
    emailVisible: false,
    phoneVisible: false,
  });
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMsg, setPrivacyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Delete account
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getSettings().then((d) => {
      setData(d);
      setUsername(d.username ?? "");
      setRole((normalizeRole(d.role) ?? "CLIENT") as Role);
      setPrivacy({
        profileVisible: d.privacy?.profileVisible ?? true,
        onlineVisible: d.privacy?.onlineVisible ?? true,
        lastSeenVisible: d.privacy?.lastSeenVisible ?? true,
        emailVisible: d.privacy?.emailVisible ?? false,
        phoneVisible: d.privacy?.phoneVisible ?? false,
      });
    });
  }, []);

  function cancelAccount() {
    if (!data) return;
    setUsername(data.username ?? "");
    setRole((normalizeRole(data.role) ?? "CLIENT") as Role);
    setAccountMsg(null);
  }

  function cancelPrivacy() {
    if (!data) return;
    setPrivacy({
      profileVisible: data.privacy?.profileVisible ?? true,
      onlineVisible: data.privacy?.onlineVisible ?? true,
      lastSeenVisible: data.privacy?.lastSeenVisible ?? true,
      emailVisible: data.privacy?.emailVisible ?? false,
      phoneVisible: data.privacy?.phoneVisible ?? false,
    });
    setPrivacyMsg(null);
  }

  async function saveAccount() {
    setAccountSaving(true);
    setAccountMsg(null);
    const result = await updateAccount({ username, role });
    setAccountSaving(false);
    if ("error" in result) {
      setAccountMsg({ ok: false, text: result.error });
    } else {
      setAccountMsg({ ok: true, text: "Account settings saved." });
      setData((prev: any) => prev ? { ...prev, username, role } : null);
    }
  }

  async function savePrivacy() {
    setPrivacySaving(true);
    setPrivacyMsg(null);
    const result = await updatePrivacy(privacy);
    setPrivacySaving(false);
    setPrivacyMsg("success" in result
      ? { ok: true, text: "Privacy settings saved." }
      : { ok: false, text: "Failed to save." }
    );
  }

  async function handleDelete() {
    if (!data || deleteInput !== data.username) return;
    setDeleting(true);
    await deleteAccount();
    router.push("/register");
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/register");
  }

  if (!data) {
    return (
      <AppShell title="Settings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings">
      <div className="max-w-2xl space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-primary/20 border border-primary/40 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Account */}
        {activeTab === "account" && (
          <Section icon={User} title="Account" description="Manage your login details and role on the platform.">
            <Field icon={Mail} label="Email" hint="Managed by your auth provider">
              <span className="text-sm text-muted-foreground bg-white/5 border border-border px-3 py-1.5 rounded-lg">
                {data.authEmail}
              </span>
            </Field>

            <Field icon={AtSign} label="Username" hint="Visible to other users">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                <input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setAccountMsg(null); }}
                  placeholder="yourname"
                  className="w-48 h-9 pl-7 pr-3 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </Field>

            <Field icon={Briefcase} label="Role" hint="You can switch at any time">
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setAccountMsg(null); }}
                    className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${
                      role === r
                        ? "bg-primary/20 border border-primary/50 text-primary"
                        : "bg-white/5 border border-border text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </Field>

            {modeMounted && data.role === "BOTH" && (
              <Field icon={ToggleLeft} label="Active mode" hint="Which role you act as right now">
                <div className="flex gap-2">
                  {(["CLIENT", "FREELANCER"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${
                        mode === m
                          ? "bg-primary/20 border border-primary/50 text-primary"
                          : "bg-white/5 border border-border text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {m.charAt(0) + m.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {accountMsg && (
              <p className={`text-xs px-1 ${accountMsg.ok ? "text-green-400" : "text-destructive"}`}>
                {accountMsg.text}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={saveAccount}
                  disabled={accountSaving}
                  className="h-9 px-5 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {accountSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save changes
                </button>
                <button
                  onClick={cancelAccount}
                  disabled={accountSaving}
                  className="h-9 px-4 rounded-xl bg-white/5 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-9 px-4 rounded-xl bg-destructive/15 border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                Log out
              </button>
            </div>
          </Section>
        )}

        {/* Privacy */}
        {activeTab === "privacy" && (
          <Section icon={Shield} title="Privacy" description="Control what other users can see on your profile.">
            {([
              { key: "profileVisible", icon: Eye, label: "Profile visible to others", hint: "Other users can find and view your profile" },
              { key: "onlineVisible", icon: CheckCircle2, label: "Show online status", hint: "Others see when you're active" },
              { key: "lastSeenVisible", icon: Clock, label: "Show last seen", hint: "Others see when you were last online" },
              { key: "emailVisible", icon: Mail, label: "Show email publicly", hint: "Visible on your public profile" },
              { key: "phoneVisible", icon: Phone, label: "Show phone publicly", hint: "Visible on your public profile" },
            ] as const).map(({ key, icon, label, hint }) => (
              <Field key={key} icon={icon} label={label} hint={hint}>
                <Toggle
                  checked={privacy[key]}
                  onChange={(v) => { setPrivacy((p) => ({ ...p, [key]: v })); setPrivacyMsg(null); }}
                />
              </Field>
            ))}

            {privacyMsg && (
              <p className={`text-xs px-1 ${privacyMsg.ok ? "text-green-400" : "text-destructive"}`}>
                {privacyMsg.text}
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={savePrivacy}
                disabled={privacySaving}
                className="h-9 px-5 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
              >
                {privacySaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save changes
              </button>
              <button
                onClick={cancelPrivacy}
                disabled={privacySaving}
                className="h-9 px-4 rounded-xl bg-white/5 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </Section>
        )}

        {/* Danger Zone */}
        {activeTab === "danger" && (
          <div className="glass rounded-2xl p-6 space-y-5 border border-destructive/30">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-destructive/15 border border-destructive/30 grid place-items-center flex-shrink-0">
                <AlertTriangle className="size-4 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-destructive">Danger Zone</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Permanent actions — cannot be undone.</p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-5 space-y-4">
              <div>
                <p className="text-sm font-medium">Delete account</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All your data, orders, messages, and offers will be permanently deleted.
                  Type your username{" "}
                  <span className="text-foreground font-medium">@{data.username}</span>{" "}
                  to confirm.
                </p>
              </div>

              <input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={data.username ?? "username"}
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:border-destructive transition-all"
              />

              <button
                onClick={handleDelete}
                disabled={deleting || deleteInput !== data.username}
                className="h-9 px-5 rounded-xl bg-destructive/15 border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/25 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <AlertTriangle className="size-4" />}
                Delete my account
              </button>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
