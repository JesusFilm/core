import { ReactElement, useCallback, useEffect } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { SnackbarProvider } from 'notistack'
import { ApolloProvider } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { DefaultSeo } from 'next-seo'
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { firebaseClient } from '../src/libs/firebaseClient'
import { useApolloClient } from '../src/libs/client'
import 'swiper/swiper.min.css'
import '../public/fonts/fonts.css'
import '../public/styles/video-js.css'
import '../public/styles/swiper-js.css'

const clientSideEmotionCache = createEmotionCache({ prepend: false })

export default function WatchApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & { emotionCache?: EmotionCache }): ReactElement {
  const auth = getAuth(firebaseClient)
  const [user] = useAuthState(auth)
  const client = useApolloClient(
    user?.accessToken,
    pageProps.initialApolloState
  )
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
        <ThemeProvider
          themeName={ThemeName.website}
          themeMode={ThemeMode.light}
        >
          <SnackbarProvider>
            <Component {...pageProps} />
          </SnackbarProvider>
        </ThemeProvider>
      </ApolloProvider>
    </CacheProvider>
  )
}
