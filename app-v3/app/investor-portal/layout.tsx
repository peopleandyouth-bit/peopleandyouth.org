import type { ReactNode } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/investor-portal", label: "Overview" },
  { href: "/investor-portal/relationship", label: "Relationship" },
  { href: "/investor-portal/documents", label: "Documents" },
  { href: "/investor-portal/profile", label: "Profile" },
  { href: "/investor-portal/security", label: "Security" },
];

export default function InvestorPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a1020] text-[#f5f0e6]">
      {/* Top bar */}
      <header className="border-b border-[#f5f0e6]/8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/investor-portal" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#c8a56b]/40 bg-[#c8a56b]/10 text-[11px] font-bold tracking-widest text-[#c8a56b]">
              P&amp;Y
            </span>
            <span className="hidden text-sm font-medium tracking-[0.2em] text-[#f5f0e6]/70 sm:inline">
              PEOPLE &amp; YOUTH
            </span>
          </Link>

          <span className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
            Investor Portal
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:flex-row lg:px-10">
        {/* Sidebar navigation */}
        <aside className="lg:w-52 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto border-b border-[#f5f0e6]/8 pb-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-4 py-2.5 text-sm tracking-wide text-[#f5f0e6]/60 transition hover:bg-[#f5f0e6]/[0.04] hover:text-[#f5f0e6]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#f5f0e6]/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 lg:px-10">
          <p className="text-[10px] tracking-[0.28em] text-[#f5f0e6]/25">
            PEOPLE &amp; YOUTH · INSTITUTIONAL
          </p>
          <p className="text-[11px] tracking-wider text-[#f5f0e6]/25">
            Building Institutions. Building Generations.
          </p>
        </div>
      </footer>
    </div>
  );
}