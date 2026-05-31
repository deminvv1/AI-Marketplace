"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
import { getCountryCoords } from "@/lib/country-coords";

const EarthGlobe = dynamic(
  () => import("@/components/globe/EarthGlobe"),
  { ssr: false }
);

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
  const country =
    COUNTRIES.find((c) => c.toLowerCase() === raw.toLowerCase()) ?? raw;

  const coords = getCountryCoords(country);

  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setIsAuthed(!!data.user));
  }, []);

  function handleRoleSelect(role: "CLIENT" | "FREELANCER") {
    document.cookie = `pending_role=${role}; path=/; max-age=3600`;
    router.push("/register");
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-16">
      {/* Three.js Globe */}
      <div className="absolute inset-0" aria-hidden="true">
        <EarthGlobe
          lat={coords.lat}
          lng={coords.lng}
          onReady={() => setReady(true)}
        />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />

      {/* Page content — fades in after globe animation */}
      <div
        className={`relative z-10 max-w-6xl w-full text-center transition-all duration-1000 ${
          ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
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
          {isAuthed === null ? (
            <div className="md:col-span-2 h-[200px]" />
          ) : isAuthed ? (
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
              <button
                onClick={() => handleRoleSelect("CLIENT")}
                className="group glass glass-hover rounded-2xl p-8 text-left w-full"
              >
                <div className="size-14 rounded-2xl bg-primary/15 border border-primary/40 grid place-items-center glow-primary">
                  <Briefcase className="size-7 text-primary" />
                </div>
                <h3 className="mt-6 text-2xl font-bold">I'm a Client</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Post AI projects, browse solutions, and hire freelancers
                  from 62 countries.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-primary text-sm font-medium">
                  Continue as Client{" "}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </span>
              </button>

              <button
                onClick={() => handleRoleSelect("FREELANCER")}
                className="group glass glass-hover rounded-2xl p-8 text-left w-full"
              >
                <div className="size-14 rounded-2xl bg-secondary/15 border border-secondary/40 grid place-items-center glow-secondary">
                  <Code2 className="size-7 text-secondary" />
                </div>
                <h3 className="mt-6 text-2xl font-bold">I'm a Freelancer</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Offer your AI expertise, sell ready solutions, and find
                  projects worldwide.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-secondary text-sm font-medium">
                  Continue as Freelancer{" "}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </span>
              </button>
            </>
          )}
        </div>

        <div className="mt-20">
          <h2 className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            Platform sections
          </h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: MessagesSquare,
                label: "Forum",
                desc: "Discuss AI topics globally",
              },
              {
                icon: ShoppingBag,
                label: "Solutions",
                desc: "Browse ready-made AI products",
              },
              {
                icon: ClipboardList,
                label: "Projects",
                desc: "Post or find AI projects",
              },
              {
                icon: Users,
                label: "Freelancers",
                desc: "Find AI specialists worldwide",
              },
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
