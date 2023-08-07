import { ApolloProvider } from '@apollo/client'
import { datadogRum } from '@datadog/browser-rum'
import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { SSRConfig, appWithTranslation } from 'next-i18next'
import { DefaultSeo } from 'next-seo'
import { AppProps as NextJsAppProps } from 'next/app'
import Head from 'next/head'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'

import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import { GetJourney_journey as Journey } from '../__generated__/GetJourney'
import i18nConfig from '../next-i18next.config'
import { useApollo } from '../src/libs/apolloClient'
import { firebaseClient } from '../src/libs/firebaseClient'

type JourneysAppProps = NextJsAppProps<{ journey?: Journey }> & {
  pageProps: SSRConfig
  emotionCache?: EmotionCache
}

function JourneysApp({
  Component,
  pageProps,
  emotionCache = createEmotionCache({
    rtl: getJourneyRTL(pageProps.journey).rtl
  })
}: JourneysAppProps): ReactElement {
  const { t } = useTranslation('apps-journeys')
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_GTM_ID != null &&
      process.env.NEXT_PUBLIC_GTM_ID !== ''
    )
      TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID })

    if (
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID != null &&
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID !== '' &&
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN != null &&
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN !== ''
    )
      datadogRum.init({
        applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
        clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
        site: 'datadoghq.com',
        service: 'journeys',
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
    const auth = getAuth(firebaseClient)
    return onAuthStateChanged(auth, (user) => {
      if (user != null) {
        TagManager.dataLayer({ dataLayer: { userId: user.uid } })
      } else {
        TagManager.dataLayer({ dataLayer: { userId: undefined } })
      }
    })
  }, [])
  const apolloClient = useApollo()

  return (
    <CacheProvider value={emotionCache}>
      <DefaultSeo
        titleTemplate={t('%s | Next Steps')}
        defaultTitle={t('Next Steps')}
      />
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
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
    </CacheProvider>
  )
}

export default appWithTranslation(JourneysApp, i18nConfig)
