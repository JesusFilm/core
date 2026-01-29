import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ReactNode, Suspense } from 'react'

import { EnvironmentBanner } from '../components/EnvironmentBanner'
import { AuthProvider } from '../libs/auth/AuthProvider'
import { getUser } from '../libs/auth/getUser'
import { SnackbarProvider } from '../libs/SnackbarProvider'

import { ApolloProvider } from './_ApolloProvider'
import { UploadVideoVariantProvider } from './_UploadVideoVariantProvider'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}): ReactNode {
  return (
    <html lang="en">
      <body>
        <EnvironmentBanner />
        <Suspense fallback={null}>
          <UserProviders>{children}</UserProviders>
        </Suspense>
      </body>
    </html>
  )
}

async function UserProviders({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
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
  )
}
