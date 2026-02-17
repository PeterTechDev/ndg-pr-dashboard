import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pr.ndg.dev"),
  title: "PR Dashboard — NDG",
  description: "GitHub + GitLab + Bitbucket pull requests in one view. Free & open source.",
  openGraph: {
    title: "PR Dashboard",
    description: "GitHub + GitLab + Bitbucket pull requests in one view. Free & open source.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PR Dashboard — GitHub + GitLab + Bitbucket in one view" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PR Dashboard",
    description: "GitHub + GitLab + Bitbucket pull requests in one view. Free & open source.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--color-surface-0)] text-[var(--color-text-primary)] min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
