"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Search,
  MessageSquare,
  Users,
  Briefcase,
  User,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "AGENCY", "AGENT", "VISITOR"] },
  { label: "Immobili", href: "/dashboard/immobili", icon: Home, roles: ["AGENCY", "AGENT"] },
  { label: "Ricerche", href: "/dashboard/ricerche", icon: Search, roles: ["VISITOR"] },
  { label: "Messaggi", href: "/dashboard/messaggi", icon: MessageSquare, roles: ["AGENCY", "AGENT", "VISITOR"] },
  { label: "Agenti", href: "/dashboard/agenti", icon: Users, roles: ["AGENCY"] },
  { label: "CRM", href: "/dashboard/crm", icon: Briefcase, roles: ["AGENCY", "AGENT"] },
  { label: "Utenti", href: "/admin/utenti", icon: Users, roles: ["ADMIN"] },
  { label: "Agenzie", href: "/admin/agenzie", icon: Building2, roles: ["ADMIN"] },
  { label: "Profilo", href: "/dashboard/profilo", icon: User, roles: ["ADMIN", "AGENCY", "AGENT", "VISITOR"] },
  { label: "Abbonamento", href: "/dashboard/abbonamento", icon: CreditCard, roles: ["AGENCY", "AGENT", "VISITOR"] },
  { label: "Impostazioni", href: "/admin/impostazioni", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const { role } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const items = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  return (
    <aside
      className="relative flex flex-col border-r bg-white transition-all duration-200"
      style={{
        width: collapsed ? 64 : 220,
        minHeight: "100vh",
        borderColor: "#D4D4D4",
        flexShrink: 0,
      }}
    >
      {/* Logo area */}
      <div
        className="flex items-center border-b px-4 py-4"
        style={{ borderColor: "#D4D4D4", height: 64 }}
      >
        {!collapsed && (
          <Link href="/" className="text-base font-bold" style={{ color: "#26A55B" }}>
            LandRetrieve
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto text-base font-bold" style={{ color: "#26A55B" }}>
            LR
          </Link>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium transition-colors"
              style={{
                color: active ? "#26A55B" : "#374151",
                backgroundColor: active ? "#f0fbf5" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white text-gray-500 transition-colors"
        style={{ borderColor: "#D4D4D4" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
