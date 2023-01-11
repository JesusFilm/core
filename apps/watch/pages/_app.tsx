import { ReactElement } from 'react'
import { AppProps as NextJsAppProps } from 'next/app'
import Head from 'next/head'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import { DefaultSeo } from 'next-seo'
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import 'swiper/swiper.min.css'
import '../public/fonts/fonts.css'
import '../public/styles/swiper-js.css'
import { useApolloClient } from '../src/libs/apolloClient'

const clientSideEmotionCache = createEmotionCache({ prepend: false })

type WatchAppProps = NextJsAppProps & {
  emotionCache?: EmotionCache
}

export default function WatchApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: WatchAppProps): ReactElement {
  const initialPageProps = pageProps as {
    initialApolloState?: NormalizedCacheObject
  }
  const client = useApolloClient({
    initialState: initialPageProps.initialApolloState
  })

  return (
    <ApolloProvider client={client}>
      <CacheProvider value={emotionCache}>
        <DefaultSeo
          titleTemplate="%s | Jesus Film Project"
          defaultTitle="Watch | Jesus Film Project"
          description="Free Gospel Video Streaming Library. Watch, learn and share the gospel in over 2000 languages."
        />
        <Head>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <ThemeProvider
          themeName={ThemeName.website}
          themeMode={ThemeMode.light}
        >
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </ApolloProvider>
  )
}
