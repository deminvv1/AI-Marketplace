import { useState, useEffect } from "react";

export type ActiveMode = "CUSTOMER" | "EXECUTOR";

export function useActiveMode(userRole?: string) {
  const [mode, setModeState] = useState<ActiveMode>("CUSTOMER");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("activeMode") as ActiveMode | null;
    // If user only has one role, lock mode to that role
    if (userRole === "CUSTOMER") {
      setModeState("CUSTOMER");
      return;
    }
    if (userRole === "EXECUTOR") {
      setModeState("EXECUTOR");
      return;
    }
    // BOTH — use saved preference or default to CUSTOMER
    if (saved === "CUSTOMER" || saved === "EXECUTOR") {
      setModeState(saved);
    }
  }, [userRole]);

  function setMode(m: ActiveMode) {
    setModeState(m);
    localStorage.setItem("activeMode", m);
  }

  return { mode, setMode, mounted };
}
