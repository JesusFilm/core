import { AppProps } from 'next/app'
import Head from 'next/head'
import { ReactElement, useCallback, useEffect } from 'react'
import { ApolloProvider } from '@apollo/client'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { DefaultSeo } from 'next-seo'
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'
import { createEmotionCache } from '@core/shared/ui'
import { firebaseClient } from '../src/libs/firebaseClient'
import { createApolloClient } from '../src/libs/client'

const clientSideEmotionCache = createEmotionCache()

function CustomApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & { emotionCache?: EmotionCache }): ReactElement {
  const auth = getAuth(firebaseClient)
  const [user] = useAuthState(auth)
  const client = createApolloClient(user?.accessToken)
  const signIn = useCallback(async (): Promise<void> => {
    await signInAnonymously(auth)
  }, [auth])

  useEffect(() => {
    void signIn()
  }, [signIn])

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
        defaultTitle="Next Steps | Helping you find the next best step on your spiritual journey"
      />
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </CacheProvider>
  )
}

export default CustomApp
