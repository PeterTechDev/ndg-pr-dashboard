import { timeAgo } from "@/lib/helpers";

export function RefreshIndicator({ isRefreshing, lastUpdated, onRefresh }: { isRefreshing: boolean; lastUpdated: string; onRefresh: () => void }) {
  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-tertiary)]">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isRefreshing ? "bg-[var(--color-accent-github)] animate-pulse-dot" : "bg-[var(--color-status-approved)]"
        }`}
      />
      <span>
        {isRefreshing
          ? "Syncing…"
          : lastUpdated
          ? `Last synced ${formatTime(lastUpdated)} (${timeAgo(lastUpdated)})`
          : "Live"}
      </span>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label="Refresh pull requests"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3,var(--color-surface-2))] border border-[var(--color-border)] transition-colors disabled:opacity-40 cursor-pointer text-[11px] font-medium"
        title="Refresh now"
      >
        <svg
          className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>
  );
}
