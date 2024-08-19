import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ReactNode } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { ApolloWrapper } from './_apolloWrapper/apolloWrapper'

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}): Promise<ReactNode> {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ApolloWrapper>
            <AppRouterCacheProvider>
              <ThemeProvider
                themeName={ThemeName.website}
                themeMode={ThemeMode.light}
              >
                {children}
              </ThemeProvider>
            </AppRouterCacheProvider>
          </ApolloWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
