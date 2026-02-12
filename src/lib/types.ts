export type Platform = "github" | "gitlab" | "bitbucket";

export type PRStatus = "open" | "approved" | "changes_requested" | "merged" | "declined";

export interface PullRequest {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  url: string;
  platform: Platform;
  repo: string;
  status: PRStatus;
  reviewers: string[];
  createdAt: string;
  updatedAt: string;
  /** Computed: days since creation */
  ageDays?: number;
  /** Branch names */
  sourceBranch: string;
  targetBranch: string;
}
