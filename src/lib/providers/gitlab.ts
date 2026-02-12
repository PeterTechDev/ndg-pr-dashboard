import { PullRequest } from "../types";

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

      for (const mr of mrs) {
        let status: PullRequest["status"] = "open";
        let reviewerDetails: NonNullable<PullRequest["reviewerDetails"]> = [];

        try {
          // Check approvals
          const approvalRes = await fetch(
            `${baseUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}/approvals`,
            { headers: { "PRIVATE-TOKEN": token }, next: { revalidate: 300 } }
          );
          if (approvalRes.ok) {
            const approval = await approvalRes.json();
            if (approval.approved) status = "approved";
          }
        } catch {}

        // Check reviewer states for changes_requested
        // GitLab 15.2+ includes reviewer details with state on the MR object
        const mrReviewers = mr.reviewers || [];
        if (mrReviewers.length > 0) {
          // Fetch detailed MR to get reviewer states (the list endpoint may not include them)
          try {
            const detailRes = await fetch(
              `${baseUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}?include_rebase_in_progress=false`,
              { headers: { "PRIVATE-TOKEN": token }, next: { revalidate: 300 } }
            );
            if (detailRes.ok) {
              const detail = await detailRes.json();
              const detailedReviewers = detail.reviewers || mrReviewers;

              reviewerDetails = detailedReviewers.map((r: any) => {
                // GitLab reviewer states: "unreviewed", "reviewed", "requested_changes", "approved"
                let reviewStatus: "pending" | "approved" | "changes_requested" | "commented" = "pending";
                const state = r.state || r.mergeability_status;
                if (state === "approved") reviewStatus = "approved";
                else if (state === "requested_changes") {
                  reviewStatus = "changes_requested";
                  status = "changes_requested"; // Override MR status
                }
                return {
                  name: r.username || r.name,
                  avatar: r.avatar_url,
                  status: reviewStatus,
                };
              });

              // Also check if blocking_discussions_resolved is false as a hint
              if (detail.blocking_discussions_resolved === false && status === "open") {
                // There are unresolved discussions — might indicate changes requested
              }
            }
          } catch {}
        }

        prs.push({
          id: `gitlab-${mr.project_id}-${mr.iid}`,
          title: mr.title,
          author: mr.author?.username || "unknown",
          authorAvatar: mr.author?.avatar_url,
          url: mr.web_url,
          platform: "gitlab",
          repo: mr.references?.full || `project/${mr.project_id}`,
          status,
          reviewers: mrReviewers.map((r: any) => r.username),
          reviewerDetails: reviewerDetails.length > 0 ? reviewerDetails : undefined,
          createdAt: mr.created_at,
          updatedAt: mr.updated_at,
          sourceBranch: mr.source_branch || "",
          targetBranch: mr.target_branch || "",
        });
      }
    } catch (e) {
      console.error(`GitLab error for group ${groupId}:`, e);
    }
  }

  return prs;
}
