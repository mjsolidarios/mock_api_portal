import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Region 6 Portal",
  description: "A public Region 6 portal for civic games, player profiles, and cultural artifact unlocks.",
  openGraph: {
    title: "Region 6 Portal",
    description: "Browse Region 6 games, collect cultural artifacts, and test the unlock API.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <header className="shell-header">
          <Link className="brand" href="/">
            R6 Store
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/">Discover</Link>
            <Link href="/profile/user_maya">Library</Link>
            <Link href="/developer">API tools</Link>
          </nav>
          <div className="shell-actions" aria-label="Store shortcuts">
            <span className="search-chip">Search games</span>
            <Link className="profile-chip" href="/profile/user_lio">
              Lio
            </Link>
          </div>
        </header>
        <main id="content">{children}</main>
      </body>
    </html>
  );
}
