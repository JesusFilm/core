import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { getLangDir } from 'rtl-detect'

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
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
