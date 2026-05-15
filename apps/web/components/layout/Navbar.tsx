"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";
import { User } from "lucide-react";

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const { user, isAuthenticated } = useAuth();
  const [solid, setSolid] = useState(!transparent);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [altroOpen, setAltroOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const altroRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transparent) { setSolid(true); return; }
    function onScroll() { setSolid(window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (altroRef.current && !altroRef.current.contains(e.target as Node)) setAltroOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSolid = solid || !transparent;
  const avatar = user?.avatar;
  const displayName = user?.displayName ?? user?.firstName ?? "Utente";

  // Colors based on solid/transparent
  const linkColor = isSolid ? "#374151" : "rgba(255,255,255,.88)";
  const linkHover = isSolid ? "#111111" : "#ffffff";
  const loginBorder = isSolid ? "#D4D4D4" : "rgba(255,255,255,.4)";
  const loginColor = isSolid ? "#111111" : "rgba(255,255,255,.9)";
  const loginHoverBg = isSolid ? "transparent" : "rgba(255,255,255,.1)";
  const loginHoverBorder = isSolid ? "#26A55B" : "#ffffff";
  const loginHoverColor = isSolid ? "#26A55B" : "#ffffff";
  const hamburgerBg = isSolid ? "#111111" : "#ffffff";

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          minHeight: 72,
          display: "flex",
          alignItems: "center",
          padding: "20px 3rem",
          transition: "background .4s ease, backdrop-filter .4s ease",
          background: isSolid ? "rgba(255,255,255,.97)" : "transparent",
          borderBottom: isSolid ? "1px solid #D4D4D4" : "none",
          backdropFilter: isSolid ? "blur(12px)" : "none",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: isSolid ? "#111111" : "#ffffff",
              transition: "color .4s",
            }}
          >
            LandRetrieve.com
          </span>
        </Link>

        {/* Center nav links */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          className="nav-center-links"
        >
          {[
            { label: "Agenzie", href: "/agenzie" },
            { label: "Agenti", href: "/agenti" },
            { label: "Piani", href: "/piani" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: ".45rem .9rem",
                borderRadius: 6,
                fontSize: "1rem",
                fontWeight: 500,
                color: linkColor,
                textDecoration: "none",
                transition: "color .2s",
                letterSpacing: ".01em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = linkHover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
            >
              {item.label}
            </Link>
          ))}

          {/* Altro dropdown */}
          <div ref={altroRef} style={{ position: "relative" }}>
            <button
              onClick={() => setAltroOpen((v) => !v)}
              style={{
                padding: ".45rem .9rem",
                borderRadius: 6,
                fontSize: "1rem",
                fontWeight: 500,
                color: linkColor,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                border: "none",
                background: "transparent",
                letterSpacing: ".01em",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = linkHover;
                if (isSolid) e.currentTarget.style.backgroundColor = "#f5f5f5";
                else e.currentTarget.style.backgroundColor = "rgba(255,255,255,.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = linkColor;
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Altro <span style={{ fontSize: ".8em" }}>▾</span>
            </button>
            {altroOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  minWidth: 160,
                  backgroundColor: "#ffffff",
                  border: "1px solid #D4D4D4",
                  borderRadius: 8,
                  padding: "6px 0",
                  zIndex: 600,
                }}
              >
                {[
                  { label: "Chi Siamo", href: "/chi-siamo" },
                  { label: "Contatti", href: "/contatti" },
                  { label: "FAQ", href: "/faq" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setAltroOpen(false)}
                    style={{
                      display: "block",
                      padding: ".55rem 1rem",
                      fontSize: ".9rem",
                      fontWeight: 500,
                      color: "#374151",
                      textDecoration: "none",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {/* Lang */}
          <span style={{ fontSize: ".875rem", color: isSolid ? "#374151" : "rgba(255,255,255,.88)", cursor: "pointer" }}>
            🇮🇹 IT
          </span>

          {isAuthenticated ? (
            /* Avatar dropdown */
            <div ref={avatarRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `2px solid ${isSolid ? "#D4D4D4" : "rgba(255,255,255,.5)"}`,
                  background: "#f0fbf5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  transition: "border-color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#26A55B")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = isSolid ? "#D4D4D4" : "rgba(255,255,255,.5)")}
              >
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName}
                    width={38}
                    height={38}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <User size={18} color="#26A55B" />
                )}
              </button>

              {avatarOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: 188,
                    backgroundColor: "#ffffff",
                    border: "1px solid #D4D4D4",
                    borderRadius: 8,
                    padding: "4px 0",
                    zIndex: 600,
                  }}
                >
                  <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f3f4f6" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111111", margin: 0 }}>{displayName}</p>
                  </div>
                  {[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Profilo", href: "/dashboard/profilo" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setAvatarOpen(false)}
                      style={{
                        display: "block",
                        padding: "9px 14px",
                        fontSize: 14,
                        color: "#111111",
                        textDecoration: "none",
                        transition: "background-color .15s",
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
                      transition: "background-color .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    Esci
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: ".65rem 1.4rem",
                  borderRadius: 6,
                  border: `1.5px solid ${loginBorder}`,
                  background: "transparent",
                  fontSize: ".925rem",
                  fontWeight: 500,
                  color: loginColor,
                  cursor: "pointer",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "border-color .2s, color .2s, background .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = loginHoverBorder;
                  e.currentTarget.style.color = loginHoverColor;
                  e.currentTarget.style.backgroundColor = loginHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = loginBorder;
                  e.currentTarget.style.color = loginColor;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Accedi
              </Link>
              <Link
                href="/registrati"
                style={{
                  padding: ".65rem 1.5rem",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#26A55B",
                  color: "#ffffff",
                  fontSize: ".925rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background-color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
              >
                Registrati
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            style={{
              display: "none",
              flexDirection: "column",
              gap: 5,
              cursor: "pointer",
              padding: 4,
              marginLeft: ".5rem",
              background: "transparent",
              border: "none",
            }}
            className="hamburger-btn"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{ width: 22, height: 2, borderRadius: 2, backgroundColor: hamburgerBg, display: "block", transition: "all .3s" }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 72,
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #D4D4D4",
            zIndex: 499,
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
            gap: 2,
          }}
        >
          {[
            { label: "Agenzie", href: "/agenzie" },
            { label: "Agenti", href: "/agenti" },
            { label: "Piani", href: "/piani" },
            { label: "Chi Siamo", href: "/chi-siamo" },
            { label: "Contatti", href: "/contatti" },
            { label: "FAQ", href: "/faq" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: ".7rem 1rem",
                borderRadius: 6,
                fontSize: ".9rem",
                fontWeight: 500,
                color: "#374151",
                textDecoration: "none",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {item.label}
            </Link>
          ))}
          <div style={{ height: 1, backgroundColor: "#D4D4D4", margin: "4px 0" }} />
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ padding: ".7rem 1rem", fontSize: ".9rem", color: "#374151", textDecoration: "none" }}>Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ textAlign: "left", padding: ".7rem 1rem", fontSize: ".9rem", color: "#dc2626", background: "transparent", border: "none", cursor: "pointer" }}>Esci</button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8, padding: ".5rem 0" }}>
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: "center", padding: ".65rem", border: "1.5px solid #D4D4D4", borderRadius: 6, fontSize: ".9rem", color: "#111111", textDecoration: "none" }}>Accedi</Link>
              <Link href="/registrati" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: "center", padding: ".65rem", backgroundColor: "#26A55B", borderRadius: 6, fontSize: ".9rem", color: "#ffffff", textDecoration: "none" }}>Registrati</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-center-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
