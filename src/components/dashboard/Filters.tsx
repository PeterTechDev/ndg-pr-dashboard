"use client";

import { useState, useEffect, useRef } from "react";
import { SortKey } from "@/lib/constants";

export function AuthorFilter({
  authors,
  active,
  onChange,
}: {
  authors: { name: string; avatar?: string }[];
  active: string;
  onChange: (v: string) => void;
}) {
  if (authors.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Filter by author">
      <button
        onClick={() => onChange("all")}
        aria-label="Show all authors"
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          active === "all"
            ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)]"
            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
        }`}
      >
        All
      </button>
      {authors.map((a) => (
        <button
          key={a.name}
          onClick={() => onChange(a.name)}
          title={active === a.name ? `Clear filter: ${a.name}` : `Filter by ${a.name}`}
          aria-label={`Filter by author ${a.name}`}
          aria-pressed={active === a.name}
          className={`relative flex items-center gap-1.5 rounded-full transition-all cursor-pointer ${
            active === a.name
              ? "ring-2 ring-[var(--color-accent-github)] ring-offset-1 ring-offset-[var(--color-surface-0)]"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          {a.avatar ? (
            <img src={a.avatar} alt={a.name} width={28} height={28} className="w-7 h-7 rounded-full bg-[var(--color-surface-3)]" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-xs font-medium text-[var(--color-text-secondary)]">
              {a.name.charAt(0)}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-tertiary)]">Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        aria-label="Sort pull requests"
        className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-2 py-1 text-xs text-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-github)] cursor-pointer"
      >
        <option value="age">Oldest first</option>
        <option value="updated">Recently updated</option>
        <option value="author">By author</option>
      </select>
    </div>
  );
}

export function RepoFilter({
  repos,
  selected,
  onChange,
}: {
  repos: string[];
  selected: Set<string>;
  onChange: (v: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setRepoSearch(""); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filteredRepos = repoSearch
    ? repos.filter((r) => r.toLowerCase().includes(repoSearch.toLowerCase()))
    : repos;

  const label = selected.size === 0 ? "All repos" : selected.size === 1 ? [...selected][0] : `${selected.size} repos`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Filter by repository"
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
          selected.size > 0
            ? "bg-[var(--color-accent-github)]/10 text-[var(--color-accent-github)] border-[var(--color-accent-github)]/30"
            : "text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
        }`}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span className="max-w-[100px] truncate">{label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 max-h-72 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg shadow-xl py-1">
          <div className="px-2 pb-1">
            <input
              ref={searchRef}
              type="text"
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              placeholder="Search repos…"
              aria-label="Search repositories"
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded px-2 py-1 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-github)]"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            <button
              onClick={() => { onChange(new Set()); setOpen(false); setRepoSearch(""); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer ${
                selected.size === 0 ? "text-[var(--color-accent-github)] font-medium" : "text-[var(--color-text-secondary)]"
              }`}
            >
              All repos
            </button>
            <div className="h-px bg-[var(--color-border)] my-1" />
            {filteredRepos.map((repo) => {
              const isActive = selected.has(repo);
              return (
                <button
                  key={repo}
                  onClick={() => {
                    const next = new Set(selected);
                    if (isActive) next.delete(repo); else next.add(repo);
                    onChange(next);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer flex items-center gap-2 ${
                    isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                    isActive ? "bg-[var(--color-accent-github)] border-[var(--color-accent-github)]" : "border-[var(--color-border)]"
                  }`}>
                    {isActive && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{repo}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Filter: ${label}`}
      aria-pressed={active}
      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
        active
          ? `${color || "bg-[var(--color-accent-github)]/10 text-[var(--color-accent-github)]"} border-current/30`
          : "text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
      }`}
    >
      {label}
    </button>
  );
}
