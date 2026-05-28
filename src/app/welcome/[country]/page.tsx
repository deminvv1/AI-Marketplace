"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Code2,
  MessagesSquare,
  ShoppingBag,
  ClipboardList,
  Users,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import { COUNTRIES, flag } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

function fromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function WelcomePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: slug } = use(params);
  const raw = fromSlug(slug);
  const country = COUNTRIES.find(
    (c) => c.toLowerCase() === raw.toLowerCase()
  ) ?? raw;

  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setIsAuthed(!!data.user));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(1px 1px at 70% 80%, white, transparent), radial-gradient(1px 1px at 40% 60%, white, transparent), radial-gradient(1px 1px at 90% 20%, white, transparent)",
          backgroundSize: "400px 400px",
        }}
      />

      <div className="relative max-w-6xl w-full text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Country selected · {flag(country)} {country}
        </span>

        <h1 className="mt-8 text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          {"You've arrived at the first"}
          <br />
          <span className="text-gradient">international platform</span>
          <br />
          uniting AI specialists and clients
          <br />
          from around the world.
        </h1>
        <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">
          Join us — build, hire, learn and ship the next generation of AI
          products together.
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {isAuthed ? (
            <div className="md:col-span-2 flex justify-center">
              <Link
                href="/dashboard"
                className="group glass glass-hover rounded-2xl p-8 text-left flex items-center gap-6 max-w-sm w-full"
              >
                <div className="size-14 rounded-2xl bg-primary/15 border border-primary/40 grid place-items-center glow-primary flex-shrink-0">
                  <LayoutDashboard className="size-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Go to Dashboard</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You're already signed in.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-medium">
                    Open Dashboard{" "}
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href={`/register?role=customer`}
                className="group glass glass-hover rounded-2xl p-8 text-left"
              >
                <div className="size-14 rounded-2xl bg-primary/15 border border-primary/40 grid place-items-center glow-primary">
                  <Briefcase className="size-7 text-primary" />
                </div>
                <h3 className="mt-6 text-2xl font-bold">I'm a Customer</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Post AI projects, browse ready offers, and hire specialists
                  from 62 countries.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-primary text-sm font-medium">
                  Continue as Customer{" "}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </span>
              </Link>

              <Link
                href={`/register?role=executor`}
                className="group glass glass-hover rounded-2xl p-8 text-left"
              >
                <div className="size-14 rounded-2xl bg-secondary/15 border border-secondary/40 grid place-items-center glow-secondary">
                  <Code2 className="size-7 text-secondary" />
                </div>
                <h3 className="mt-6 text-2xl font-bold">I'm an Executor</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Offer your AI expertise, sell ready solutions, and find
                  projects worldwide.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-secondary text-sm font-medium">
                  Continue as Executor{" "}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </span>
              </Link>
            </>
          )}
        </div>

        <div className="mt-20">
          <h2 className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            Platform sections
          </h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: MessagesSquare, label: "Forum", desc: "Discuss AI topics globally" },
              { icon: ShoppingBag, label: "Ready Offers", desc: "Browse AI solutions for sale" },
              { icon: ClipboardList, label: "Orders", desc: "Post or find AI projects" },
              { icon: Users, label: "Executors", desc: "Find AI specialists worldwide" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass glass-hover rounded-2xl p-6 text-left">
                <div className="size-10 rounded-xl bg-primary/15 border border-primary/40 grid place-items-center">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="mt-4 font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
