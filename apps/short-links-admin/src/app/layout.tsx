import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

import { EnvironmentBanner } from '../components/EnvironmentBanner'
import { AuthProvider } from '../libs/auth/AuthProvider'
import { getUser } from '../libs/auth/getUser'

import { ApolloProvider } from './_ApolloProvider'

import { AnchoredToastProvider, ToastProvider } from '@/components/ui/toast'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
})

export const metadata = {
  title: 'Short Links Admin'
}

export default async function RootLayout({
  children
}: {
  children: ReactNode
}): Promise<ReactNode> {
  const user = await getUser()

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-svh font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <EnvironmentBanner />
          <AuthProvider user={user}>
            <ApolloProvider user={user}>
              <ToastProvider position="bottom-right">
                <AnchoredToastProvider>{children}</AnchoredToastProvider>
              </ToastProvider>
            </ApolloProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
