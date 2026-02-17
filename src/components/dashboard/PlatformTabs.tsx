import { Platform } from "@/lib/types";
import { GitLabIcon, BitbucketIcon } from "./Icons";

export function PlatformTabs({
  active,
  onChange,
  counts,
}: {
  active: Platform | "all";
  onChange: (v: Platform | "all") => void;
  counts: Record<string, number>;
}) {
  const tabs: { key: Platform | "all"; label: string; icon?: typeof GitLabIcon; }[] = [
    { key: "all", label: "All" },
    { key: "gitlab", label: "GitLab", icon: GitLabIcon },
    { key: "bitbucket", label: "Bitbucket", icon: BitbucketIcon },
  ];

  return (
    <div className="flex gap-1 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg p-1" role="tablist" aria-label="Filter by platform">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        const count = tab.key === "all" ? counts.total : counts[tab.key] || 0;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-label={`${tab.label} (${count})`}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "" : "opacity-60"}`} />}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={`text-xs tabular-nums ${isActive ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-tertiary)]"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
