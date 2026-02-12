"use client";

import { useEffect, useState, useMemo } from "react";
import { PullRequest, Platform } from "@/lib/types";

const PLATFORM_COLORS: Record<Platform, string> = {
  github: "bg-gray-700",
  gitlab: "bg-orange-600",
  bitbucket: "bg-blue-600",
};

const PLATFORM_LABELS: Record<Platform, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
};

const STATUS_COLORS: Record<string, string> = {
  open: "text-yellow-400",
  approved: "text-green-400",
  changes_requested: "text-red-400",
};

function ageColor(days: number): string {
  if (days <= 1) return "text-green-400";
  if (days <= 4) return "text-yellow-400";
  return "text-red-400";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [fetchedAt, setFetchedAt] = useState<string>("");

  const fetchPRs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prs");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPrs(data.prs || []);
      setFetchedAt(data.fetchedAt || "");
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRs();
    const interval = setInterval(fetchPRs, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const authors = useMemo(() => {
    const set = new Set(prs.map((pr) => pr.author));
    return Array.from(set).sort();
  }, [prs]);

  const filtered = useMemo(() => {
    return prs.filter((pr) => {
      if (filterPlatform !== "all" && pr.platform !== filterPlatform) return false;
      if (filterAuthor !== "all" && pr.author !== filterAuthor) return false;
      return true;
    });
  }, [prs, filterPlatform, filterAuthor]);

  const counts = useMemo(() => ({
    total: prs.length,
    open: prs.filter((p) => p.status === "open").length,
    approved: prs.filter((p) => p.status === "approved").length,
    changes: prs.filter((p) => p.status === "changes_requested").length,
  }), [prs]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">PR Dashboard</h1>
          <p className="text-gray-400 mt-1">Open pull requests across all platforms</p>
        </div>
        <button
          onClick={fetchPRs}
          disabled={loading}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold">{counts.total}</div>
          <div className="text-gray-400 text-sm">Total Open</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-yellow-400">{counts.open}</div>
          <div className="text-gray-400 text-sm">Pending Review</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-green-400">{counts.approved}</div>
          <div className="text-gray-400 text-sm">Approved</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-red-400">{counts.changes}</div>
          <div className="text-gray-400 text-sm">Changes Requested</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value as Platform | "all")}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Platforms</option>
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="bitbucket">Bitbucket</option>
        </select>
        <select
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Authors</option>
          {authors.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {fetchedAt && (
          <span className="ml-auto text-gray-500 text-xs self-center">
            Last updated: {new Date(fetchedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6 text-red-300">
          {error}
        </div>
      )}

      {/* PR List */}
      {loading && prs.length === 0 ? (
        <div className="text-center text-gray-500 py-20">Loading PRs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          {prs.length === 0 ? "No API tokens configured. Add tokens to .env.local and restart." : "No PRs match your filters."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((pr) => (
            <a
              key={pr.id}
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800/80 border border-gray-800 rounded-lg p-4 transition-colors"
            >
              {/* Platform badge */}
              <span className={`${PLATFORM_COLORS[pr.platform]} text-xs font-medium px-2 py-1 rounded`}>
                {PLATFORM_LABELS[pr.platform]}
              </span>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{pr.title}</div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {pr.repo} · {pr.sourceBranch} → {pr.targetBranch}
                </div>
              </div>

              {/* Author */}
              <div className="text-sm text-gray-400 flex items-center gap-2">
                {pr.authorAvatar && (
                  <img src={pr.authorAvatar} alt="" className="w-5 h-5 rounded-full" />
                )}
                {pr.author}
              </div>

              {/* Status */}
              <span className={`text-xs font-medium ${STATUS_COLORS[pr.status] || "text-gray-400"}`}>
                {pr.status === "changes_requested" ? "Changes" : pr.status}
              </span>

              {/* Age */}
              <span className={`text-xs font-mono ${ageColor(pr.ageDays || 0)}`}>
                {pr.ageDays}d
              </span>

              {/* Time */}
              <span className="text-xs text-gray-500 w-16 text-right">
                {timeAgo(pr.updatedAt)}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
