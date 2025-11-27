'use server'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { type ReactNode } from 'react'
import { getLangDir } from 'rtl-detect'

import DatadogErrorBoundary from '@/components/Datadog/ErrorBoundary'
import DatadogInit from '@/components/Datadog/Init'
import { getToken } from '@/libs/auth/getToken'
import { ApolloProvider } from '@/components/ApolloProvider'

import '@/app/globals.css'

export default async function RootLayout({
  children
}: {
  children: ReactNode
}) {
  const locale = await getLocale()
  const direction = getLangDir(locale)
  const token = await getToken()
  return (
    <html lang={locale} dir={direction}>
      <body>
        <DatadogInit />
        <NextIntlClientProvider>
          <ApolloProvider token={token}>
            <DatadogErrorBoundary>{children}</DatadogErrorBoundary>
          </ApolloProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
