export function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 sm:py-24 px-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-6">
        {hasFilters ? (
          <svg className="w-7 h-7 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
        {hasFilters ? "No matching pull requests" : "All clear — no open PRs"}
      </h3>
      <p className="text-xs text-[var(--color-text-tertiary)] max-w-[300px] text-center leading-relaxed">
        {hasFilters
          ? "No PRs match your current filters. Try broadening your search or clearing filters."
          : "When pull requests are opened across your connected GitLab and Bitbucket repos, they'll appear here automatically."}
      </p>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 px-4 py-1.5 rounded-lg text-xs font-medium text-[var(--color-accent-github)] bg-[var(--color-accent-github)]/10 hover:bg-[var(--color-accent-github)]/20 transition-colors cursor-pointer"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
