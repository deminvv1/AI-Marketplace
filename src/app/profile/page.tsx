"use client"; // Добавляем директиву для безопасного импорта клиентского AppShell

import { AppShell } from "@/components/app-shell";

export default function ProfilePage() {
  return (
    <AppShell title="Profile">
      <div className="glass rounded-2xl p-12 text-center">
        <h2 className="text-2xl font-bold">Your profile</h2>
        <p className="text-muted-foreground mt-2">
          Edit your public profile, avatar, bio, and specialization.
        </p>
      </div>
    </AppShell>
  );
}
