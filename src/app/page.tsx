"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { PullRequest, Platform } from "@/lib/types";
import { MOCK_PRS } from "@/lib/mock-data";

// ─── Icons ───────────────────────────────────────────────────────────────────

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GitLabIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

function BitbucketIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.9zM14.52 15.53H9.522L8.17 8.466h7.561z" />
    </svg>
  );
}

function BranchIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6a2.5 2.5 0 01-2.5 2.5H7.5v1.878a2.251 2.251 0 11-1.5 0V5.622a2.251 2.251 0 111.5 0v1.878H10A1 1 0 0011 6v-.628A2.251 2.251 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
    </svg>
  );
}

function ArrowIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z" />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SortKey = "age" | "updated" | "author";

function ageColor(days: number): "fresh" | "aging" | "stale" {
  if (days <= 1) return "fresh";
  if (days <= 4) return "aging";
  return "stale";
}

function ageDaysLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "1d";
  return `${days}d`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const platformMeta: Record<Platform, { label: string; icon: typeof GitHubIcon; colorClass: string; bgClass: string }> = {
  github: { label: "GitHub", icon: GitHubIcon, colorClass: "text-[var(--color-accent-github)]", bgClass: "bg-[var(--color-accent-github)]" },
  gitlab: { label: "GitLab", icon: GitLabIcon, colorClass: "text-[var(--color-accent-gitlab)]", bgClass: "bg-[var(--color-accent-gitlab)]" },
  bitbucket: { label: "Bitbucket", icon: BitbucketIcon, colorClass: "text-[var(--color-accent-bitbucket)]", bgClass: "bg-[var(--color-accent-bitbucket)]" },
};

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <span className={`text-2xl font-semibold tracking-tight tabular-nums ${color || "text-[var(--color-text-primary)]"}`}>
        {value}
      </span>
      <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

function PlatformTabs({
  active,
  onChange,
  counts,
}: {
  active: Platform | "all";
  onChange: (v: Platform | "all") => void;
  counts: Record<string, number>;
}) {
  const tabs: { key: Platform | "all"; label: string; icon?: typeof GitHubIcon; color?: string }[] = [
    { key: "all", label: "All" },
    { key: "github", label: "GitHub", icon: GitHubIcon, color: "var(--color-accent-github)" },
    { key: "gitlab", label: "GitLab", icon: GitLabIcon, color: "var(--color-accent-gitlab)" },
    { key: "bitbucket", label: "Bitbucket", icon: BitbucketIcon, color: "var(--color-accent-bitbucket)" },
  ];

  return (
    <div className="flex gap-1 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg p-1">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        const count = tab.key === "all" ? counts.total : counts[tab.key] || 0;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "" : "opacity-60"}`} />}
            <span className="hidden sm:inline">{tab.label}</span>
            <span
              className={`text-xs tabular-nums ${
                isActive ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-tertiary)]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AuthorFilter({
  authors,
  active,
  onChange,
}: {
  authors: { name: string; avatar?: string }[];
  active: string;
  onChange: (v: string) => void;
}) {
  if (authors.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange("all")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          active === "all"
            ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)]"
            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
        }`}
      >
        All
      </button>
      {authors.map((a) => (
        <button
          key={a.name}
          onClick={() => onChange(a.name)}
          title={a.name}
          className={`relative flex items-center gap-1.5 rounded-full transition-all cursor-pointer ${
            active === a.name
              ? "ring-2 ring-[var(--color-accent-github)] ring-offset-1 ring-offset-[var(--color-surface-0)]"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          {a.avatar ? (
            <img src={a.avatar} alt={a.name} className="w-7 h-7 rounded-full bg-[var(--color-surface-3)]" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-xs font-medium text-[var(--color-text-secondary)]">
              {a.name.charAt(0)}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-tertiary)]">Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2 py-1 text-xs text-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-github)] cursor-pointer"
      >
        <option value="age">Oldest first</option>
        <option value="updated">Recently updated</option>
        <option value="author">By author</option>
      </select>
    </div>
  );
}

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

function AgeBadge({ days }: { days: number }) {
  const level = ageColor(days);
  const colorMap = {
    fresh: "bg-[var(--color-age-fresh)]/10 text-[var(--color-age-fresh)]",
    aging: "bg-[var(--color-age-aging)]/10 text-[var(--color-age-aging)]",
    stale: "bg-[var(--color-age-stale)]/10 text-[var(--color-age-stale)]",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium tabular-nums ${colorMap[level]}`}>
      {ageDaysLabel(days)}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = platformMeta[platform];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${meta.colorClass}`}>
      <Icon className="w-3.5 h-3.5" />
    </span>
  );
}

function PRCard({ pr, index }: { pr: PullRequest; index: number }) {
  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 sm:gap-4 px-4 py-3 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-2)]/50 transition-colors duration-100 animate-slide-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Platform icon */}
      <div className="flex-shrink-0 w-8 flex justify-center">
        <PlatformBadge platform={pr.platform} />
      </div>

      {/* Main content */}
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
        </div>
      </div>

      {/* Right side meta */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Status pill */}
        <div className="hidden sm:block">
          <StatusPill status={pr.status} />
        </div>

        {/* Age */}
        <AgeBadge days={pr.ageDays || 0} />

        {/* Author avatar */}
        <div className="flex items-center gap-1.5" title={pr.author}>
          {pr.authorAvatar ? (
            <img
              src={pr.authorAvatar}
              alt={pr.author}
              className="w-6 h-6 rounded-full bg-[var(--color-surface-3)] ring-1 ring-[var(--color-border)]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)]">
              {pr.author.charAt(0)}
            </div>
          )}
        </div>

        {/* Updated time */}
        <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums w-14 text-right hidden md:block">
          {timeAgo(pr.updatedAt)}
        </span>
      </div>
    </a>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
        {hasFilters ? "No matching pull requests" : "No open pull requests"}
      </h3>
      <p className="text-xs text-[var(--color-text-tertiary)] max-w-[280px] text-center">
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "When PRs are opened across your connected platforms, they'll appear here."}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
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

function RefreshIndicator({ isRefreshing, lastUpdated }: { isRefreshing: boolean; lastUpdated: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isRefreshing ? "bg-[var(--color-accent-github)] animate-pulse-dot" : "bg-[var(--color-status-approved)]"
        }`}
      />
      <span>
        {isRefreshing
          ? "Syncing…"
          : lastUpdated
          ? `Updated ${timeAgo(lastUpdated)}`
          : "Live"}
      </span>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("age");
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPRs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/prs");
      const data = await res.json();
      if (data.error || (data.prs && data.prs.length === 0)) {
        // Fall back to demo data
        setPrs(MOCK_PRS);
        setIsDemo(true);
      } else {
        setPrs(data.prs || []);
        setIsDemo(false);
      }
      setFetchedAt(data.fetchedAt || new Date().toISOString());
    } catch {
      setPrs(MOCK_PRS);
      setIsDemo(true);
      setFetchedAt(new Date().toISOString());
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPRs();
    const interval = setInterval(() => fetchPRs(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPRs]);

  const authors = useMemo(() => {
    const map = new Map<string, string | undefined>();
    prs.forEach((pr) => map.set(pr.author, pr.authorAvatar));
    return Array.from(map.entries())
      .map(([name, avatar]) => ({ name, avatar }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [prs]);

  const counts = useMemo(() => {
    const c = { total: prs.length, open: 0, approved: 0, changes: 0, github: 0, gitlab: 0, bitbucket: 0 };
    prs.forEach((p) => {
      if (p.status === "open") c.open++;
      if (p.status === "approved") c.approved++;
      if (p.status === "changes_requested") c.changes++;
      c[p.platform]++;
    });
    return c;
  }, [prs]);

  const filtered = useMemo(() => {
    let result = prs.filter((pr) => {
      if (filterPlatform !== "all" && pr.platform !== filterPlatform) return false;
      if (filterAuthor !== "all" && pr.author !== filterAuthor) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "age":
          return (b.ageDays || 0) - (a.ageDays || 0);
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "author":
          return a.author.localeCompare(b.author);
        default:
          return 0;
      }
    });

    return result;
  }, [prs, filterPlatform, filterAuthor, sortBy]);

  const hasFilters = filterPlatform !== "all" || filterAuthor !== "all";

  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[var(--color-surface-0)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
                NDG
              </span>
              <span className="text-[var(--color-text-tertiary)] text-sm font-light">/</span>
              <span className="text-sm text-[var(--color-text-secondary)]">Pull Requests</span>
            </div>
            {isDemo && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-400 uppercase tracking-wider">
                Demo
              </span>
            )}
          </div>
          <RefreshIndicator isRefreshing={isRefreshing} lastUpdated={fetchedAt} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats bar */}
        <div className="flex flex-wrap bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl mb-6 divide-x divide-[var(--color-border)]">
          <StatCard value={counts.total} label="Total Open" />
          <StatCard value={counts.open} label="Pending" color="text-[var(--color-status-pending)]" />
          <StatCard value={counts.approved} label="Approved" color="text-[var(--color-status-approved)]" />
          <StatCard value={counts.changes} label="Changes" color="text-[var(--color-status-changes)]" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <PlatformTabs active={filterPlatform} onChange={setFilterPlatform} counts={counts} />
          <div className="flex-1" />
          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        {/* Author filter */}
        {authors.length > 0 && (
          <div className="mb-4">
            <AuthorFilter authors={authors} active={filterAuthor} onChange={setFilterAuthor} />
          </div>
        )}

        {/* PR list */}
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          {/* List header */}
          <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 border-b border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
            <div className="w-8 text-center">Src</div>
            <div className="flex-1">Pull Request</div>
            <div className="hidden sm:block w-16 text-center">Status</div>
            <div className="w-10 text-center">Age</div>
            <div className="w-6" />
            <div className="hidden md:block w-14 text-right">Updated</div>
          </div>

          {loading && prs.length === 0 ? (
            <LoadingSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <div>
              {filtered.map((pr, i) => (
                <PRCard key={pr.id} pr={pr} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 text-[11px] text-[var(--color-text-tertiary)]">
          <span>
            {filtered.length} {filtered.length === 1 ? "pull request" : "pull requests"}
            {hasFilters ? " (filtered)" : ""}
          </span>
          <span>Auto-refreshes every 5 minutes</span>
        </div>
      </main>

      {/* Site footer */}
      <footer className="border-t border-[var(--color-border)] mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <span className="text-[11px] text-[var(--color-text-tertiary)]">
            Built by{" "}
            <a
              href="https://github.com/petersouza"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Peter Souza
            </a>
          </span>
          <a
            href="https://github.com/petersouza/ndg-pr-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            <span>Source</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
