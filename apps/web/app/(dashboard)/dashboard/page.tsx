"use client";

import { useAuth } from "@/hooks/use-auth";
import { Home, Search, MessageSquare, Briefcase, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

type QuickLink = { label: string; href: string; icon: React.ElementType; desc: string; roles: string[] };

const QUICK_LINKS: QuickLink[] = [
  { label: "Pubblica immobile", href: "/dashboard/immobili/nuovo", icon: Home, desc: "Inserisci un nuovo annuncio", roles: ["AGENCY", "AGENT"] },
  { label: "Cerca immobili", href: "/cerca", icon: Search, desc: "Sfoglia gli immobili disponibili", roles: ["VISITOR"] },
  { label: "Messaggi", href: "/dashboard/messaggi", icon: MessageSquare, desc: "Gestisci le tue conversazioni", roles: ["AGENCY", "AGENT", "VISITOR"] },
  { label: "CRM", href: "/dashboard/crm", icon: Briefcase, desc: "Lead e trattative attive", roles: ["AGENCY", "AGENT"] },
  { label: "Agenti", href: "/dashboard/agenti", icon: Users, desc: "Gestisci il team", roles: ["AGENCY"] },
  { label: "Statistiche", href: "/dashboard/statistiche", icon: TrendingUp, desc: "Performance degli annunci", roles: ["AGENCY", "AGENT"] },
];

export default function DashboardPage() {
  const { user, role } = useAuth();

  const links = QUICK_LINKS.filter((l) => role && l.roles.includes(role));

  const displayName = user?.firstName ?? user?.displayName ?? "Utente";

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold" style={{ color: "#111111" }}>
        Ciao, {displayName}
      </h1>
      <p className="mb-8 text-sm" style={{ color: "#4b5563" }}>
        Bentornato nella tua area personale.
      </p>

      {links.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border bg-white p-5 transition-colors"
                style={{ borderColor: "#D4D4D4" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D4D4D4")}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#f0fbf5" }}
                >
                  <Icon size={20} style={{ color: "#26A55B" }} />
                </div>
                <p className="font-medium" style={{ color: "#111111" }}>{link.label}</p>
                <p className="mt-0.5 text-sm" style={{ color: "#4b5563" }}>{link.desc}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
