import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ReactNode } from 'react'

import { AuthProvider } from '../../libs/auth/AuthProvider'
import { getUser } from '../../libs/auth/getUser'
import { SnackbarProvider } from '../../libs/SnackbarProvider'

import { ApolloProvider } from './_ApolloProvider'

export default async function LocaleLayout(
  props: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
  }
): Promise<ReactNode> {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  const messages = await getMessages()
  const user = await getUser()

  return (
    <html lang={locale}>
      <body>
        <AuthProvider user={user}>
          <NextIntlClientProvider messages={messages}>
            <ApolloProvider user={user}>
              <SnackbarProvider
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
              >
                <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
              </SnackbarProvider>
            </ApolloProvider>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
