import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { ReactNode } from 'react'

import { AuthProvider } from '../libs/auth/AuthProvider'
import { getUser } from '../libs/auth/getUser'
import { SnackbarProvider } from '../libs/SnackbarProvider'
import { UploadVideoVariantProvider } from '../libs/UploadVideoVariantProvider'

import { ApolloProvider } from './_ApolloProvider'

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}): Promise<ReactNode> {
  const user = await getUser()

  return (
    <html lang="en">
      <body>
        <AuthProvider user={user}>
          <ApolloProvider user={user}>
            <SnackbarProvider
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              <UploadVideoVariantProvider>
                <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
              </UploadVideoVariantProvider>
            </SnackbarProvider>
          </ApolloProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
