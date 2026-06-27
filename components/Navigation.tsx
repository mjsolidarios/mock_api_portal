"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
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
      <Link href="/profile/user_maya" className={isActive("/profile") ? "active" : ""}>
        Library
      </Link>
      <Link href="/developer" className={isActive("/developer") ? "active" : ""}>
        API tools
      </Link>
    </nav>
  );
}
