import type { ReactNode } from 'react'

import './globals.css'

export const metadata = {
  title: 'AI Media — Subtitles Workflow',
  description: 'Mux AI subtitles workflow stages and development checklist.'
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
