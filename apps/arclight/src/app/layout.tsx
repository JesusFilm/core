import CssBaseline from '@mui/material/CssBaseline'
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
      <CssBaseline />
      <body>{children}</body>
    </html>
  )
}
