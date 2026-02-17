export function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[var(--color-border-subtle)]">
          <div className="skeleton w-4 h-4 rounded" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-3/4" />
            <div className="skeleton h-2.5 w-1/3" />
          </div>
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-6 w-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}
