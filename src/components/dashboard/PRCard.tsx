import { PullRequest, Platform, CIStatus, ReviewerInfo } from "@/lib/types";
import { platformMeta, reviewStatusConfig, ciConfig } from "@/lib/constants";
import { ageFromCreated, timeAgo, hoursInReview } from "@/lib/helpers";
import { ChevronIcon, BranchIcon, ArrowIcon } from "./Icons";

function StatusPill({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    open: { label: "Pending", bg: "bg-[var(--color-status-pending)]/10", text: "text-[var(--color-status-pending)]" },
    approved: { label: "Approved", bg: "bg-[var(--color-status-approved)]/10", text: "text-[var(--color-status-approved)]" },
    changes_requested: { label: "Changes", bg: "bg-[var(--color-status-changes)]/10", text: "text-[var(--color-status-changes)]" },
  };
  const c = config[status] || config.open;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.text.replace("text-", "bg-")} mr-1.5`} />
      {c.label}
    </span>
  );
}

function AgeBadge({ createdAt }: { createdAt: string }) {
  const { label, level } = ageFromCreated(createdAt);
  const colorMap = {
    fresh: "bg-[var(--color-age-fresh)]/10 text-[var(--color-age-fresh)]",
    aging: "bg-[var(--color-age-aging)]/10 text-[var(--color-age-aging)]",
    stale: "bg-[var(--color-age-stale)]/10 text-[var(--color-age-stale)]",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium tabular-nums ${colorMap[level]}`}>
      {label}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = platformMeta[platform];
  // Dynamic icon based on platform
  const iconPath = platform === "gitlab"
    ? "M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"
    : "M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.9zM14.52 15.53H9.522L8.17 8.466h7.561z";
  return (
    <span className={`inline-flex items-center gap-1 ${meta.colorClass}`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d={iconPath} />
      </svg>
    </span>
  );
}

function CIBadge({ status }: { status?: CIStatus }) {
  if (!status) return null;
  const c = ciConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${c.color}`}>
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
}

function ReviewerRow({ reviewer }: { reviewer: ReviewerInfo }) {
  const cfg = reviewStatusConfig[reviewer.status] || reviewStatusConfig.pending;
  return (
    <div className="flex items-center gap-2 py-1">
      {reviewer.avatar ? (
        <img src={reviewer.avatar} alt={reviewer.name} width={20} height={20} className="w-5 h-5 rounded-full bg-[var(--color-surface-3)]" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[9px] font-medium text-[var(--color-text-secondary)]">
          {reviewer.name.charAt(0)}
        </div>
      )}
      <span className="text-xs text-[var(--color-text-secondary)]">{reviewer.name}</span>
      <span className={`text-[11px] ${cfg.color}`}>{cfg.label}</span>
    </div>
  );
}

function LabelTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
      {label}
    </span>
  );
}

export function PRCard({
  pr,
  index,
  isSelected,
  isExpanded,
  onToggleExpand,
  onAuthorClick,
  prRef,
}: {
  pr: PullRequest;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAuthorClick?: (author: string) => void;
  prRef: (el: HTMLDivElement | null) => void;
}) {
  const isStale = (pr.ageDays || 0) >= 5;
  const reviewHours = hoursInReview(pr);

  return (
    <div
      ref={prRef}
      className={`border-b border-[var(--color-border-subtle)] animate-slide-up ${
        isSelected ? "bg-[var(--color-surface-2)]/80" : ""
      } ${isStale ? "stale-pulse" : ""}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div
        onClick={(e) => { e.preventDefault(); onToggleExpand(); }}
        className="group flex items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-[var(--color-surface-2)]/50 transition-colors duration-100 cursor-pointer"
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${pr.title} by ${pr.author}`}
      >
        <div className="flex-shrink-0 w-4">
          <ChevronIcon className="w-3 h-3 text-[var(--color-text-tertiary)]" expanded={isExpanded} />
        </div>
        <div className="flex-shrink-0 w-8 flex justify-center">
          <PlatformBadge platform={pr.platform} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-[var(--color-text-primary)] truncate group-hover:text-white transition-colors">
              {pr.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
            <span className="font-medium text-[var(--color-text-secondary)]">{pr.repo.split("/").pop()}</span>
            <span className="opacity-40">·</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <BranchIcon className="w-2.5 h-2.5" />
              <span className="truncate max-w-[120px]">{pr.sourceBranch}</span>
              <ArrowIcon className="w-2.5 h-2.5 opacity-40" />
              <span>{pr.targetBranch}</span>
            </span>
            <span className="sm:hidden inline-flex items-center gap-1">
              <BranchIcon className="w-2.5 h-2.5" />
              <span className="truncate max-w-[80px]">{pr.sourceBranch}</span>
            </span>
            {reviewHours !== null && (
              <>
                <span className="opacity-40">·</span>
                <span className="tabular-nums">⏱ {reviewHours}h in review</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex w-20 justify-center">
            <StatusPill status={pr.status} />
          </div>
          <div className="w-10 flex justify-center">
            <AgeBadge createdAt={pr.createdAt} />
          </div>
          <div
            className="w-10 flex justify-center cursor-pointer hover:scale-110 transition-transform"
            title={`Filter by ${pr.author}`}
            onClick={(e) => { e.stopPropagation(); onAuthorClick?.(pr.author); }}
            role="button"
            aria-label={`Filter by author ${pr.author}`}
          >
            {pr.authorAvatar ? (
              <img src={pr.authorAvatar} alt={pr.author} width={24} height={24} className="w-6 h-6 rounded-full bg-[var(--color-surface-3)] ring-1 ring-[var(--color-border)]" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)]">
                {pr.author.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums w-20 text-center hidden md:block">
            {timeAgo(pr.updatedAt)}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pl-16 space-y-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-0)]/50">
          <div className="pt-3">
            {pr.description && (
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
                {pr.description.slice(0, 200)}{pr.description.length > 200 ? "…" : ""}
              </p>
            )}
            <div className="flex flex-wrap gap-6">
              {pr.reviewerDetails && pr.reviewerDetails.length > 0 && (
                <div>
                  <h4 className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-1">Reviewers</h4>
                  {pr.reviewerDetails.map((r) => (
                    <ReviewerRow key={r.name} reviewer={r} />
                  ))}
                </div>
              )}
              {pr.ciStatus && (
                <div>
                  <h4 className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-1">CI/Build</h4>
                  <CIBadge status={pr.ciStatus} />
                </div>
              )}
              {pr.labels && pr.labels.length > 0 && (
                <div>
                  <h4 className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-1">Labels</h4>
                  <div className="flex flex-wrap gap-1">
                    {pr.labels.map((l) => (
                      <LabelTag key={l} label={l} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <a href={pr.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-github)] hover:underline" onClick={(e) => e.stopPropagation()}>
                Open PR ↗
              </a>
              <a href={pr.url.replace(/\/(pull-requests|(-\/)?merge_requests)\/\d+.*$/, "")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:underline" onClick={(e) => e.stopPropagation()}>
                Open Repo ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
