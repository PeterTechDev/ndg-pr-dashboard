import { PullRequest } from "./types";

export function ageFromCreated(createdAt: string): { label: string; level: "fresh" | "aging" | "stale" } {
  const ms = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(ms / 60000);
  const hrs = ms / 3600000;
  const d = ms / 86400000;

  let label: string;
  if (mins < 60) label = `${Math.max(1, mins)}m`;
  else if (hrs < 24) label = `${Math.floor(hrs)}h`;
  else if (d < 7) label = `${Math.floor(d)}d`;
  else label = `${Math.floor(d / 7)}w`;

  let level: "fresh" | "aging" | "stale";
  if (hrs < 4) level = "fresh";
  else if (d < 2) level = "aging";
  else level = "stale";

  return { label, level };
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function hoursInReview(pr: PullRequest): number | null {
  const ref = pr.reviewRequestedAt || pr.createdAt;
  if (!ref) return null;
  return Math.round((Date.now() - new Date(ref).getTime()) / 3600000);
}
