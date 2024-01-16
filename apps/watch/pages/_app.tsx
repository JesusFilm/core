import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import algoliasearch from 'algoliasearch'
import { AppProps as NextJsAppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { DefaultSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { Configure, InstantSearch } from 'react-instantsearch'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { useApolloClient } from '../src/libs/apolloClient'

import 'swiper/css'
import 'swiper/css/a11y'
import 'swiper/css/navigation'
import '../public/fonts/fonts.css'

const clientSideEmotionCache = createEmotionCache({ prepend: false })

type WatchAppProps = NextJsAppProps & {
  emotionCache?: EmotionCache
}

export default function WatchApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: WatchAppProps): ReactElement {
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_GTM_ID != null &&
      process.env.NEXT_PUBLIC_GTM_ID !== ''
    )
      TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID })

    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])
  const initialPageProps = pageProps as {
    initialApolloState?: NormalizedCacheObject
  }
  const client = useApolloClient({
    initialState: initialPageProps.initialApolloState
  })

  const searchClient = algoliasearch(
    'FJYYBFHBHS',
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
  )

  return (
    <ApolloProvider client={client}>
      <CacheProvider value={emotionCache}>
        <InstantSearch searchClient={searchClient} indexName="video_variants">
          <Configure hitsPerPage={20} />
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
          {process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID != null &&
            process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID !== '' &&
            process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN != null &&
            process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN !== '' && (
              <Script id="datadog-rum">
                {`
             (function(h,o,u,n,d) {
               h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
               d=o.createElement(u);d.async=1;d.src=n
               n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
             })(window,document,'script','https://www.datadoghq-browser-agent.com/us1/v5/datadog-rum.js','DD_RUM')
             window.DD_RUM.onReady(function() {
               window.DD_RUM.init({
                applicationId: '${
                  process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? ''
                }',
                clientToken: '${
                  process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ?? ''
                }',
                site: 'datadoghq.com',
                service: 'watch',
                env: '${process.env.NEXT_PUBLIC_VERCEL_ENV ?? ''}',
                version: '${
                  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
                }',
                sampleRate: 50,
                sessionReplaySampleRate: 10,
                trackInteractions: true,
                defaultPrivacyLevel: 'mask-user-input'
               });
             })
           `}
              </Script>
            )}
          <ThemeProvider
            themeName={ThemeName.website}
            themeMode={ThemeMode.light}
          >
            <Component {...pageProps} />
          </ThemeProvider>
        </InstantSearch>
      </CacheProvider>
    </ApolloProvider>
  )
}
