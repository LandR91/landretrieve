"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";

export interface NewListingPayload {
  propertyId: string;
  title: string;
  slug: string;
  comune: string;
  categoria: string;
  price: number | null;
  currency: string;
  url: string;
}

export function useNewListingNotification() {
  const { data: session } = useSession();
  const [notification, setNotification] = useState<NewListingPayload | null>(null);

  const dismiss = useCallback(() => setNotification(null), []);

  useEffect(() => {
    const token = (session as { accessToken?: string } | null)?.accessToken;
    if (!token) return;

    const socket = getSocket(token);

    function handler(data: NewListingPayload) {
      setNotification(data);
    }

    socket.on("new_listing", handler);
    return () => {
      socket.off("new_listing", handler);
    };
  }, [session]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 8000);
    return () => clearTimeout(t);
  }, [notification]);

  return { notification, dismiss };
}
