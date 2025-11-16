'use server'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { getLangDir } from 'rtl-detect'

import DatadogErrorBoundary from '@/components/Datadog/ErrorBoundary'
import DatadogInit from '@/components/Datadog/Init'
import { AuthProvider } from '@/components/Auth/AuthProvider'
import { getUser } from '@/libs/auth/getUser/server-getUser'
import { ApolloProvider } from '@/components/ApolloProvider'

import '@/app/globals.css'

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const direction = getLangDir(locale)
  const user = await getUser()

  return (
    <html lang={locale} dir={direction}>
      <body>
        <DatadogInit />
        <NextIntlClientProvider>
          <ApolloProvider user={user}>
            <AuthProvider initialUser={user}>
              <DatadogErrorBoundary>{children}</DatadogErrorBoundary>
            </AuthProvider>
          </ApolloProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
