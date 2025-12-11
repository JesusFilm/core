import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
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
    <html lang="en" suppressHydrationWarning>
      <body className="text-text-primary dark:text-primary dark:bg-background-dark bg-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
