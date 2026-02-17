export function StatCard({ value, label, color, onClick, active }: { value: string | number; label: string; color?: string; onClick?: () => void; active?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-1 px-3 py-3 sm:px-5 sm:py-4 border-r border-b sm:border-b-0 border-[var(--color-border)] last:border-r-0 [&:nth-child(3)]:border-r-0 sm:[&:nth-child(3)]:border-r transition-colors ${
        onClick ? "cursor-pointer hover:bg-[var(--color-surface-2)]" : ""
      } ${active ? "bg-[var(--color-surface-2)]" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `Filter: ${label}` : undefined}
    >
      <span className={`text-xl sm:text-2xl font-semibold tracking-tight tabular-nums ${color || "text-[var(--color-text-primary)]"}`}>
        {value}
      </span>
      <span className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}
