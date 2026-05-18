"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";

type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "action"; label: string; action: () => void }
  | { type: "separator" };

function useNavItems(): NavItem[] {
  const { role } = useAuth();
  const router = useRouter();

  const logout: NavItem = {
    type: "action",
    label: "Esci",
    action: () => signOut({ callbackUrl: "/login" }),
  };

  if (role === "VISITOR") {
    return [
      { type: "link", label: "Dashboard", href: "/dashboard" },
      { type: "link", label: "Attività", href: "/dashboard/attivita" },
      { type: "link", label: "Preferiti", href: "/dashboard/preferiti" },
      { type: "link", label: "Cerca Immobile", href: "/dashboard/ricerche" },
      { type: "link", label: "Messaggi", href: "/dashboard/messaggi" },
      { type: "link", label: "Le mie offerte", href: "/dashboard/offerte" },
      { type: "separator" },
      { type: "link", label: "Il mio profilo", href: "/dashboard/profilo" },
      logout,
    ];
  }

  if (role === "AGENT") {
    return [
      { type: "link", label: "Dashboard", href: "/dashboard" },
      { type: "link", label: "Attività", href: "/dashboard/attivita" },
      { type: "link", label: "Statistiche", href: "/dashboard/statistiche" },
      { type: "link", label: "Offerte", href: "/dashboard/offerte" },
      { type: "link", label: "Lead", href: "/dashboard/lead" },
      { type: "link", label: "Richieste", href: "/dashboard/richieste" },
      { type: "separator" },
      { type: "link", label: "Immobili", href: "/dashboard/immobili" },
      { type: "link", label: "Crea annuncio", href: "/dashboard/immobili/nuovo" },
      { type: "separator" },
      { type: "link", label: "Preferiti", href: "/dashboard/preferiti" },
      { type: "link", label: "Ricerche salvate", href: "/dashboard/ricerche" },
      { type: "link", label: "Fatture", href: "/dashboard/fatture" },
      { type: "link", label: "Messaggi", href: "/dashboard/messaggi" },
      { type: "separator" },
      { type: "link", label: "Il mio profilo", href: "/dashboard/profilo" },
      logout,
    ];
  }

  if (role === "AGENCY") {
    return [
      { type: "link", label: "Dashboard", href: "/dashboard" },
      { type: "link", label: "Attività", href: "/dashboard/attivita" },
      { type: "link", label: "Statistiche", href: "/dashboard/statistiche" },
      { type: "link", label: "Offerte", href: "/dashboard/offerte" },
      { type: "link", label: "Lead", href: "/dashboard/lead" },
      { type: "link", label: "Richieste", href: "/dashboard/richieste" },
      { type: "separator" },
      { type: "link", label: "Immobili", href: "/dashboard/immobili" },
      { type: "link", label: "Crea annuncio", href: "/dashboard/immobili/nuovo" },
      { type: "link", label: "Agenti", href: "/dashboard/agenti" },
      { type: "separator" },
      { type: "link", label: "Preferiti", href: "/dashboard/preferiti" },
      { type: "link", label: "Ricerche salvate", href: "/dashboard/ricerche" },
      { type: "link", label: "Fatture", href: "/dashboard/fatture" },
      { type: "link", label: "Messaggi", href: "/dashboard/messaggi" },
      { type: "separator" },
      { type: "link", label: "Profilo Agenzia", href: "/dashboard/profilo-agenzia" },
      logout,
    ];
  }

  // ADMIN
  return [
    { type: "link", label: "Dashboard", href: "/dashboard" },
    { type: "link", label: "Utenti", href: "/dashboard/utenti" },
    { type: "link", label: "Agenzie", href: "/dashboard/agenzie" },
    { type: "link", label: "Immobili", href: "/dashboard/immobili" },
    { type: "link", label: "Abbonamenti", href: "/dashboard/abbonamento" },
    { type: "separator" },
    { type: "link", label: "Il mio profilo", href: "/dashboard/profilo" },
    logout,
  ];
}

export function DashSidebar() {
  const pathname = usePathname();
  const items = useNavItems();

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        minHeight: "100vh",
        backgroundColor: "#CACACA",
        display: "flex",
        flexDirection: "column",
        paddingTop: 16,
        paddingBottom: 16,
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px" }}>
        {items.map((item, i) => {
          if (item.type === "separator") {
            return (
              <div
                key={i}
                style={{ height: 1, backgroundColor: "#B0B0B0", margin: "6px 8px" }}
              />
            );
          }

          if (item.type === "action") {
            return (
              <button
                key={i}
                onClick={item.action}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#111111",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8B8B8")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {item.label}
              </button>
            );
          }

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? "#ffffff" : "#111111",
                backgroundColor: isActive ? "#26A55B" : "transparent",
                textDecoration: "none",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "#B8B8B8";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
