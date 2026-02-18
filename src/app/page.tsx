"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { usePRData } from "@/hooks/usePRData";
import { useFilters } from "@/hooks/useFilters";
import UserMenu from "@/components/UserMenu";
import {
  StatCard,
  PlatformTabs,
  AuthorFilter,
  SortSelect,
  RepoFilter,
  FilterChip,
  PRCard,
  Pagination,
  EmptyState,
  LoadingSkeleton,
  RefreshIndicator,
  SearchIcon,
} from "@/components/dashboard";

function DashboardInner() {
  const {
    prs, recentlyClosed, loading, isDemo, fetchError, fetchedAt, isRefreshing, apiUsername, apiEmail, repos, fetchPRs,
  } = usePRData();

  const filters = useFilters(prs, apiUsername, apiEmail);
  const {
    filterPlatform, setFilterPlatform,
    filterAuthor, setFilterAuthor,
    sortBy, setSortBy,
    search, setSearch,
    myPrs, setMyPrs,
    myReviews, setMyReviews,
    filterStatus, setFilterStatus,
    hideAncient, setHideAncient,
    filterRepos, setFilterRepos,
    currentPage, setCurrentPage,
    myUsername,
    counts, myReviewCount, myPrCount, authors,
    filtered, paginatedPrs,
    totalPages, safePage, startIndex,
    hasFilters, hasNonDefaultFilters,
    resetFilters,
    searchParams, router,
  } = filters;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showRecentlyClosed, setShowRecentlyClosed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset selectedIndex and page when filtered list changes
  useEffect(() => {
    setSelectedIndex(-1);
    setCurrentPage(1);
  }, [filtered.length, search, filterPlatform, filterAuthor, myPrs, myReviews, filterStatus, hideAncient, setCurrentPage]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT";

      if ((e.key === "/" && !isInput) || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
          if (search) setSearch("");
        }
        return;
      }

      if (!isInput) {
        if (e.key === "j") {
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.min(prev + 1, paginatedPrs.length - 1);
            rowRefs.current[next]?.scrollIntoView({ block: "nearest" });
            return next;
          });
          return;
        }
        if (e.key === "k") {
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            rowRefs.current[next]?.scrollIntoView({ block: "nearest" });
            return next;
          });
          return;
        }
        if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < paginatedPrs.length) {
          e.preventDefault();
          const pr = paginatedPrs[selectedIndex];
          if (pr.url && pr.url !== "#") {
            window.open(pr.url, "_blank");
          } else {
            setExpandedIds((prev) => {
              const next = new Set(prev);
              if (next.has(pr.id)) next.delete(pr.id); else next.add(pr.id);
              return next;
            });
          }
          return;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [paginatedPrs, selectedIndex, search, setSearch]);

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
              <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">NDG Dev Team</span>
              <span className="text-[var(--color-text-tertiary)] text-sm font-light">/</span>
              <span className="text-sm text-[var(--color-text-secondary)]">Pull Requests</span>
            </div>
            {isDemo && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-400 uppercase tracking-wider">Demo</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <RefreshIndicator isRefreshing={isRefreshing} lastUpdated={fetchedAt} onRefresh={() => fetchPRs(false, true)} />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Error banner */}
        {fetchError && !loading && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-[var(--color-status-changes)]/8 border border-[var(--color-status-changes)]/20 rounded-xl">
            <span className="text-[var(--color-status-changes)] text-sm">⚠</span>
            <span className="text-sm text-[var(--color-text-secondary)] flex-1">
              {isDemo ? "Couldn't connect to APIs — showing demo data." : fetchError}
            </span>
            <button onClick={() => fetchPRs()} className="text-xs font-medium text-[var(--color-accent-github)] hover:underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-3 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl mb-6">
          <StatCard value={counts.total} label="Total Open" onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("mine"); params.delete("reviews");
            const str = params.toString();
            router.replace(str ? `?${str}` : "/", { scroll: false });
          }} active={!myPrs && !myReviews} />
          <StatCard value={myReviewCount} label="My Reviews" color="text-[var(--color-status-changes)]" onClick={() => setMyReviews(!myReviews)} active={myReviews} />
          <StatCard value={myPrCount} label="My PRs" color="text-[var(--color-accent-github)]" onClick={() => setMyPrs(!myPrs)} active={myPrs} />
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PRs by title, repo, or author… (/ or ⌘K)"
            aria-label="Search pull requests"
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-github)] focus:border-[var(--color-accent-github)] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] cursor-pointer">
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <PlatformTabs active={filterPlatform} onChange={setFilterPlatform} counts={counts} />
          <div className="flex-1" />
          <button
            onClick={() => setMyPrs(!myPrs)}
            aria-label="Filter to my pull requests"
            aria-pressed={myPrs}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
              myPrs ? "bg-[var(--color-accent-github)]/10 text-[var(--color-accent-github)] border-[var(--color-accent-github)]/30" : "text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
            }`}
          >
            My PRs
          </button>
          <button
            onClick={() => setMyReviews(!myReviews)}
            aria-label="Filter to my reviews"
            aria-pressed={myReviews}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
              myReviews ? "bg-[var(--color-status-changes)]/10 text-[var(--color-status-changes)] border-[var(--color-status-changes)]/30" : "text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
            }`}
          >
            My Reviews
          </button>
          <SortSelect value={sortBy} onChange={setSortBy} />
          {hasNonDefaultFilters && (
            <button onClick={resetFilters} aria-label="Reset all filters" className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <RepoFilter repos={repos} selected={filterRepos} onChange={setFilterRepos} />
          <div className="h-4 w-px bg-[var(--color-border)] mx-1 hidden sm:block" />
          <button
            onClick={() => setHideAncient(!hideAncient)}
            aria-label="Toggle hide PRs older than 60 days"
            aria-pressed={hideAncient}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
              hideAncient ? "bg-[var(--color-accent-github)]/10 text-[var(--color-accent-github)] border-[var(--color-accent-github)]/30" : "text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {hideAncient ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              )}
            </svg>
            Hide &gt;60d
          </button>
          <div className="h-4 w-px bg-[var(--color-border)] mx-1 hidden sm:block" />
          <FilterChip label="Pending" active={filterStatus === "open"} onClick={() => setFilterStatus(filterStatus === "open" ? "all" : "open")} color="text-[var(--color-status-pending)] bg-[var(--color-status-pending)]/10" />
          <FilterChip label="Approved" active={filterStatus === "approved"} onClick={() => setFilterStatus(filterStatus === "approved" ? "all" : "approved")} color="text-[var(--color-status-approved)] bg-[var(--color-status-approved)]/10" />
          <FilterChip label="Changes" active={filterStatus === "changes_requested"} onClick={() => setFilterStatus(filterStatus === "changes_requested" ? "all" : "changes_requested")} color="text-[var(--color-status-changes)] bg-[var(--color-status-changes)]/10" />
          {authors.length > 0 && (
            <>
              <div className="h-4 w-px bg-[var(--color-border)] mx-1 hidden sm:block" />
              <AuthorFilter authors={authors} active={filterAuthor} onChange={setFilterAuthor} />
            </>
          )}
        </div>

        {/* PR list */}
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 border-b border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
            <div className="w-4" />
            <div className="w-8 text-center">Src</div>
            <div className="flex-1">Pull Request</div>
            <div className="hidden sm:block w-20 text-center">Status</div>
            <div className="w-10 text-center">Age</div>
            <div className="w-10 text-center">Author</div>
            <div className="hidden md:block w-20 text-center">Updated</div>
          </div>

          {loading && prs.length === 0 ? (
            <LoadingSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onClearFilters={resetFilters} />
          ) : (
            <div>
              {paginatedPrs.map((pr, i) => (
                <PRCard
                  key={pr.id}
                  pr={pr}
                  index={i}
                  isSelected={selectedIndex === i}
                  isExpanded={expandedIds.has(pr.id)}
                  onAuthorClick={setFilterAuthor}
                  onToggleExpand={() => {
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(pr.id)) next.delete(pr.id); else next.add(pr.id);
                      return next;
                    });
                    setSelectedIndex(i);
                  }}
                  prRef={(el) => { rowRefs.current[i] = el; }}
                />
              ))}
            </div>
          )}
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startItem={filtered.length === 0 ? 0 : startIndex + 1}
          endItem={Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
          onPageChange={(page) => {
            setCurrentPage(page);
            setSelectedIndex(-1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Recently Closed */}
        {recentlyClosed.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowRecentlyClosed(!showRecentlyClosed)}
              className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer mb-2"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showRecentlyClosed ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Recently closed ({recentlyClosed.length})
            </button>
            {showRecentlyClosed && (
              <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl overflow-hidden opacity-60">
                {recentlyClosed.map((pr, i) => (
                  <div
                    key={pr.id}
                    className={`flex items-center gap-3 sm:gap-4 px-4 py-2.5 ${
                      i < recentlyClosed.length - 1 ? "border-b border-[var(--color-border)]" : ""
                    }`}
                  >
                    <div className="w-4" />
                    <div className="w-8 flex justify-center">
                      <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase">
                        {pr.platform === "gitlab" ? "GL" : "BB"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--color-text-secondary)] line-through decoration-[var(--color-text-tertiary)]/40 hover:text-[var(--color-text-primary)] truncate block"
                      >
                        {pr.title}
                      </a>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">
                        {pr.repo.split("/").pop()}
                      </span>
                    </div>
                    <span className={`hidden sm:block w-20 text-center text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      pr.status === "merged"
                        ? "bg-violet-500/10 text-violet-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {pr.status === "merged" ? "Merged" : "Declined"}
                    </span>
                    <span className="w-10 text-center text-[11px] text-[var(--color-text-tertiary)]">
                      {pr.author}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 text-[11px] text-[var(--color-text-tertiary)]">
          <span>
            {filtered.length} {filtered.length === 1 ? "pull request" : "pull requests"}
            {hasFilters ? " (filtered)" : ""}
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline opacity-60">j/k navigate · Enter open · / search</span>
            <span>Auto-refreshes every 5 minutes</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function SuspenseFallback() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <header className="sticky top-0 z-50 bg-[var(--color-surface-0)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-500" />
          <div className="skeleton h-4 w-32" />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-3 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-5 py-4 space-y-2 border-r border-[var(--color-border)] last:border-r-0">
              <div className="skeleton h-7 w-10" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="skeleton h-10 w-full rounded-lg mb-4" />
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <LoadingSkeleton />
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <DashboardInner />
    </Suspense>
  );
}
