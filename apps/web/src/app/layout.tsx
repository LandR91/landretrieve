import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LandRetrieve — Rural Properties in Italy',
    template: '%s | LandRetrieve',
  },
  description: 'Discover exclusive rural properties in Italy — ville, casali, agriturismi, aziende agricole e terreni.',
  keywords: ['rural property Italy', 'casale Italy', 'agriturismo for sale', 'Italian farmhouse'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://landretrieve.com'),
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    alternateLocale: ['en_GB', 'de_DE', 'fr_FR'],
    siteName: 'LandRetrieve',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
