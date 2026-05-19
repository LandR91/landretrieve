import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LandRetrieve',
  description: 'Real estate search and retrieval',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
