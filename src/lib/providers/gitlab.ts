import { PullRequest } from "../types";

import { isBlockedRepo } from "../blocked-repos";

export async function fetchGitLabMRs(): Promise<PullRequest[]> {
  const token = process.env.GITLAB_TOKEN;
  const baseUrl = process.env.GITLAB_URL || "https://gitlab.com";
  const groupIds = (process.env.GITLAB_GROUP_IDS || "").split(",").filter(Boolean);

  if (!token || groupIds.length === 0) return [];

  const prs: PullRequest[] = [];

  for (const groupId of groupIds) {
    try {
      const res = await fetch(
        `${baseUrl}/api/v4/groups/${groupId}/merge_requests?state=opened&per_page=100`,
        { headers: { "PRIVATE-TOKEN": token }, next: { revalidate: 300 } }
      );
      if (!res.ok) continue;
      const mrs = await res.json();

      // Parallelize approval + detail calls for all MRs
      const enriched = await Promise.all(
        mrs.map(async (mr: any) => {
          let status: PullRequest["status"] = "open";
          let reviewerDetails: NonNullable<PullRequest["reviewerDetails"]> = [];

          const mrReviewers = mr.reviewers || [];

          // Fetch approvals and details in parallel
          const [approvalResult, detailResult] = await Promise.all([
            fetch(
              `${baseUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}/approvals`,
              { headers: { "PRIVATE-TOKEN": token }, next: { revalidate: 300 } }
            ).then(r => r.ok ? r.json() : null).catch(() => null),
            mrReviewers.length > 0
              ? fetch(
                  `${baseUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}?include_rebase_in_progress=false`,
                  { headers: { "PRIVATE-TOKEN": token }, next: { revalidate: 300 } }
                ).then(r => r.ok ? r.json() : null).catch(() => null)
              : Promise.resolve(null),
          ]);

          if (approvalResult?.approved) status = "approved";

          if (detailResult) {
            const detailedReviewers = detailResult.reviewers || mrReviewers;
            reviewerDetails = detailedReviewers.map((r: any) => {
              let reviewStatus: "pending" | "approved" | "changes_requested" | "commented" = "pending";
              const state = r.state || r.mergeability_status;
              if (state === "approved") reviewStatus = "approved";
              else if (state === "requested_changes") {
                reviewStatus = "changes_requested";
                status = "changes_requested";
              }
              return {
                name: r.username || r.name,
                avatar: r.avatar_url,
                status: reviewStatus,
              };
            });
          }

          return {
            id: `gitlab-${mr.project_id}-${mr.iid}`,
            title: mr.title,
            author: mr.author?.username || "unknown",
            authorAvatar: mr.author?.avatar_url,
            url: mr.web_url,
            platform: "gitlab" as const,
            repo: (mr.references?.full || `project/${mr.project_id}`).replace(/![0-9]+$/, ""),
            status,
            reviewers: mrReviewers.map((r: any) => r.username),
            reviewerDetails: reviewerDetails.length > 0 ? reviewerDetails : undefined,
            createdAt: mr.created_at,
            updatedAt: mr.updated_at,
            sourceBranch: mr.source_branch || "",
            targetBranch: mr.target_branch || "",
          };
        })
      );

      prs.push(...enriched);
    } catch (e) {
      console.error(`GitLab error for group ${groupId}:`, e);
    }
  }

  return prs.filter(pr => !isBlockedRepo(pr.repo));
}

export async function fetchGitLabRecentlyClosed(): Promise<PullRequest[]> {
  const token = process.env.GITLAB_TOKEN;
  const baseUrl = process.env.GITLAB_URL || "https://gitlab.com";
  const groupIds = (process.env.GITLAB_GROUP_IDS || "").split(",").filter(Boolean);

  if (!token || groupIds.length === 0) return [];

  const prs: PullRequest[] = [];
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  for (const groupId of groupIds) {
    try {
      const res = await fetch(
        `${baseUrl}/api/v4/groups/${groupId}/merge_requests?state=merged&updated_after=${twoDaysAgo}&per_page=10&order_by=updated_at&sort=desc`,
        { headers: { "PRIVATE-TOKEN": token }, next: { revalidate: 300 } }
      );
      if (!res.ok) continue;
      const mrs = await res.json();

      for (const mr of mrs) {
        prs.push({
          id: `gitlab-${mr.project_id}-${mr.iid}`,
          title: mr.title,
          author: mr.author?.username || "unknown",
          authorAvatar: mr.author?.avatar_url,
          url: mr.web_url,
          platform: "gitlab" as const,
          repo: (mr.references?.full || `project/${mr.project_id}`).replace(/![0-9]+$/, ""),
          status: "merged" as const,
          reviewers: (mr.reviewers || []).map((r: any) => r.username),
          createdAt: mr.created_at,
          updatedAt: mr.updated_at,
          sourceBranch: mr.source_branch || "",
          targetBranch: mr.target_branch || "",
        });
      }
    } catch (e) {
      console.error(`GitLab recently closed error for group ${groupId}:`, e);
    }
  }

  return prs.filter(pr => !isBlockedRepo(pr.repo));
}
