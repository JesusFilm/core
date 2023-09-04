import { ApolloProvider } from '@apollo/client'
import { datadogRum } from '@datadog/browser-rum'
import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { SSRConfig, appWithTranslation } from 'next-i18next'
import { DefaultSeo } from 'next-seo'
import NextApp, { AppProps as NextJsAppProps } from 'next/app'
import Head from 'next/head'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import { UAParser } from 'ua-parser-js'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import i18nConfig from '../next-i18next.config'
import { HelpScoutBeacon } from '../src/components/HelpScoutBeacon'
import { TeamProvider } from '../src/components/Team/TeamProvider'
import { ThemeProvider } from '../src/components/ThemeProvider'
import { useApollo } from '../src/libs/apolloClient'
import { initAuth } from '../src/libs/firebaseClient/initAuth'

import '../public/swiper-pagination-override.css'

initAuth()
const clientSideEmotionCache = createEmotionCache({})

type JourneysAdminAppProps = NextJsAppProps<{
  AuthUserSerialized?: string
  flags?: { [key: string]: boolean }
}> & {
  pageProps: SSRConfig
  emotionCache?: EmotionCache
  deviceType: string
}

function JourneysAdminApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
  deviceType
}: JourneysAdminAppProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const token =
    (pageProps.AuthUserSerialized != null
      ? (JSON.parse(pageProps.AuthUserSerialized)._token as string | null)
      : '') ?? ''
  const apolloClient = useApollo(token)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GTM_ID != null)
      TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID })

    if (
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID != null &&
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN != null
    )
      datadogRum.init({
        applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
        clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
        site: 'datadoghq.com',
        service: 'journeys-admin',
        env: process.env.NEXT_PUBLIC_VERCEL_ENV,
        version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
        sampleRate: 50,
        sessionReplaySampleRate: 10,
        trackInteractions: true,
        defaultPrivacyLevel: 'mask-user-input'
      })

    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])

  return (
    <FlagsProvider flags={pageProps.flags}>
      <CacheProvider value={emotionCache}>
        <ThemeProvider deviceType={deviceType}>
          <DefaultSeo
            titleTemplate={t('%s | Next Steps')}
            defaultTitle={t('Admin | Next Steps')}
          />
          <HelpScoutBeacon />
          <Head>
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width"
            />
          </Head>

          <ApolloProvider client={apolloClient}>
            <TeamProvider>
              <SnackbarProvider
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
              >
                <Component {...pageProps} />
              </SnackbarProvider>
            </TeamProvider>
          </ApolloProvider>
        </ThemeProvider>
      </CacheProvider>
    </FlagsProvider>
  )
}

JourneysAdminApp.getInitialProps = async (context) => {
  let userAgent

  if (context.ctx.req != null) {
    userAgent = new UAParser(context.ctx.req.headers['user-agent'])
  }

  return await {
    ...NextApp.getInitialProps(context),
    deviceType: userAgent.getDevice().type ?? 'desktop'
  }
}

export default appWithTranslation(JourneysAdminApp, i18nConfig)
