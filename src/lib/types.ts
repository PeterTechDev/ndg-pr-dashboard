export type Platform = "github" | "gitlab" | "bitbucket";

export type PRStatus = "open" | "approved" | "changes_requested" | "merged" | "declined";

export type ReviewStatus = "pending" | "approved" | "changes_requested" | "commented";

export type CIStatus = "success" | "failure" | "pending" | "running";

export interface ReviewerInfo {
  name: string;
  avatar?: string;
  status: ReviewStatus;
}

export interface PullRequest {
  id: string;
  title: string;
  description?: string;
  author: string;
  authorAvatar?: string;
  url: string;
  platform: Platform;
  repo: string;
  status: PRStatus;
  reviewers: string[];
  reviewerDetails?: ReviewerInfo[];
  createdAt: string;
  updatedAt: string;
  reviewRequestedAt?: string;
  /** Computed: days since creation */
  ageDays?: number;
  /** Branch names */
  sourceBranch: string;
  targetBranch: string;
  ciStatus?: CIStatus;
  labels?: string[];
}
