import { ReactNode } from 'react'

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
      <body>{children}</body>
    </html>
  )
}
