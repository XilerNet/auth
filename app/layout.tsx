import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Xiler Authentication - Provided by BitCheck.me',
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
