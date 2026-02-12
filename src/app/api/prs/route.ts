import { NextResponse } from "next/server";
import { fetchGitLabMRs } from "@/lib/providers/gitlab";
import { fetchBitbucketPRs } from "@/lib/providers/bitbucket";
import { PullRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

function addAge(pr: PullRequest): PullRequest {
  const created = new Date(pr.createdAt).getTime();
  const now = Date.now();
  const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return { ...pr, ageDays };
}

export async function GET() {
  try {
    const [gitlab, bitbucket] = await Promise.all([
      fetchGitLabMRs().catch(() => []),
      fetchBitbucketPRs().catch(() => []),
    ]);

    const all = [...gitlab, ...bitbucket]
      .map(addAge)
      .sort((a, b) => (b.ageDays || 0) - (a.ageDays || 0));

    return NextResponse.json({
      prs: all,
      counts: {
        total: all.length,
        gitlab: gitlab.length,
        bitbucket: bitbucket.length,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PR fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch PRs" }, { status: 500 });
  }
}
