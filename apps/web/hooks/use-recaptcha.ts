"use client";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export function useRecaptcha() {
  async function getToken(action: string): Promise<string> {
    if (!SITE_KEY || typeof window === "undefined" || !window.grecaptcha) return "";
    return new Promise<string>((resolve) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(SITE_KEY, { action })
          .then(resolve)
          .catch(() => resolve(""));
      });
    });
  }

  return { getToken };
}
