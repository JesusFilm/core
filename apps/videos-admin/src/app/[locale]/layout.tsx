import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ReactNode } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { AuthProvider } from '../../libs/auth/AuthProvider'
import { getUser } from '../../libs/auth/getUser'

import { ApolloWrapper } from './_apolloWrapper/ApolloWrapper'

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}): Promise<ReactNode> {
  const messages = await getMessages()
  const user = await getUser()

  return (
    <html lang={locale}>
      <body>
        <AuthProvider user={user}>
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
        </AuthProvider>
      </body>
    </html>
  )
}
