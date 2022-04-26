import { useEffect, ReactElement } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ApolloProvider } from '@apollo/client'
import { SnackbarProvider } from 'notistack'
import { DefaultSeo } from 'next-seo'
import TagManager from 'react-gtm-module'
import { datadogRum } from '@datadog/browser-rum'
import { useApollo } from '../src/libs/apolloClient'
import { ThemeProvider } from '../src/components/ThemeProvider'
import { initAuth } from '../src/libs/firebaseClient/initAuth'

initAuth()

function JourneysAdminApp({ Component, pageProps }: AppProps): ReactElement {
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
        sampleRate: 100,
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
    <>
      <DefaultSeo
        titleTemplate="%s | Next Steps"
        defaultTitle="Admin | Next Steps"
      />
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider>
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
      </ThemeProvider>
    </>
  )
}

export default JourneysAdminApp
