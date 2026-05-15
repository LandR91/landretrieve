"use client";

import { useAuth } from "@/hooks/use-auth";

export default function AgentiPage() {
  const { role } = useAuth();

  if (role && role !== "AGENCY") {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#111111" }}>403 — Non autorizzato</p>
        <p style={{ fontSize: 14, color: "#4b5563", marginTop: 8 }}>
          Questa sezione è riservata alle agenzie.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111111" }}>Agenti</h1>
      <p style={{ fontSize: 14, color: "#4b5563", marginTop: 8 }}>
        Gestisci il team di agenti della tua agenzia.
      </p>
    </div>
  );
}
