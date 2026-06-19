"use client";

import { useState } from "react";
import { Languages, Loader2, RotateCcw } from "lucide-react";
import { translateText } from "@/app/actions/translate";
import { useI18n } from "@/lib/i18n";

interface Props {
  text: string;
  onTranslated: (text: string | null) => void;
  translated: boolean;
}

export function TranslateButton({ text, onTranslated, translated }: Props) {
  const { locale } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (translated) {
    return (
      <button
        type="button"
        onClick={() => { onTranslated(null); setError(null); }}
        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
      >
        <RotateCcw className="size-3" />
        Show original
      </button>
    );
  }

  async function handle() {
    setBusy(true);
    setError(null);
    const res = await translateText(text, locale);
    setBusy(false);
    if ("error" in res) { setError(res.error); return; }
    onTranslated(res.translated);
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={handle}
        className="inline-flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-3 animate-spin" /> : <Languages className="size-3" />}
        Translate
      </button>
      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </span>
  );
}
