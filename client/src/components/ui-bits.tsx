export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-success/15 text-success border-success/40",
    in_progress: "bg-primary/15 text-primary border-primary/40",
    closed: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  };
  const label = status.replace("_", " ");
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border whitespace-nowrap ${map[status] ?? map.open}`}>
      {label}
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? "text-warning" : "text-muted-foreground/30"}>★</span>
      ))}
    </span>
  );
}