import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { getLangDir } from 'rtl-detect'
import { GoogleTagManager } from '@next/third-parties/google'

import DatadogErrorBoundary from '@/components/Datadog/ErrorBoundary'
import DatadogInit from '@/components/Datadog/Init'

import '@/app/globals.css'

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const direction = getLangDir(locale)

  return (
    <html lang={locale} dir={direction}>
      <body>
        <DatadogInit />
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        <NextIntlClientProvider>
          <DatadogErrorBoundary>
            {children}
          </DatadogErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
