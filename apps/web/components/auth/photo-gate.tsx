"use client";

import { usePhotoGateStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";

export function PhotoGate() {
  const { show, pendingAction, closeGate } = usePhotoGateStore();
  const router = useRouter();

  if (!show) return null;

  function handleGoToProfile() {
    closeGate();
    router.push("/dashboard/profilo");
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        {/* Close */}
        <button
          onClick={closeGate}
          className="absolute right-4 top-4 text-[#4b5563] transition-colors hover:text-[#111111]"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "#e8f7ef" }}
        >
          <Camera size={30} style={{ color: "#26A55B" }} />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-semibold" style={{ color: "#111111" }}>
          Completa il tuo profilo
        </h2>
        <p className="mb-6 text-center text-sm" style={{ color: "#4b5563" }}>
          Per continuare aggiungi la tua foto profilo. Aiuta gli altri utenti
          a riconoscerti sulla piattaforma.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoToProfile}
            className="w-full rounded-md py-2.5 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#26A55B" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d8a4b")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#26A55B")}
          >
            Vai al profilo
          </button>
          <button
            onClick={closeGate}
            className="w-full rounded-md border py-2.5 text-sm font-medium transition-colors"
            style={{ borderColor: "#D4D4D4", color: "#374151" }}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
