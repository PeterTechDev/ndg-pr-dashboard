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

      const repos = reposData.values || [];

      // Fetch PRs in parallel batches of 10
      const BATCH_SIZE = 10;
      for (let i = 0; i < repos.length; i += BATCH_SIZE) {
        const batch = repos.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map(async (repo: any) => {
            try {
              const prRes = await fetch(
                `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo.slug}/pullrequests?state=OPEN&pagelen=50`,
                { headers: { Authorization: `Basic ${auth}` }, next: { revalidate: 300 } }
              );
              if (!prRes.ok) return [];
              const prData = await prRes.json();

              return (prData.values || []).map((pr: any) => {
                const participants = pr.participants || [];
                const hasApproval = participants.some((p: any) => p.approved);
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

                return {
                  id: `bitbucket-${repo.slug}-${pr.id}`,
                  title: pr.title,
                  author: pr.author?.display_name || pr.author?.nickname || "unknown",
                  authorAvatar: pr.author?.links?.avatar?.href,
                  url: pr.links?.html?.href || "",
                  platform: "bitbucket" as const,
                  repo: `${workspace}/${repo.slug}`,
                  status: hasChangesRequested ? "changes_requested" as const : hasApproval ? "approved" as const : "open" as const,
                  reviewers: participants.filter((p: any) => p.role === "REVIEWER").map((p: any) => p.user?.display_name || ""),
                  reviewerDetails: reviewerDetails.length > 0 ? reviewerDetails : undefined,
                  createdAt: pr.created_on,
                  updatedAt: pr.updated_on,
                  sourceBranch: pr.source?.branch?.name || "",
                  targetBranch: pr.destination?.branch?.name || "",
                };
              });
            } catch {
              return [];
            }
          })
        );
        prs.push(...results.flat());
      }
    } catch (e) {
      console.error(`Bitbucket error for ${workspace}:`, e);
    }
  }

  return prs;
}

export async function fetchBitbucketRecentlyClosed(): Promise<PullRequest[]> {
  const username = process.env.BITBUCKET_USERNAME;
  const appPassword = process.env.BITBUCKET_APP_PASSWORD;
  const workspaces = (process.env.BITBUCKET_WORKSPACES || "").split(",").filter(Boolean);

  if (!username || !appPassword || workspaces.length === 0) return [];

  const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
  const prs: PullRequest[] = [];
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  for (const workspace of workspaces) {
    try {
      const reposRes = await fetch(
        `https://api.bitbucket.org/2.0/repositories/${workspace}?pagelen=100`,
        { headers: { Authorization: `Basic ${auth}` }, next: { revalidate: 300 } }
      );
      if (!reposRes.ok) continue;
      const reposData = await reposRes.json();
      const repos = reposData.values || [];

      // Only check top 10 most recently updated repos to limit API calls
      const topRepos = repos.slice(0, 10);

      const results = await Promise.all(
        topRepos.map(async (repo: any) => {
          try {
            const prRes = await fetch(
              `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo.slug}/pullrequests?state=MERGED&state=DECLINED&pagelen=5&sort=-updated_on`,
              { headers: { Authorization: `Basic ${auth}` }, next: { revalidate: 300 } }
            );
            if (!prRes.ok) return [];
            const prData = await prRes.json();

            return (prData.values || [])
              .filter((pr: any) => new Date(pr.updated_on) > twoDaysAgo)
              .map((pr: any) => ({
                id: `bitbucket-${repo.slug}-${pr.id}`,
                title: pr.title,
                author: pr.author?.display_name || pr.author?.nickname || "unknown",
                authorAvatar: pr.author?.links?.avatar?.href,
                url: pr.links?.html?.href || "",
                platform: "bitbucket" as const,
                repo: `${workspace}/${repo.slug}`,
                status: (pr.state === "MERGED" ? "merged" : "declined") as PullRequest["status"],
                reviewers: (pr.participants || []).filter((p: any) => p.role === "REVIEWER").map((p: any) => p.user?.display_name || ""),
                createdAt: pr.created_on,
                updatedAt: pr.updated_on,
                sourceBranch: pr.source?.branch?.name || "",
                targetBranch: pr.destination?.branch?.name || "",
              }));
          } catch {
            return [];
          }
        })
      );
      prs.push(...results.flat());
    } catch (e) {
      console.error(`Bitbucket recently closed error for ${workspace}:`, e);
    }
  }

  return prs;
}
