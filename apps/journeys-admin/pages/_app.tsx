import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import type { EmotionCache } from '@emotion/cache'
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter'
import { GoogleTagManager } from '@next/third-parties/google'
import { AppProps as NextJsAppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { SSRConfig, appWithTranslation, useTranslation } from 'next-i18next'
import { DefaultSeo } from 'next-seo'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useEffect } from 'react'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import i18nConfig from '../next-i18next.config'
import { ThemeProvider } from '../src/components/ThemeProvider'
import { useApollo } from '../src/libs/apolloClient'
import { initAuth } from '../src/libs/firebaseClient/initAuth'

import 'swiper/css'
import 'swiper/css/a11y'
import 'swiper/css/mousewheel'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import '../public/swiper-pagination-override.css'

initAuth()

type JourneysAdminAppProps = NextJsAppProps<{
  userSerialized?: string
  flags?: { [key: string]: boolean }
  initialApolloState?: NormalizedCacheObject
}> & {
  pageProps: SSRConfig
  emotionCache?: EmotionCache
}

function JourneysAdminApp({
  Component,
  pageProps,
  emotionCache
}: JourneysAdminAppProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const user =
    pageProps.userSerialized != null
      ? JSON.parse(pageProps.userSerialized)
      : null

  const apolloClient = useApollo({
    initialState: pageProps.initialApolloState,
    token: user?._token
  })

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [user])

  return (
    <FlagsProvider flags={pageProps.flags}>
      <AppCacheProvider emotionCache={emotionCache}>
        <ThemeProvider>
          <DefaultSeo
            titleTemplate={t('%s | Next Steps')}
            defaultTitle={t('Admin | Next Steps')}
          />
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
                service: 'journeys-admin',
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
          <ApolloProvider client={apolloClient}>
            <TeamProvider>
              <SnackbarProvider
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
              >
                <GoogleTagManager
                  gtmId={process.env.NEXT_PUBLIC_GTM_ID ?? ''}
                  dataLayer={{ userId: user?.id }}
                />
                <Component {...pageProps} />
              </SnackbarProvider>
            </TeamProvider>
          </ApolloProvider>
        </ThemeProvider>
      </AppCacheProvider>
    </FlagsProvider>
  )
}

export default appWithTranslation(JourneysAdminApp, i18nConfig)
