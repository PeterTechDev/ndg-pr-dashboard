"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)]">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-8 shadow-2xl">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-4">
              <svg className="w-7 h-7 text-[var(--color-accent-github)]" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6a2.5 2.5 0 01-2.5 2.5H7.5v1.878a2.251 2.251 0 11-1.5 0V5.622a2.251 2.251 0 111.5 0v1.878H10A1 1 0 0011 6v-.628A2.251 2.251 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">PR Dashboard</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">NDG Communications</p>
          </div>

          {/* Error */}
          {error === "AccessDenied" && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
              Access restricted to NDG Communications employees
            </div>
          )}

          {/* Sign in button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] hover:border-[var(--color-text-tertiary)] transition-all duration-200 cursor-pointer text-sm font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-6">
            @ndgcommunications.com accounts only
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-surface-0)]" />}>
      <LoginForm />
    </Suspense>
  );
}
