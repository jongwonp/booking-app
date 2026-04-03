"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/listings", label: "숙소 관리" },
  { href: "/admin/reservations", label: "예약 관리" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/admin" && pathname?.startsWith(link.href));

        const base =
          "block rounded px-3 py-2 text-sm transition-colors";
        const activeClass = "bg-gray-900 text-white";
        const inactiveClass = "text-gray-700 hover:bg-gray-100";

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${base} ${
              active ? activeClass : inactiveClass
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
