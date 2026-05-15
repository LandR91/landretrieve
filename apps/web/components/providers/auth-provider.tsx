"use client";

import { SessionProvider } from "next-auth/react";
import { PhotoGate } from "@/components/auth/photo-gate";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <PhotoGate />
    </SessionProvider>
  );
}
