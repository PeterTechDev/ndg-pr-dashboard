// TODO: GitHub provider — kept for future use. NDG currently uses GitLab + Bitbucket only.
// To enable: add "github" to the Platform type in types.ts, import in the API route,
// and set GITHUB_TOKEN + GITHUB_ORGS env vars.

import { PullRequest } from "../types";

export async function fetchGitHubPRs(): Promise<PullRequest[]> {
  const token = process.env.GITHUB_TOKEN;
  const orgs = (process.env.GITHUB_ORGS || "").split(",").filter(Boolean);

  if (!token || orgs.length === 0) return [];

  const prs: PullRequest[] = [];

  for (const org of orgs) {
    try {
      const reposRes = await fetch(
        `https://api.github.com/orgs/${org}/repos?per_page=100&sort=updated`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, next: { revalidate: 300 } }
      );
      if (!reposRes.ok) continue;
      const repos = await reposRes.json();

      for (const repo of repos) {
        const prRes = await fetch(
          `https://api.github.com/repos/${org}/${repo.name}/pulls?state=open&per_page=50`,
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, next: { revalidate: 300 } }
        );
        if (!prRes.ok) continue;
        const pulls = await prRes.json();

        for (const pr of pulls) {
          const reviewRes = await fetch(
            `https://api.github.com/repos/${org}/${repo.name}/pulls/${pr.number}/reviews`,
            { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, next: { revalidate: 300 } }
          );
          const reviews = reviewRes.ok ? await reviewRes.json() : [];
          const hasApproval = reviews.some((r: any) => r.state === "APPROVED");
          const hasChangesRequested = reviews.some((r: any) => r.state === "CHANGES_REQUESTED");

          prs.push({
            id: `github-${repo.name}-${pr.number}`,
            title: pr.title,
            author: pr.user?.login || "unknown",
            authorAvatar: pr.user?.avatar_url,
            url: pr.html_url,
            // @ts-expect-error — github platform not in Platform type until enabled
            platform: "github",
            repo: `${org}/${repo.name}`,
            status: hasChangesRequested ? "changes_requested" : hasApproval ? "approved" : "open",
            reviewers: (pr.requested_reviewers || []).map((r: any) => r.login),
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            sourceBranch: pr.head?.ref || "",
            targetBranch: pr.base?.ref || "",
          });
        }
      }
    } catch (e) {
      console.error(`GitHub error for ${org}:`, e);
    }
  }

  return prs;
}
