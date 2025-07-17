import { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'Arclight'
}

export default function RootLayout({
  children
}: {
  children: ReactNode
}): ReactNode {
  return (
    <html lang="en">
      <body className="bg-transparent">{children}</body>
    </html>
  )
}
