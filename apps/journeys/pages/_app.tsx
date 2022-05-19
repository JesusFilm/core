import { AppProps } from 'next/app'
import Head from 'next/head'
import { ReactElement, useEffect } from 'react'
import { ApolloProvider } from '@apollo/client'
import { DefaultSeo } from 'next-seo'
import TagManager from 'react-gtm-module'
import { datadogRum } from '@datadog/browser-rum'
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'
import { createEmotionCache } from '@core/shared/ui'
import { SnackbarProvider } from 'notistack'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { apolloClient } from '../src/libs/apolloClient'
import { firebaseClient } from '../src/libs/firebaseClient'

const clientSideEmotionCache = createEmotionCache()

export default function JourneysApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & { emotionCache?: EmotionCache }): ReactElement {
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
        sampleRate: 100,
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
      <ApolloProvider client={apolloClient}>
        <SnackbarProvider>
          <Component {...pageProps} />
        </SnackbarProvider>
      </ApolloProvider>
    </CacheProvider>
  )
}
