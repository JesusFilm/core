import { ApolloProvider, type NormalizedCacheObject } from '@apollo/client'
import type { EmotionCache } from '@emotion/cache'
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter'
import { GoogleTagManager } from '@next/third-parties/google'
import type { AppProps as NextJsAppProps } from 'next/app'
import { Noto_Serif } from 'next/font/google'
import localFont from 'next/font/local'
import Head from 'next/head'
import Script from 'next/script'
import { appWithTranslation } from 'next-i18next'
import { DefaultSeo } from 'next-seo'
import { type ReactElement, useEffect } from 'react'

import { InstantSearchProvider } from '@core/journeys/ui/algolia/InstantSearchProvider'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import i18nConfig from '../next-i18next.config'
import { useApolloClient } from '../src/libs/apolloClient'

import 'swiper/css'
import 'swiper/css/a11y'
import 'swiper/css/navigation'
import '../public/watch/global.css'
import './fonts/fonts.css'

const clientSideEmotionCache = createEmotionCache({ prepend: false })
const notoSerif = Noto_Serif({
  weight: ['500', '700'],
  subsets: ['latin']
})

const apercuPro = localFont({
  src: [
    {
      path: './fonts/Apercu-Pro-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/Apercu-Pro-Medium.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: './fonts/Apercu-Pro-MediumItalic.woff2',
      weight: '500',
      style: 'italic'
    },
    {
      path: './fonts/Apercu-Pro-Bold.woff2',
      weight: '700',
      style: 'normal'
    },
    {
      path: './fonts/Apercu-Pro-BoldItalic.woff2',
      weight: '700',
      style: 'italic'
    }
  ]
})

type WatchAppProps = NextJsAppProps<{
  flags?: { [key: string]: boolean }
}> & {
  emotionCache?: EmotionCache
}

function WatchApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: WatchAppProps): ReactElement {
  useEffect(() => {
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

  // Check if the current environment is production using Vercel's environment variable
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'

  // Only exclude robots meta tag for production environment
  // Account for different production environment naming conventions
  const isProduction = ['production', 'prod', 'prd'].includes(
    vercelEnv.toLowerCase()
  )

  return (
    <>
      <style jsx global>{`
        :root {
          --font-noto-serif: ${notoSerif.style.fontFamily};
          --font-apercu-pro: ${apercuPro.style.fontFamily};
        }
      `}</style>
      <FlagsProvider flags={pageProps.flags}>
        <ApolloProvider client={client}>
          <AppCacheProvider emotionCache={emotionCache}>
            <DefaultSeo
              titleTemplate="%s | Jesus Film Project"
              defaultTitle="Watch | Jesus Film Project"
              description="Free Gospel Video Streaming Library. Watch, learn and share the gospel in over 2000 languages."
              dangerouslySetAllPagesToNoFollow={isProduction === false}
              dangerouslySetAllPagesToNoIndex={isProduction === false}
            />
            <Head>
              <meta name="theme-color" content="#000" />
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
              <InstantSearchProvider>
                <GoogleTagManager
                  gtmId={process.env.NEXT_PUBLIC_GTM_ID ?? ''}
                />
                <Component {...pageProps} />
              </InstantSearchProvider>
            </ThemeProvider>
          </AppCacheProvider>
        </ApolloProvider>
      </FlagsProvider>
    </>
  )
}

export default appWithTranslation(WatchApp, i18nConfig)
