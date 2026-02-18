"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PullRequest, Platform } from "@/lib/types";
import { SortKey, AgeFilter, StatusFilter, ITEMS_PER_PAGE } from "@/lib/constants";

export function useFilters(prs: PullRequest[], apiUsername: string, apiEmail: string = "") {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filterPlatform = (searchParams.get("platform") as Platform | "all") || "all";
  const filterAuthor = searchParams.get("author") || "all";
  const sortBy = (searchParams.get("sort") as SortKey) || "updated";
  const search = searchParams.get("q") || "";
  const myPrs = searchParams.get("mine") === "1";
  const myReviews = searchParams.get("reviews") === "1";
  const filterStatus = (searchParams.get("status") as StatusFilter) || "all";
  const filterAge = (searchParams.get("age") as AgeFilter) || "all";
  const hideAncient = searchParams.get("hideOld") !== "0";

  // Default to all repos (empty set = all)
  const DEFAULT_REPOS = new Set([
    "drbhomes-frontend", "drbhomes-touchscreen", "ndg-cms-fe", "pr-dashboard",
    "e2e-tests", "legend-homes-fe", "epcon-fe", "weaver-fe",
    "ndg-cms", "ndg-dev-hub", "ndg-cms-export",
  ]);
  const [filterRepos, setFilterRepos] = useState<Set<string>>(DEFAULT_REPOS);
  const [currentPage, setCurrentPage] = useState(1);

  const myUsername = apiUsername || "";
  // Match by display name OR email prefix (peter@ndg... matches "Peter Souza", "peter.souza", etc.)
  const emailPrefix = apiEmail ? apiEmail.split("@")[0].toLowerCase() : "";
  const isMe = useCallback((author: string) => {
    if (!author) return false;
    const authorLower = author.toLowerCase();
    // Exact name match
    if (myUsername && authorLower === myUsername.toLowerCase()) return true;
    // Email prefix match (e.g. "peter" matches "Peter Souza", "peter.souza")
    if (emailPrefix) {
      const authorNormalized = authorLower.replace(/[.\-_\s]/g, "");
      const prefixNormalized = emailPrefix.replace(/[.\-_\s]/g, "");
      if (authorNormalized.includes(prefixNormalized) || prefixNormalized.includes(authorNormalized)) return true;
    }
    return false;
  }, [myUsername, emailPrefix]);

  const updateParam = useCallback(
    (key: string, value: string, defaultValue: string = "") => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === defaultValue || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const str = params.toString();
      router.replace(str ? `?${str}` : "/", { scroll: false });
    },
    [searchParams, router]
  );

  const setFilterPlatform = useCallback((v: Platform | "all") => updateParam("platform", v, "all"), [updateParam]);
  const setFilterAuthor = useCallback((v: string) => {
    const current = searchParams.get("author") || "all";
    updateParam("author", current === v ? "all" : v, "all");
  }, [updateParam, searchParams]);
  const setSortBy = useCallback((v: SortKey) => updateParam("sort", v, "updated"), [updateParam]);
  const setSearch = useCallback((v: string) => updateParam("q", v), [updateParam]);
  const setMyPrs = useCallback((v: boolean) => updateParam("mine", v ? "1" : "", ""), [updateParam]);
  const setMyReviews = useCallback((v: boolean) => updateParam("reviews", v ? "1" : "", ""), [updateParam]);
  const setFilterStatus = useCallback((v: StatusFilter) => updateParam("status", v, "all"), [updateParam]);
  const setFilterAge = useCallback((v: AgeFilter) => updateParam("age", v, "all"), [updateParam]);
  const setHideAncient = useCallback((v: boolean) => updateParam("hideOld", v ? "" : "0", ""), [updateParam]);

  // basePrs: apply repo filter + hide ancient
  const basePrs = useMemo(() => {
    return prs.filter((pr) => {
      if (filterRepos.size > 0) {
        const repoName = pr.repo.split("/").pop() || pr.repo;
        if (!filterRepos.has(repoName)) return false;
      }
      if (hideAncient) {
        const days = (Date.now() - new Date(pr.createdAt).getTime()) / 86400000;
        if (days > 60) return false;
      }
      return true;
    });
  }, [prs, filterRepos, hideAncient]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { total: basePrs.length, open: 0, approved: 0, changes: 0, gitlab: 0, bitbucket: 0 };
    basePrs.forEach((p) => {
      if (p.status === "open") c.open++;
      if (p.status === "approved") c.approved++;
      if (p.status === "changes_requested") c.changes++;
      if (c[p.platform] !== undefined) c[p.platform]++;
    });
    return c;
  }, [basePrs]);

  const myReviewCount = useMemo(() => {
    if (!myUsername && !emailPrefix) return 0;
    return basePrs.filter((pr) =>
      pr.reviewers?.some(r => isMe(r)) ||
      pr.reviewerDetails?.some(r => isMe(r.name))
    ).length;
  }, [basePrs, myUsername, emailPrefix, isMe]);

  const myPrCount = useMemo(() => {
    if (!myUsername && !emailPrefix) return 0;
    return basePrs.filter((pr) => isMe(pr.author)).length;
  }, [basePrs, myUsername, emailPrefix, isMe]);

  const authors = useMemo(() => {
    const map = new Map<string, string | undefined>();
    basePrs.forEach((pr) => {
      map.set(pr.author, pr.authorAvatar);
    });
    return Array.from(map.entries())
      .map(([name, avatar]) => ({ name, avatar }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [basePrs]);

  // Filter from basePrs (not raw prs)
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = basePrs.filter((pr) => {
      if (filterPlatform !== "all" && pr.platform !== filterPlatform) return false;
      if (filterAuthor !== "all" && pr.author !== filterAuthor) return false;
      if (myPrs && !isMe(pr.author)) return false;
      if (myReviews) {
        const isReviewer = pr.reviewers?.some(r => isMe(r)) ||
          pr.reviewerDetails?.some(r => isMe(r.name));
        if (!isReviewer) return false;
      }
      if (filterStatus !== "all" && pr.status !== filterStatus) return false;
      if (filterAge !== "all") {
        const days = (Date.now() - new Date(pr.createdAt).getTime()) / 86400000;
        if (filterAge === "fresh" && days >= 2) return false;
        if (filterAge === "normal" && (days < 2 || days > 5)) return false;
        if (filterAge === "stale" && days <= 5) return false;
      }
      if (q) {
        const match =
          pr.title.toLowerCase().includes(q) ||
          pr.repo.toLowerCase().includes(q) ||
          pr.author.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "age": return (b.ageDays || 0) - (a.ageDays || 0);
        case "updated": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "author": return a.author.localeCompare(b.author);
        default: return 0;
      }
    });

    return result;
  }, [basePrs, filterPlatform, filterAuthor, sortBy, search, myPrs, myReviews, myUsername, filterStatus, filterAge]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedPrs = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const hasFilters = filterPlatform !== "all" || filterAuthor !== "all" || !!search || myPrs || myReviews || filterStatus !== "all" || filterAge !== "all" || filterRepos.size > 0 || !hideAncient;
  const hasNonDefaultFilters = hasFilters || sortBy !== "updated";

  const resetFilters = useCallback(() => {
    setFilterRepos(new Set());
    router.replace("/", { scroll: false });
  }, [router]);

  return {
    filterPlatform, setFilterPlatform,
    filterAuthor, setFilterAuthor,
    sortBy, setSortBy,
    search, setSearch,
    myPrs, setMyPrs,
    myReviews, setMyReviews,
    filterStatus, setFilterStatus,
    filterAge, setFilterAge,
    hideAncient, setHideAncient,
    filterRepos, setFilterRepos,
    currentPage, setCurrentPage,
    myUsername,
    basePrs, counts, myReviewCount, myPrCount, authors,
    filtered, paginatedPrs,
    totalPages, safePage, startIndex,
    hasFilters, hasNonDefaultFilters,
    resetFilters,
    searchParams, router,
  };
}
