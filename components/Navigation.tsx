"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationProps = {
  libraryHref: string;
};

export function Navigation({ libraryHref }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav aria-label="Primary navigation">
      <Link href="/" className={isActive("/") ? "active" : ""}>
        Discover
      </Link>
      <Link href={libraryHref} className={isActive("/profile") ? "active" : ""}>
        Library
      </Link>
      <Link href="/developer" className={isActive("/developer") ? "active" : ""}>
        API tools
      </Link>
    </nav>
  );
}
