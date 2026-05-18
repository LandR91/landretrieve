"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const GREEN = "#26A55B";
const TEXT = "#111111";
const MUTED = "#4b5563";

export default function AbbonamentoSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(interval);
          router.push("/dashboard/abbonamento");
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: TEXT, margin: "0 0 .6rem" }}>
        Abbonamento attivato!
      </h1>
      <p style={{ fontSize: ".95rem", color: MUTED, margin: "0 0 .5rem", maxWidth: 400 }}>
        Grazie per aver scelto LandRetrieve. Il tuo piano è ora attivo e puoi iniziare a utilizzare tutte le funzionalità.
      </p>
      <p style={{ fontSize: ".82rem", color: MUTED, marginBottom: "1.5rem" }}>
        Reindirizzamento automatico tra {countdown} second{countdown !== 1 ? "i" : "o"}…
      </p>
      <button
        onClick={() => router.push("/dashboard/abbonamento")}
        style={{
          padding: ".6rem 1.4rem", background: GREEN, color: "#fff",
          border: "none", borderRadius: 7, fontSize: ".9rem", fontWeight: 700, cursor: "pointer",
        }}
      >
        Vai al pannello abbonamento
      </button>
    </div>
  );
}
