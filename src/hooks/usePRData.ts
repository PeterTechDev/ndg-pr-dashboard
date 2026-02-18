"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { PullRequest } from "@/lib/types";
import { MOCK_PRS } from "@/lib/mock-data";

export function usePRData() {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [recentlyClosed, setRecentlyClosed] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiUsername, setApiUsername] = useState("");
  const [apiEmail, setApiEmail] = useState("");
  const prsLengthRef = useRef(0);

  // Keep ref in sync
  useEffect(() => {
    prsLengthRef.current = prs.length;
  }, [prs.length]);

  const fetchPRs = useCallback(async (silent = false, bustCache = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    setFetchError(null);
    try {
      const url = bustCache ? `/api/prs?bust=${Date.now()}` : "/api/prs";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      if (data.myUsername) setApiUsername(data.myUsername);
      if (data.myEmail) setApiEmail(data.myEmail);
      if (data.error) {
        setPrs(MOCK_PRS);
        setRecentlyClosed([]);
        setIsDemo(true);
      } else {
        setPrs(data.prs || []);
        setRecentlyClosed(data.recentlyClosed || []);
        setIsDemo(false);
      }
      setFetchedAt(data.fetchedAt || new Date().toISOString());
    } catch (err) {
      if (!silent || prsLengthRef.current === 0) {
        setPrs(MOCK_PRS);
        setIsDemo(true);
      }
      setFetchError(err instanceof Error ? err.message : "Failed to fetch PRs");
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

  const repos = useMemo(() => {
    const counts = new Map<string, number>();
    prs.forEach((pr) => {
      const name = pr.repo.split("/").pop() || pr.repo;
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [prs]);

  return {
    prs,
    recentlyClosed,
    loading,
    isDemo,
    fetchError,
    fetchedAt,
    isRefreshing,
    apiUsername,
    apiEmail,
    repos,
    fetchPRs,
  };
}
