import type { Metadata } from "next";

// Auth pages must not be indexed: thin content, and the same form is served
// under all 12 locale prefixes.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
