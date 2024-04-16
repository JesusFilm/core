import { ApolloProvider } from '@apollo/client'
import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { type AppProps as NextJsAppProps } from 'next/app'
import Head from 'next/head'
import { type SSRConfig, appWithTranslation } from 'next-i18next'
import { SnackbarProvider } from 'notistack'
import { type ReactElement } from 'react'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import { ThemeProvider } from '../src/components/ThemeProvider'
import { useApollo } from '../src/libs/apolloClient'
import { initAuth } from '../src/libs/firebaseClient'

initAuth()

const clientSideEmotionCache = createEmotionCache({})

type NexusAdminAppProps = NextJsAppProps<{
  userSerialized?: string
}> & {
  pageProps: SSRConfig
  emotionCache?: EmotionCache
}

function NexusAdminApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: NexusAdminAppProps): ReactElement {
  const user =
    pageProps.userSerialized != null
      ? JSON.parse(pageProps.userSerialized)
      : null

  const token = user?._token ?? ''

  const apolloClient = useApollo(token)

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider>
        <Head>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <link
            rel="preconnect"
            href={process.env.NEXT_PUBLIC_GATEWAY_URL}
            crossOrigin=""
          />
        </Head>
        <ApolloProvider client={apolloClient}>
          <SnackbarProvider
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
          >
            <GoogleOAuthProvider
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}
            >
              <Component {...pageProps} />
            </GoogleOAuthProvider>
          </SnackbarProvider>
        </ApolloProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default appWithTranslation(NexusAdminApp)
