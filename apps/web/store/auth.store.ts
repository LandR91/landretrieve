"use client";

import { create } from "zustand";

interface PhotoGateState {
  show: boolean;
  pendingAction: (() => void) | null;
  openGate: (onComplete?: () => void) => void;
  closeGate: () => void;
}

export const usePhotoGateStore = create<PhotoGateState>((set) => ({
  show: false,
  pendingAction: null,
  openGate: (onComplete) =>
    set({ show: true, pendingAction: onComplete ?? null }),
  closeGate: () => set({ show: false, pendingAction: null }),
}));
