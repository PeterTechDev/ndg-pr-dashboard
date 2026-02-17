import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchGitLabMRs } from "@/lib/providers/gitlab";
import { fetchBitbucketPRs } from "@/lib/providers/bitbucket";
import { PullRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

let cachedResponse: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function addAge(pr: PullRequest): PullRequest {
  const created = new Date(pr.createdAt).getTime();
  const now = Date.now();
  const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return { ...pr, ageDays };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return cached response if fresh
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedResponse.data);
  }

  try {
    const [gitlab, bitbucket] = await Promise.all([
      fetchGitLabMRs().catch(() => []),
      fetchBitbucketPRs().catch(() => []),
    ]);

    const all = [...gitlab, ...bitbucket]
      .map(addAge)
      .sort((a, b) => (b.ageDays || 0) - (a.ageDays || 0));

    const responseData = {
      prs: all,
      counts: {
        total: all.length,
        gitlab: gitlab.length,
        bitbucket: bitbucket.length,
      },
      myUsername: session.user?.name || process.env.MY_USERNAME || "",
      myEmail: session.user?.email || "",
      fetchedAt: new Date().toISOString(),
    };

    cachedResponse = { data: responseData, timestamp: Date.now() };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("PR fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch PRs" }, { status: 500 });
  }
}
