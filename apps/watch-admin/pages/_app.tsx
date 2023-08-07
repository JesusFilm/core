import { ApolloProvider } from '@apollo/client'
import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { DefaultSeo } from 'next-seo'
import { AppProps as NextJsAppProps } from 'next/app'
import Head from 'next/head'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useEffect } from 'react'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import { ThemeProvider } from '../src/components/ThemeProvider'
import { useApollo } from '../src/libs/apolloClient'
import { initAuth } from '../src/libs/firebaseClient/initAuth'

initAuth()
const clientSideEmotionCache = createEmotionCache({})

type WatchAdminAppProps = NextJsAppProps<{ AuthUserSerialized?: string }> & {
  emotionCache?: EmotionCache
}

export default function WatchAdminApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: WatchAdminAppProps): ReactElement {
  const apolloClient = useApollo(
    pageProps.AuthUserSerialized != null
      ? JSON.parse(pageProps.AuthUserSerialized)._token
      : ''
  )

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])

  return (
    <CacheProvider value={emotionCache}>
      <DefaultSeo
        titleTemplate="%s | Next Steps"
        defaultTitle="Admin | Next Steps"
      />
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider>
        <ApolloProvider client={apolloClient}>
          <SnackbarProvider
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
          >
            <Component {...pageProps} />
          </SnackbarProvider>
        </ApolloProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}
