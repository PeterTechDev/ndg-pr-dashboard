# NDG PR Dashboard

Aggregates open pull requests from GitLab and Bitbucket into a single view for the NDG dev team.

## Setup

```bash
npm install
cp .env.example .env.local  # fill in your tokens
npm run dev
```

## Environment Variables

```env
# GitLab (self-hosted)
GITLAB_TOKEN=glpat-xxx
GITLAB_URL=https://gitlab.ndgdevelopment.com
GITLAB_GROUP_IDS=8

# Bitbucket
BITBUCKET_USERNAME=your-email
BITBUCKET_APP_PASSWORD=xxx
BITBUCKET_WORKSPACES=ndgdevelopers

# Auth (Google OAuth — @ndgcommunications.com only)
AUTH_GOOGLE_ID=xxx
AUTH_GOOGLE_SECRET=xxx
AUTH_SECRET=xxx  # openssl rand -base64 32

# Optional
MY_USERNAME=your-name  # highlights your PRs/reviews
```

## Features

- GitLab MRs + Bitbucket PRs in one view
- Filter by platform, repo, author, status, age
- Auto-refreshes every 5 minutes
- Google OAuth restricted to `@ndgcommunications.com`
- Keyboard shortcuts: `j`/`k` navigate, `Enter` open, `/` search

## Architecture

```
ndg-pr-dashboard/
├── netlify.toml                     # Netlify build + plugin config
├── .env.example                     # Template for local env vars
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main dashboard — composes all components
│   │   ├── layout.tsx               # Root layout + session provider
│   │   ├── login/page.tsx           # Google OAuth login page
│   │   ├── error.tsx                # Error boundary (route-level)
│   │   ├── global-error.tsx         # Error boundary (app-level)
│   │   ├── providers.tsx            # NextAuth SessionProvider wrapper
│   │   ├── globals.css              # Theme variables + animations
│   │   ├── api/
│   │   │   ├── prs/route.ts         # PR aggregation endpoint (auth-protected)
│   │   │   └── auth/[...nextauth]/  # NextAuth API routes
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── PRCard.tsx           # Individual PR row + expanded details
│   │   │   ├── Filters.tsx          # RepoFilter, AuthorFilter, FilterChip
│   │   │   ├── PlatformTabs.tsx     # GitLab/Bitbucket/All tab switcher
│   │   │   ├── StatCard.tsx         # Total Open / My Reviews / My PRs cards
│   │   │   ├── Pagination.tsx       # Page navigation
│   │   │   ├── EmptyState.tsx       # No results / no PRs view
│   │   │   ├── LoadingSkeleton.tsx  # Shimmer loading state
│   │   │   ├── RefreshIndicator.tsx # Sync status + manual refresh
│   │   │   ├── Icons.tsx            # SVG icons (GitLab, Bitbucket, etc.)
│   │   │   └── index.ts            # Barrel exports
│   │   └── UserMenu.tsx            # Auth user menu (sign out)
│   ├── hooks/
│   │   ├── usePRData.ts            # PR fetching, caching, refresh logic
│   │   └── useFilters.ts           # URL-synced filter state management
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth config (Google OAuth + domain check)
│   │   ├── types.ts                # TypeScript interfaces (PullRequest, etc.)
│   │   ├── constants.ts            # Status configs, platform metadata
│   │   ├── helpers.ts              # Age calculation, time formatting
│   │   ├── mock-data.ts            # Demo data (shown only on API error)
│   │   └── providers/
│   │       ├── gitlab.ts           # GitLab REST API — MRs + approvals
│   │       ├── bitbucket.ts        # Bitbucket REST API — PRs per workspace
│   │       └── github.ts           # GitHub REST API (disabled, placeholder)
│   └── middleware.ts               # Auth middleware — protects all routes
```

**Data flow:** Browser → `page.tsx` → `usePRData` hook → `/api/prs` (server) → GitLab + Bitbucket APIs → aggregated response → filtered/sorted client-side via `useFilters` hook.

## Security

### Authentication
- **Google OAuth** via NextAuth v5 — users sign in with their Google account
- **Domain restriction** — only `@ndgcommunications.com` emails can sign in (enforced in `signIn` callback in `lib/auth.ts`)
- **Middleware protection** — all routes require authentication except `/login`
- **API route protection** — `/api/prs` independently verifies the session (doesn't rely on middleware alone)

### API Tokens
- GitLab PAT and Bitbucket app password are **server-side only** — stored in environment variables, never sent to the browser
- The `/api/prs` endpoint acts as a secure proxy — it makes authenticated requests to GitLab/Bitbucket on the server and returns only PR data to the client
- **No tokens are exposed in the client bundle**

### For team members
- **No keys or tokens needed** — just sign in with your `@ndgcommunications.com` Google account
- The GitLab/Bitbucket tokens are configured once in the deployment environment (Netlify) by the admin
- Individual users don't need their own API tokens

### For admins (deployment)
- Generate a **GitLab Personal Access Token** with `read_api` scope at `gitlab.ndgdevelopment.com/-/profile/personal_access_tokens`
- Generate a **Bitbucket App Password** with `pullrequest:read` and `repository:read` permissions at `bitbucket.org/account/settings/app-passwords/`
- Set up **Google OAuth credentials** in Google Cloud Console with authorized redirect URI pointing to your Netlify domain
- All secrets go in Netlify environment variables — never committed to the repo

### Response Caching
- API responses are cached for 60 seconds to prevent excessive calls to GitLab/Bitbucket APIs
- Auto-refresh interval is 5 minutes

## Deployment (Netlify)

Connected to GitLab — auto-deploys on push to `main`. Config in `netlify.toml`.

Set all env vars in Netlify dashboard → Site settings → Environment variables.

## Tech

Next.js 16, React 19, TypeScript, Tailwind CSS 4, NextAuth v5.

---

Built by Peter Souza
