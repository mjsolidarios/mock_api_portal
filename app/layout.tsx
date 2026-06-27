import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/Navigation";
import { SeedButton } from "@/components/SeedButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Region 6 Portal",
  description:
    "A public Region 6 portal for civic games, player profiles, and cultural artifact unlocks.",
  openGraph: {
    title: "Region 6 Portal",
    description: "Browse Region 6 games, collect cultural artifacts, and test the unlock API.",
    type: "website"
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

async function getActiveProfile() {
  const profile =
    (await prisma.user.findUnique({ where: { id: "user_lio" } })) ??
    (await prisma.user.findFirst({ orderBy: { createdAt: "asc" } }));
  return profile;
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getActiveProfile();

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <header className="shell-header">
          <Link className="brand" href="/">
            R6 Portal
          </Link>
          <Navigation />
          <div className="shell-actions" aria-label="Portal shortcuts">
            <SeedButton />
            <label className="search-field" htmlFor="portal-search">
              <Search aria-hidden="true" />
              <input
                id="portal-search"
                type="search"
                placeholder="Search games"
                autoComplete="off"
              />
              <span className="search-shortcut" aria-hidden="true">
                /
              </span>
            </label>
            {profile ? (
              <Link className="profile-chip" href={`/profile/${profile.id}`}>
                <Avatar className="profile-chip-avatar">
                  <AvatarImage src={profile.avatarUrl} alt={`${profile.name} avatar`} />
                  <AvatarFallback>
                    {profile.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {profile.name.split(" ")[0]}
              </Link>
            ) : null}
          </div>
        </header>
        <main id="content">{children}</main>
        <footer className="shell-footer" aria-label="Site footer">
          <div className="shell-footer-brand">
            <Link className="footer-brand" href="/">
              R6 Portal
            </Link>
            <p>
              Public Region 6 game catalogue, cultural artifact records, and unlock API
              testing for local creators.
            </p>
          </div>
          <nav className="shell-footer-links" aria-label="Footer navigation">
            <div>
              <h2>Explore</h2>
              <Link href="/">Discover</Link>
              <Link href="/games">Game catalogue</Link>
              <Link href="/profile/user_maya">Player library</Link>
            </div>
            <div>
              <h2>Build</h2>
              <Link href="/developer">API tools</Link>
              <Link href="/api/games">Games endpoint</Link>
              <Link href="/api/achievements/unlock">Unlock route</Link>
            </div>
          </nav>
          <div className="shell-footer-meta">
            <p>Demo data only. Replace seeded keys before deployment.</p>
            <span>Region 6 Portal MVP</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
