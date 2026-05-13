import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'LandRetrieve.com — Portale Immobiliare Rurale Internazionale',
    template: '%s | LandRetrieve.com',
  },
  description:
    'LandRetrieve.com è il portale immobiliare dedicato agli immobili rurali. Trova ville, casali, agriturismi, aziende agricole e terreni. Solo buyer qualificati, solo professionisti verificati.',
  keywords: [
    'immobili rurali',
    'ville rurali vendita',
    'casali vendita',
    'agriturismi vendita',
    'aziende agricole',
    'terreni agricoli',
    'immobili lusso rurali',
    'casali ristrutturati',
  ],
  authors: [{ name: 'SB.Land', url: 'https://landretrieve.com' }],
  creator: 'SB.Land',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    alternateLocale: ['en_GB'],
    url: 'https://www.landretrieve.com',
    siteName: 'LandRetrieve',
    title: 'LandRetrieve.com — Portale Immobiliare Rurale Internazionale',
    description:
      'Il portale immobiliare dedicato agli immobili rurali. Solo professionisti verificati.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LandRetrieve.com — Portale Immobiliare Rurale Internazionale',
    description: 'Il portale immobiliare dedicato agli immobili rurali. Solo professionisti verificati.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
