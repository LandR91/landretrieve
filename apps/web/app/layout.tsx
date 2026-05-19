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

const IUBENDA_SITE_ID = process.env.NEXT_PUBLIC_IUBENDA_SITE_ID ?? "0";
const IUBENDA_POLICY_ID = process.env.NEXT_PUBLIC_IUBENDA_COOKIE_POLICY_ID ?? "0";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

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

        {/* Iubenda cookie consent (auto-blocking mode) */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `var _iub=_iub||[];_iub.csConfiguration={"siteId":${IUBENDA_SITE_ID},"cookiePolicyId":${IUBENDA_POLICY_ID},"lang":"it","storage":{"useSiteId":true}};`,
          }}
        />
        <script
          type="text/javascript"
          src={`https://cs.iubenda.com/autoblocking/${IUBENDA_SITE_ID}.js`}
          async
        />
        <script
          type="text/javascript"
          src="//cdn.iubenda.com/cs/gpp/stub.js"
          async
        />
        <script
          type="text/javascript"
          src="//cdn.iubenda.com/cs/iubenda_cs.js"
          charSet="UTF-8"
          async
        />

        {/* Google reCAPTCHA v3 */}
        {RECAPTCHA_SITE_KEY && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
            async
          />
        )}
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
