"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (localStorage.getItem("show_welcome") !== "1") return;
    localStorage.removeItem("show_welcome");
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const start = Date.now();
    const duration = 5000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        setVisible(false);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 glass rounded-2xl p-5 shadow-2xl border border-primary/30 glow-primary animate-in slide-in-from-bottom-4 fade-in duration-300">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-primary/15 border border-primary/40 grid place-items-center flex-shrink-0">
          <CheckCircle2 className="size-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">Welcome to AI Marketplace!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your account has been successfully created.
          </p>
        </div>
      </div>

      <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
