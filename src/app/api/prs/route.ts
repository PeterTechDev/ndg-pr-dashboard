import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchGitLabMRs, fetchGitLabRecentlyClosed } from "@/lib/providers/gitlab";
import { fetchBitbucketPRs, fetchBitbucketRecentlyClosed } from "@/lib/providers/bitbucket";
import { PullRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

let cachedResponse: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

let cachedRecentlyClosed: { data: PullRequest[]; timestamp: number } | null = null;
const RECENTLY_CLOSED_TTL_MS = 5 * 60 * 1000; // 5 minutes

function addAge(pr: PullRequest): PullRequest {
  const created = new Date(pr.createdAt).getTime();
  const now = Date.now();
  const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return { ...pr, ageDays };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bustCache = searchParams.has("bust");

  // Return cached response if fresh (unless cache bust requested)
  if (!bustCache && cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL_MS) {
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

    // Fetch recently closed (with its own longer cache)
    let recentlyClosed: PullRequest[] = [];
    if (!cachedRecentlyClosed || bustCache || Date.now() - cachedRecentlyClosed.timestamp > RECENTLY_CLOSED_TTL_MS) {
      const [closedGitlab, closedBitbucket] = await Promise.all([
        fetchGitLabRecentlyClosed().catch(() => []),
        fetchBitbucketRecentlyClosed().catch(() => []),
      ]);
      recentlyClosed = [...closedGitlab, ...closedBitbucket]
        .map(addAge)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10); // Max 10 recently closed
      cachedRecentlyClosed = { data: recentlyClosed, timestamp: Date.now() };
    } else {
      recentlyClosed = cachedRecentlyClosed.data;
    }

    const responseData = {
      prs: all,
      recentlyClosed,
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
