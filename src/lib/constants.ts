import { Platform, CIStatus } from "./types";

export type SortKey = "age" | "updated" | "author";
export type AgeFilter = "all" | "fresh" | "normal" | "stale";
export type StatusFilter = "all" | "open" | "approved" | "changes_requested";

export const ITEMS_PER_PAGE = 20;

export const platformMeta: Record<Platform, { label: string; colorClass: string; bgClass: string }> = {
  gitlab: { label: "GitLab", colorClass: "text-[var(--color-accent-gitlab)]", bgClass: "bg-[var(--color-accent-gitlab)]" },
  bitbucket: { label: "Bitbucket", colorClass: "text-[var(--color-accent-bitbucket)]", bgClass: "bg-[var(--color-accent-bitbucket)]" },
};

export const reviewStatusConfig: Record<string, { label: string; color: string }> = {
  approved: { label: "Approved", color: "text-[var(--color-status-approved)]" },
  changes_requested: { label: "Changes requested", color: "text-[var(--color-status-changes)]" },
  pending: { label: "Pending", color: "text-[var(--color-status-pending)]" },
  commented: { label: "Commented", color: "text-[var(--color-text-secondary)]" },
};

export const ciConfig: Record<CIStatus, { label: string; color: string; icon: string }> = {
  success: { label: "Passing", color: "text-[var(--color-status-approved)]", icon: "✓" },
  failure: { label: "Failing", color: "text-[var(--color-status-changes)]", icon: "✗" },
  pending: { label: "Pending", color: "text-[var(--color-status-pending)]", icon: "○" },
  running: { label: "Running", color: "text-[var(--color-accent-github)]", icon: "◎" },
};
