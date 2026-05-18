"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NewListingPayload } from "@/hooks/use-new-listing-notification";

const GREEN = "#26A55B";
const GREEN_DARK = "#1d8a4b";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";

interface Props {
  notification: NewListingPayload;
  onDismiss: () => void;
}

function formatPrice(price: number | null, currency: string) {
  if (price == null) return null;
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function NewListingToast({ notification, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(onDismiss, 300);
  }

  const price = formatPrice(notification.price, notification.currency);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        width: 320,
        background: "#fff",
        border: `1.5px solid ${GREEN}`,
        borderRadius: 12,
        padding: "1rem 1.1rem",
        zIndex: 9999,
        transform: visible ? "translateY(0)" : "translateY(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform .3s cubic-bezier(.16,1,.3,1), opacity .3s",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".6rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
          <span style={{ fontSize: "1.1rem" }}>🏡</span>
          <span style={{ fontSize: ".72rem", fontWeight: 700, color: GREEN, letterSpacing: ".06em", textTransform: "uppercase" }}>
            Nuovo immobile
          </span>
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1.1rem", lineHeight: 1, padding: 0 }}
          aria-label="Chiudi notifica"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <p style={{ fontWeight: 700, color: TEXT, fontSize: ".88rem", margin: "0 0 .2rem", lineHeight: 1.3 }}>
        {notification.title}
      </p>
      <p style={{ fontSize: ".78rem", color: TEXT_SOFT, margin: "0 0 .55rem" }}>
        {notification.categoria && <>{notification.categoria} · </>}
        📍 {notification.comune}
        {price && <> · <strong style={{ color: GREEN }}>{price}</strong></>}
      </p>

      {/* CTA */}
      <Link
        href={`/immobili/${notification.slug}`}
        onClick={handleDismiss}
        style={{
          display: "block",
          textAlign: "center",
          padding: ".45rem",
          background: GREEN,
          color: "#fff",
          borderRadius: 7,
          fontSize: ".8rem",
          fontWeight: 700,
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
      >
        Vedi immobile
      </Link>

      {/* Progress bar */}
      <div style={{ marginTop: ".6rem", height: 2, borderRadius: 2, background: "#f0f0f0", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            background: GREEN,
            animation: "shrink 8s linear forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
