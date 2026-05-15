import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LandRetrieve.com — our hills, your home",
    template: "%s | LandRetrieve.com",
  },
  description:
    "La piattaforma social-professionale per gli immobili rurali. Ville, agriturismi, casali e terreni in Italia e nel mondo.",
  keywords: ["immobili rurali", "casali", "agriturismo", "terreni agricoli", "ville", "real estate Italy"],
  authors: [{ name: "SB.Land" }],
  creator: "SB.Land",
  metadataBase: new URL("https://landretrieve.com"),
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://landretrieve.com",
    siteName: "LandRetrieve.com",
    title: "LandRetrieve.com — our hills, your home",
    description: "La piattaforma social-professionale per gli immobili rurali.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LandRetrieve.com — our hills, your home",
    description: "La piattaforma social-professionale per gli immobili rurali.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
