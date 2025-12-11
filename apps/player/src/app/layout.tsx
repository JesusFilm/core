import { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'Player'
}

export default function RootLayout({
  children
}: {
  children: ReactNode
}): ReactNode {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary">{children}</body>
    </html>
  )
}
