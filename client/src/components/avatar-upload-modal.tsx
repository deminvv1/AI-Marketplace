"use client";

import { useRef, useState, useCallback } from "react";
import { X, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;

export function AvatarUploadModal({ onClose, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function validate(f: File): string {
    if (!ACCEPT.includes(f.type)) return "Only JPG, PNG, WebP or GIF are allowed.";
    if (f.size > MAX_MB * 1024 * 1024) return `File is too large. Maximum size is ${MAX_MB} MB.`;
    return "";
  }

  function pick(f: File) {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pick(dropped);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!file) return;
    setUploading(true);
    await onUpload(file);
    setUploading(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md glass rounded-2xl p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base">Profile photo</h2>
          <button
            onClick={onClose}
            className="size-8 rounded-lg bg-muted/60 border border-border grid place-items-center hover:bg-muted/80 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {preview ? (
          /* ── Preview state ── */
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={preview}
                alt="preview"
                className="size-40 rounded-2xl object-cover border-2 border-primary/40"
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {file?.name} · {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                disabled={uploading}
                className="flex-1 h-10 rounded-xl bg-muted/60 border border-border text-sm font-medium hover:bg-muted/80 transition disabled:opacity-50"
              >
                Choose another
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="flex-1 h-10 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading
                  ? <><Loader2 className="size-4 animate-spin" /> Uploading…</>
                  : <><CheckCircle2 className="size-4" /> Save photo</>
                }
              </button>
            </div>
          </div>
        ) : (
          /* ── Drop zone state ── */
          <div className="space-y-4">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative flex flex-col items-center justify-center gap-3 h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                dragging
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-muted/40 hover:border-primary/50 hover:bg-muted/60"
              }`}
              onClick={() => inputRef.current?.click()}
            >
              <div className={`size-12 rounded-xl grid place-items-center transition-colors ${
                dragging ? "bg-primary/20 border border-primary/40" : "bg-muted/60 border border-border"
              }`}>
                <ImagePlus className={`size-6 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {dragging ? "Drop to upload" : "Drag photo here"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
              </div>
            </div>

            {/* Hints */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Formats", value: "JPG, PNG, WebP, GIF" },
                { label: "Max size", value: "5 MB" },
                { label: "Recommended", value: "Square image" },
                { label: "Min resolution", value: "256 × 256 px" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/60 border border-border/50 rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="text-xs font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-xs text-destructive px-1">{error}</p>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ""; }}
        />
      </div>
    </div>
  );
}
