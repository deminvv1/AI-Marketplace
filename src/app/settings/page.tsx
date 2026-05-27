"use client";

import { AppShell } from "@/components/app-shell";

export default function Settings() {
  return (
    <AppShell title="Settings">
      <div className="glass rounded-2xl p-12 text-center">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-2">Account, notifications, language, and privacy.</p>
      </div>
    </AppShell>
  );
}
