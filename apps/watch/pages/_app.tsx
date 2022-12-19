import { ReactElement } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { DefaultSeo } from 'next-seo'
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import '../public/fonts/fonts.css'
import '../public/styles/carousel.css'
import '../public/styles/video-js.css'

const clientSideEmotionCache = createEmotionCache({})

export default function WatchApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & {
  emotionCache?: EmotionCache
}): ReactElement {
  return (
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
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}
