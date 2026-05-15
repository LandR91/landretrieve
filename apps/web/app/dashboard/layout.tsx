"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";
import { DashSidebar } from "@/components/dashboard/DashSidebar";
import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";

function DashTopbar() {
  const { user } = useAuth();
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

  const avatar = user?.avatar;
  const displayName = user?.displayName ?? user?.firstName ?? "Utente";

  return (
    <header
      style={{
        height: 60,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #D4D4D4",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{ fontWeight: 700, fontSize: 18, color: "#26A55B", textDecoration: "none" }}
      >
        LandRetrieve.com
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Link
          href="/"
          style={{ fontSize: 14, color: "#374151", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#26A55B")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
        >
          Visit Site
        </Link>

        {/* Avatar + dropdown */}
        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #D4D4D4",
              background: "#f0fbf5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D4D4D4")}
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={displayName}
                width={36}
                height={36}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <User size={18} color="#26A55B" />
            )}
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 180,
                backgroundColor: "#ffffff",
                border: "1px solid #D4D4D4",
                borderRadius: 8,
                padding: "4px 0",
                zIndex: 50,
              }}
            >
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Profilo", href: "/dashboard/profilo" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "9px 14px",
                    fontSize: 14,
                    color: "#111111",
                    textDecoration: "none",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {item.label}
                </Link>
              ))}
              <div style={{ height: 1, backgroundColor: "#D4D4D4", margin: "4px 0" }} />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 14px",
                  fontSize: 14,
                  color: "#dc2626",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Esci
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <DashTopbar />
      <div style={{ display: "flex", flex: 1 }}>
        <DashSidebar />
        <main
          style={{
            flex: 1,
            backgroundColor: "#f5f5f5",
            padding: 24,
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
