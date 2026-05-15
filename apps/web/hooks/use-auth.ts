"use client";

import { useSession, signOut } from "next-auth/react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePhotoGateStore } from "@/store/auth.store";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const openGate = usePhotoGateStore((s) => s.openGate);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user ?? null;

  /** Esegue `action` solo se l'utente ha la foto; altrimenti apre il gate */
  const withPhotoGate = useCallback(
    (action: () => void) => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      const hasPhoto = user?.role === "AGENCY"
        ? !!user?.agencyProfile
        : !!user?.avatar;

      if (!hasPhoto) {
        openGate(action);
      } else {
        action();
      }
    },
    [isAuthenticated, user, router, openGate],
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    role: user?.role ?? null,
    isAdmin: user?.role === "ADMIN",
    isAgency: user?.role === "AGENCY",
    isAgent: user?.role === "AGENT",
    isVisitor: user?.role === "VISITOR",
    withPhotoGate,
    logout,
  };
}
