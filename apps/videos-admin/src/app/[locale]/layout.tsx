import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import { ReactNode } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { PageWrapper } from '../../components/PageWrapper/PageWrapper'

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}): ReactNode {
  const messages = useMessages()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppRouterCacheProvider>
            <ThemeProvider
              themeName={ThemeName.journeysAdmin}
              themeMode={ThemeMode.light}
            >
              <PageWrapper>{children}</PageWrapper>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
