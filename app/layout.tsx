import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/Navigation";
import { SeedButton } from "@/components/SeedButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://r6portal.dev";
const SITE_NAME = "Region 6 Portal";
const SITE_DESCRIPTION =
  "A public Region 6 portal for civic games, player profiles, and cultural artifact unlocks. Browse the catalogue, collect cultural artifacts, and test the unlock API.";
const OG_IMAGE = "/og.png";

export const viewport: Viewport = {
  themeColor: "#070b11",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark"
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — Games, Artifacts & Player Libraries`,
    template: `%s · ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Region 6",
    "Western Visayas",
    "Philippines",
    "game portal",
    "civic games",
    "cultural artifacts",
    "player profile",
    "achievement API",
    "unlock API",
    "indie games",
    "museum",
    "Panay"
  ],
  authors: [{ name: "Region 6 Portal Team", url: SITE_URL }],
  creator: "Region 6 Portal Team",
  publisher: "Region 6 Portal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  alternates: {
    canonical: SITE_URL
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — A game portal for artifact-led discovery`,
    description:
      "Browse civic games, collect cultural artifacts, and test the unlock API that connects play sessions to public player libraries.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Region 6 Portal — A game portal for artifact-led discovery",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@r6portal",
    creator: "@r6portal",
    title: `${SITE_NAME} — A game portal for artifact-led discovery`,
    description:
      "Browse civic games, collect cultural artifacts, and test the unlock API that connects play sessions to public player libraries.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Region 6 Portal — A game portal for artifact-led discovery"
      }
    ]
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false
  },
  other: {
    "geo.region": "PH-06",
    "geo.placename": "Western Visayas, Philippines",
    "theme-color": "#070b11",
    "msapplication-TileColor": "#070b11"
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

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: SITE_DESCRIPTION,
    sameAs: [
      "https://github.com/mjsolidarios/mock_api_portal"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      areaServed: "PH",
      availableLanguage: ["en"]
    }
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-PH",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/games?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
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
