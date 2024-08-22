import Container from '@mui/material/Container'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import { ReactNode } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { Nav } from '../../components/server/Nav'

import { ApolloWrapper } from './_apolloWrapper/apolloWrapper'

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
          <ApolloWrapper>
            <AppRouterCacheProvider>
              <ThemeProvider
                themeName={ThemeName.journeysAdmin}
                themeMode={ThemeMode.light}
              >
                <Container sx={{ my: 10, maxHeight: '100%' }}>
                  <Nav />
                  {children}
                </Container>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </ApolloWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
