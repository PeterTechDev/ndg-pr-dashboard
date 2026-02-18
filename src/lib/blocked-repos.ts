// Repos completely hidden from the dashboard
const BLOCKED_REPOS = [
  // uTour repos (no longer active)
  "utour-backend",
  "utour-frontends",
  "utour-export",
  "utour-voice",
  "utour",
  // Touchscreen kiosk repos (uTour related)
  "tributer-touchscreen",
  "beazer-touchscreen",
];

export function isBlockedRepo(repo: string): boolean {
  const repoLower = repo.toLowerCase();
  return BLOCKED_REPOS.some(b => repoLower.includes(b));
}
