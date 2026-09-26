import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ReactNode } from 'react'

import { EnvironmentBanner } from '../components/EnvironmentBanner'
import { AuthProvider } from '../libs/auth/AuthProvider'
import { getUser } from '../libs/auth/getUser'
import { SnackbarProvider } from '../libs/SnackbarProvider'

import { ApolloProvider } from './_ApolloProvider'

export const metadata = {
  title: 'Short Links Admin'
}

export default async function RootLayout({
  children
}: {
  children: ReactNode
}): Promise<ReactNode> {
  const user = await getUser()

  return (
    <html lang="en">
      <body>
        <EnvironmentBanner />
        <AuthProvider user={user}>
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
        </AuthProvider>
      </body>
    </html>
  )
}
