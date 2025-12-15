import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { getLangDir } from 'rtl-detect'

import './globals.css'
import { env } from '@/env'

export const metadata: Metadata = {
  title: 'Player',
  other: {
    'apple-itunes-app': `app-id=${env.NEXT_PUBLIC_IOS_APP_ID}`
  }
}

export default async function RootLayout({
  children
}: {
  children: ReactNode
}): Promise<ReactNode> {
  const locale = await getLocale()
  const direction = getLangDir(locale)

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className="text-text-primary dark:text-primary dark:bg-background-dark bg-white">
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
