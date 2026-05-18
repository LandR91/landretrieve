"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const GREEN = "#26A55B";
const TEXT = "#111111";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";
const BG = "#f7f7f6";

const NAV = [
  { href: "/admin", label: "Panoramica", icon: "📊", exact: true },
  { href: "/admin/profili", label: "Profili", icon: "👥" },
  { href: "/admin/statistiche", label: "Statistiche", icon: "📈" },
  { href: "/admin/badge", label: "Badge", icon: "✅" },
  { href: "/admin/ipp", label: "In Primo Piano", icon: "⭐" },
  { href: "/admin/recensioni", label: "Recensioni", icon: "💬" },
  { href: "/admin/segnalazioni", label: "Segnalazioni", icon: "🚩" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const role = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && role && role !== "ADMIN") router.replace("/dashboard");
  }, [status, role, router]);

  if (status === "loading" || !role) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${BORDER}`, borderTopColor: GREEN, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (role !== "ADMIN") return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#fff", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        {/* Logo */}
        <div style={{ padding: "1.1rem 1rem", borderBottom: `1px solid ${BORDER}` }}>
          <Link href="/admin" style={{ textDecoration: "none", display: "block" }}>
            <span style={{ fontWeight: 800, fontSize: ".9rem", color: GREEN, letterSpacing: "-.02em" }}>LandRetrieve</span>
            <span style={{ display: "block", fontSize: ".68rem", color: MUTED, fontWeight: 500, marginTop: ".05rem" }}>Admin Panel</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: ".6rem .5rem" }}>
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: ".55rem",
                  padding: ".48rem .65rem", borderRadius: 7, marginBottom: ".1rem",
                  textDecoration: "none", fontSize: ".83rem", fontWeight: active ? 700 : 500,
                  background: active ? "#f0fbf5" : "transparent",
                  color: active ? GREEN : TEXT,
                }}
              >
                <span style={{ fontSize: ".9rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: ".75rem 1rem", borderTop: `1px solid ${BORDER}` }}>
          <Link href="/dashboard" style={{ fontSize: ".75rem", color: MUTED, textDecoration: "none" }}>
            ← Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "1.75rem 2rem", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
