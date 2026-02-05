import type { ReactNode } from 'react'

import './globals.css'

export const metadata = {
  title: 'AI Media — Subtitles Coverage',
  description: 'Subtitle coverage report across media collections.'
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
