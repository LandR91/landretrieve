"use client";

import { useAuth } from "@/hooks/use-auth";

type StatBox = { label: string; value: string };

function useStats(): StatBox[] {
  const { role } = useAuth();

  if (role === "VISITOR") {
    return [
      { label: "Ricerche salvate", value: "0" },
      { label: "Preferiti", value: "0" },
      { label: "Messaggi", value: "0" },
      { label: "Offerte inviate", value: "0" },
    ];
  }
  if (role === "AGENT") {
    return [
      { label: "Immobili pubblicati", value: "0" },
      { label: "Lead attivi", value: "0" },
      { label: "Messaggi", value: "0" },
      { label: "Offerte ricevute", value: "0" },
    ];
  }
  if (role === "AGENCY") {
    return [
      { label: "Immobili pubblicati", value: "0" },
      { label: "Agenti", value: "0" },
      { label: "Lead attivi", value: "0" },
      { label: "Offerte ricevute", value: "0" },
    ];
  }
  // ADMIN
  return [
    { label: "Utenti totali", value: "0" },
    { label: "Agenzie attive", value: "0" },
    { label: "Immobili pubblicati", value: "0" },
    { label: "Abbonamenti attivi", value: "0" },
  ];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = useStats();
  const displayName = user?.firstName ?? user?.displayName ?? "Utente";

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111111", marginBottom: 4 }}>
        Ciao, {displayName}
      </h1>
      <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 32 }}>
        Ecco il riepilogo della tua attività.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #D4D4D4",
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 8 }}>{stat.label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: "#111111" }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
