"use client";

import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Amministratore",
  AGENCY: "Agenzia",
  AGENT: "Agente",
  VISITOR: "Visitatore",
};

export function Topbar() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = user?.displayName ?? user?.firstName ?? user?.email ?? "Utente";
  const avatar = user?.avatar;
  const roleLabel = role ? ROLE_LABELS[role] : "";

  return (
    <header
      className="flex items-center justify-between border-b bg-white px-6"
      style={{ height: 64, borderColor: "#D4D4D4", flexShrink: 0 }}
    >
      {/* Left: page context or breadcrumb placeholder */}
      <div />

      {/* Right: user menu */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors"
          style={{ color: "#111111" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {/* Avatar */}
          <span
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: "#f0fbf5", flexShrink: 0 }}
          >
            {avatar ? (
              <Image src={avatar} alt={displayName} width={32} height={32} className="h-full w-full object-cover" />
            ) : (
              <User size={16} style={{ color: "#26A55B" }} />
            )}
          </span>

          <span className="hidden flex-col items-start sm:flex">
            <span className="font-medium leading-tight">{displayName}</span>
            <span className="text-xs leading-tight" style={{ color: "#4b5563" }}>{roleLabel}</span>
          </span>

          <ChevronDown size={14} style={{ color: "#4b5563" }} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-white py-1"
            style={{ borderColor: "#D4D4D4" }}
          >
            <Link
              href="/dashboard/profilo"
              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
              style={{ color: "#374151" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={() => setOpen(false)}
            >
              <User size={14} /> Il mio profilo
            </Link>
            <Link
              href="/dashboard/abbonamento"
              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
              style={{ color: "#374151" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={() => setOpen(false)}
            >
              <Settings size={14} /> Abbonamento
            </Link>
            <div className="my-1 border-t" style={{ borderColor: "#D4D4D4" }} />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
              style={{ color: "#dc2626" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut size={14} /> Esci
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
