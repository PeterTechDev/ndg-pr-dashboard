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
        // Get approvals
        let status: PullRequest["status"] = "open";
        try {
          const approvalRes = await fetch(
            `${baseUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}/approvals`,
            { headers: { "PRIVATE-TOKEN": token }, next: { revalidate: 300 } }
          );
          if (approvalRes.ok) {
            const approval = await approvalRes.json();
            if (approval.approved) status = "approved";
          }
        } catch {}

        prs.push({
          id: `gitlab-${mr.project_id}-${mr.iid}`,
          title: mr.title,
          author: mr.author?.username || "unknown",
          authorAvatar: mr.author?.avatar_url,
          url: mr.web_url,
          platform: "gitlab",
          repo: mr.references?.full || `project/${mr.project_id}`,
          status,
          reviewers: (mr.reviewers || []).map((r: any) => r.username),
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
