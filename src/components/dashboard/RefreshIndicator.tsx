import { timeAgo } from "@/lib/helpers";

export function RefreshIndicator({ isRefreshing, lastUpdated, onRefresh }: { isRefreshing: boolean; lastUpdated: string; onRefresh: () => void }) {
  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      aria-label="Click to sync latest data"
      title="Click to sync latest data"
      className="flex items-center gap-2 text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-wait"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isRefreshing ? "bg-[var(--color-accent-github)] animate-pulse-dot" : "bg-[var(--color-status-approved)]"
        }`}
      />
      {isRefreshing ? (
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Syncing…
        </span>
      ) : lastUpdated ? (
        <span>{formatTime(lastUpdated)} · {timeAgo(lastUpdated)}</span>
      ) : (
        <span>Live</span>
      )}
    </button>
  );
}
