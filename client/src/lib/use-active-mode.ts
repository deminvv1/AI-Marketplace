import { useState, useEffect } from "react";

import { normalizeRole, type AppRole } from "@/lib/roles";

export type ActiveMode = "CLIENT" | "FREELANCER";

export function useActiveMode(userRole?: string) {
  const [mode, setModeState] = useState<ActiveMode>("CLIENT");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("activeMode") as ActiveMode | null;
    const role = normalizeRole(userRole) as AppRole | null;
    if (role === "CLIENT") {
      setModeState("CLIENT");
      return;
    }
    if (role === "FREELANCER") {
      setModeState("FREELANCER");
      return;
    }
    if (saved === "CLIENT" || saved === "FREELANCER") {
      setModeState(saved);
    } else if (saved === "CUSTOMER") {
      setModeState("CLIENT");
    } else if (saved === "EXECUTOR") {
      setModeState("FREELANCER");
    }
  }, [userRole]);

  function setMode(m: ActiveMode) {
    setModeState(m);
    localStorage.setItem("activeMode", m);
  }

  return { mode, setMode, mounted };
}
