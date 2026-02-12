import { PullRequest } from "../types";

export async function fetchBitbucketPRs(): Promise<PullRequest[]> {
  const username = process.env.BITBUCKET_USERNAME;
  const appPassword = process.env.BITBUCKET_APP_PASSWORD;
  const workspaces = (process.env.BITBUCKET_WORKSPACES || "").split(",").filter(Boolean);

  if (!username || !appPassword || workspaces.length === 0) return [];

  const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
  const prs: PullRequest[] = [];

  for (const workspace of workspaces) {
    try {
      const reposRes = await fetch(
        `https://api.bitbucket.org/2.0/repositories/${workspace}?pagelen=100`,
        { headers: { Authorization: `Basic ${auth}` }, next: { revalidate: 300 } }
      );
      if (!reposRes.ok) continue;
      const reposData = await reposRes.json();

      for (const repo of reposData.values || []) {
        const prRes = await fetch(
          `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo.slug}/pullrequests?state=OPEN&pagelen=50`,
          { headers: { Authorization: `Basic ${auth}` }, next: { revalidate: 300 } }
        );
        if (!prRes.ok) continue;
        const prData = await prRes.json();

        for (const pr of prData.values || []) {
          const participants = pr.participants || [];
          const hasApproval = participants.some((p: any) => p.approved);
          // Bitbucket Cloud uses "changes_requested" for participant state
          const hasChangesRequested = participants.some(
            (p: any) => p.state === "changes_requested" || p.state === "changes-requested"
          );

          const reviewerDetails = participants
            .filter((p: any) => p.role === "REVIEWER")
            .map((p: any) => {
              let reviewStatus: "pending" | "approved" | "changes_requested" | "commented" = "pending";
              if (p.approved) reviewStatus = "approved";
              else if (p.state === "changes_requested" || p.state === "changes-requested") reviewStatus = "changes_requested";
              return {
                name: p.user?.display_name || p.user?.nickname || "",
                avatar: p.user?.links?.avatar?.href,
                status: reviewStatus,
              };
            });

          prs.push({
            id: `bitbucket-${repo.slug}-${pr.id}`,
            title: pr.title,
            author: pr.author?.display_name || pr.author?.nickname || "unknown",
            authorAvatar: pr.author?.links?.avatar?.href,
            url: pr.links?.html?.href || "",
            platform: "bitbucket",
            repo: `${workspace}/${repo.slug}`,
            status: hasChangesRequested ? "changes_requested" : hasApproval ? "approved" : "open",
            reviewers: participants.filter((p: any) => p.role === "REVIEWER").map((p: any) => p.user?.display_name || ""),
            reviewerDetails: reviewerDetails.length > 0 ? reviewerDetails : undefined,
            createdAt: pr.created_on,
            updatedAt: pr.updated_on,
            sourceBranch: pr.source?.branch?.name || "",
            targetBranch: pr.destination?.branch?.name || "",
          });
        }
      }
    } catch (e) {
      console.error(`Bitbucket error for ${workspace}:`, e);
    }
  }

  return prs;
}
