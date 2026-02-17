export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startItem,
  endItem,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  startItem: number;
  endItem: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
        {startItem}–{endItem} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-xs text-[var(--color-text-tertiary)] tabular-nums">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
