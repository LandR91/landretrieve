import type { Config } from "tailwindcss";

export const tailwindConfig: Omit<Config, "content"> = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // ─── LandRetrieve Design System ──────────────────────────────
        green: {
          DEFAULT: "#26A55B",
          dark: "#1d8a4b",
          light: "#e8f7ef",
          xlight: "#f0fbf5",
          accessible: "#1a7a42",
        },
        border: "#D4D4D4",
        "footer-bg": "#CACACA",
        // ─── Text ────────────────────────────────────────────────────
        text: {
          DEFAULT: "#111111",
          soft: "#374151",
          muted: "#4b5563",
        },
        // ─── Backgrounds ─────────────────────────────────────────────
        light: "#f5f5f5",
        dark: {
          1: "#0a1f12",
          2: "#0f2a1a",
          3: "#1a4a2e",
        },
        // ─── shadcn/ui CSS variable tokens ───────────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero-h1": ["clamp(3rem, 7vw, 5.5rem)", { fontWeight: "700" }],
        "section-h2": ["clamp(1.75rem, 3vw, 2.4rem)", { fontWeight: "600" }],
        h3: ["1.1rem", { fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.7" }],
        small: ["0.875rem", {}],
        label: ["0.78rem", { fontWeight: "700", letterSpacing: "0.06em" }],
        eyebrow: ["0.72rem", { fontWeight: "700", letterSpacing: "0.14em" }],
        "nav-link": ["1rem", { fontWeight: "500" }],
      },
      spacing: {
        "nav-h": "72px",
        "max-w": "1200px",
        "sidebar-w": "240px",
      },
      maxWidth: {
        site: "1200px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
