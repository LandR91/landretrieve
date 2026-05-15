"use client";

import { useAuth } from "@/hooks/use-auth";

export default function AbbonamentoPage() {
  const { role } = useAuth();

  if (role && role !== "AGENT" && role !== "AGENCY") {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#111111" }}>403 — Non autorizzato</p>
        <p style={{ fontSize: 14, color: "#4b5563", marginTop: 8 }}>
          Questa sezione è riservata ad agenti e agenzie.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111111" }}>Abbonamento</h1>
      <p style={{ fontSize: 14, color: "#4b5563", marginTop: 8 }}>
        Gestisci il tuo piano di abbonamento.
      </p>
    </div>
  );
}
