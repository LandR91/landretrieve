"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";

type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "action"; label: string; action: () => void }
  | { type: "section"; label: string };

function useNavItems(): NavItem[] {
  const { role } = useAuth();

  const logout: NavItem = {
    type: "action",
    label: "Esci",
    action: () => signOut({ callbackUrl: "/login" }),
  };

  if (role === "VISITOR") {
    return [
      { type: "section", label: "IMMOBILI" },
      { type: "link", label: "Preferiti", href: "/dashboard/preferiti" },
      { type: "link", label: "Ricerche salvate", href: "/dashboard/ricerche" },
      { type: "section", label: "ATTIVITÀ" },
      { type: "link", label: "Offerte", href: "/dashboard/offerte" },
      { type: "link", label: "Messaggi", href: "/dashboard/messaggi" },
      { type: "section", label: "PROFILO" },
      { type: "link", label: "Il mio profilo", href: "/dashboard/profilo" },
      logout,
    ];
  }

  if (role === "AGENT") {
    return [
      { type: "section", label: "PANORAMICA" },
      { type: "link", label: "Dashboard", href: "/dashboard" },
      { type: "link", label: "Attività", href: "/dashboard/attivita" },
      { type: "link", label: "Statistiche", href: "/dashboard/statistiche" },
      { type: "section", label: "CRM" },
      { type: "link", label: "Offerte", href: "/dashboard/offerte" },
      { type: "link", label: "Lead", href: "/dashboard/lead" },
      { type: "link", label: "Richieste", href: "/dashboard/richieste" },
      { type: "section", label: "IMMOBILI" },
      { type: "link", label: "Immobili", href: "/dashboard/immobili" },
      { type: "link", label: "Crea annuncio", href: "/dashboard/immobili/nuovo" },
      { type: "link", label: "Preferiti", href: "/dashboard/preferiti" },
      { type: "section", label: "ALTRO" },
      { type: "link", label: "Abbonamento", href: "/dashboard/abbonamento" },
      { type: "link", label: "Ricerche salvate", href: "/dashboard/ricerche" },
      { type: "link", label: "Fatture", href: "/dashboard/fatture" },
      { type: "link", label: "Messaggi", href: "/dashboard/messaggi" },
      { type: "section", label: "PROFILO" },
      { type: "link", label: "Il mio profilo", href: "/dashboard/profilo" },
      logout,
    ];
  }

  if (role === "AGENCY") {
    return [
      { type: "section", label: "PANORAMICA" },
      { type: "link", label: "Dashboard", href: "/dashboard" },
      { type: "link", label: "Attività", href: "/dashboard/attivita" },
      { type: "link", label: "Statistiche", href: "/dashboard/statistiche" },
      { type: "section", label: "CRM" },
      { type: "link", label: "Offerte", href: "/dashboard/offerte" },
      { type: "link", label: "Lead", href: "/dashboard/lead" },
      { type: "link", label: "Richieste", href: "/dashboard/richieste" },
      { type: "section", label: "IMMOBILI" },
      { type: "link", label: "Immobili", href: "/dashboard/immobili" },
      { type: "link", label: "Crea annuncio", href: "/dashboard/immobili/nuovo" },
      { type: "link", label: "Preferiti", href: "/dashboard/preferiti" },
      { type: "section", label: "TEAM" },
      { type: "link", label: "Agenti", href: "/dashboard/agenti" },
      { type: "link", label: "Aggiungi nuovo agente", href: "/dashboard/agenti/nuovo" },
      { type: "section", label: "ALTRO" },
      { type: "link", label: "Abbonamento", href: "/dashboard/abbonamento" },
      { type: "link", label: "Ricerche salvate", href: "/dashboard/ricerche" },
      { type: "link", label: "Fatture", href: "/dashboard/fatture" },
      { type: "link", label: "Messaggi", href: "/dashboard/messaggi" },
      { type: "section", label: "PROFILO" },
      { type: "link", label: "Il mio profilo", href: "/dashboard/profilo" },
      logout,
    ];
  }

  // ADMIN
  return [
    { type: "section", label: "PANORAMICA" },
    { type: "link", label: "Dashboard", href: "/dashboard" },
    { type: "section", label: "GESTIONE" },
    { type: "link", label: "Utenti", href: "/admin/profili" },
    { type: "link", label: "Agenzie", href: "/admin/profili" },
    { type: "link", label: "Immobili", href: "/admin/ipp" },
    { type: "link", label: "Abbonamenti", href: "/dashboard/abbonamento" },
    { type: "section", label: "MODERAZIONE" },
    { type: "link", label: "Badge", href: "/admin/badge" },
    { type: "link", label: "IPP", href: "/admin/ipp" },
    { type: "link", label: "Recensioni", href: "/admin/recensioni" },
    { type: "link", label: "Segnalazioni", href: "/admin/segnalazioni" },
    { type: "link", label: "Statistiche", href: "/admin/statistiche" },
    { type: "section", label: "PROFILO" },
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
          if (item.type === "section") {
            return (
              <div
                key={i}
                style={{
                  padding: "1rem 1.25rem 0.25rem",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#6b7280",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </div>
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
              key={`${item.href}-${i}`}
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
