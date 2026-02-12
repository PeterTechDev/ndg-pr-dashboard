<div align="center">

# 🔀 NDG PR Dashboard

**One dashboard for every open pull request — GitHub, GitLab, and Bitbucket.**

Stop losing PRs across platforms. Start shipping faster.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

</div>

---

<div align="center">

<!-- TODO: Replace with actual screenshot -->
<img src="docs/screenshot.png" alt="NDG PR Dashboard" width="800" />

*Screenshot coming soon — run it locally to see it in action!*

</div>

---

## 🤔 Why This Exists

If you work across multiple Git platforms, you know the pain:

- PRs get lost in email notifications you never read
- You forget you have a 5-day-old review sitting in GitLab
- Your team's Bitbucket PRs are invisible to your GitHub workflow
- Context switching between 3 dashboards kills your flow

**NDG PR Dashboard** is the single pane of glass. One URL, every open PR, color-coded by age so stale reviews scream at you.

---

## ✨ Features

- 🔗 **Multi-platform** — GitHub, GitLab, and Bitbucket in one view
- 🎨 **Dark-mode native** — Beautiful, minimal UI that's easy on the eyes
- ⏱️ **Age tracking** — PRs color-coded by age (fresh → aging → stale)
- 🔍 **Filter & sort** — By platform, author, age, or last updated
- 👤 **Author avatars** — Quickly see who's waiting on reviews
- 🔄 **Auto-refresh** — Syncs every 5 minutes, no manual reload
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🎭 **Demo mode** — Falls back to mock data when no tokens are configured

---

## 🚀 Quick Setup

### 1. Clone & install

```bash
git clone https://github.com/petersouza/ndg-pr-dashboard.git
cd ndg-pr-dashboard
npm install
```

### 2. Configure environment

Create a `.env.local` file:

```env
# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_ORGS=your-org,another-org        # comma-separated

# GitLab
GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
GITLAB_URL=https://gitlab.com            # or self-hosted URL

# Bitbucket
BITBUCKET_USERNAME=your-username
BITBUCKET_APP_PASSWORD=xxxxxxxxxxxx
```

> **No tokens?** No problem — the dashboard runs in demo mode with mock data.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/) |
| Language | [TypeScript 5](https://typescriptlang.org/) |
| APIs | GitHub REST, GitLab REST, Bitbucket REST |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main dashboard UI
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Theme & animations
│   └── api/prs/route.ts   # PR aggregation endpoint
└── lib/
    ├── types.ts           # TypeScript interfaces
    ├── mock-data.ts       # Demo/fallback data
    └── providers/
        ├── github.ts      # GitHub API integration
        ├── gitlab.ts      # GitLab API integration
        └── bitbucket.ts   # Bitbucket API integration
```

---

## 📄 License

ISC

---

<div align="center">

Built by [Peter Souza](https://github.com/petersouza)

</div>
