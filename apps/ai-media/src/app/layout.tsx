import type { ReactNode } from 'react'

import './globals.css'

export const metadata = {
  title: 'AI Media — Coverage Report',
  description: 'Subtitle, voiceover, and metadata coverage across media collections.'
}

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
