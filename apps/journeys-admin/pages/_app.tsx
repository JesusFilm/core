import { useEffect, ReactElement } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../src/libs/apolloClient'
import { ThemeProvider } from '../src/components/ThemeProvider'
import { initAuth } from '../src/libs/firebaseClient/initAuth'

initAuth()

function JourneysAdminApp({ Component, pageProps }: AppProps): ReactElement {
  const apolloClient = useApollo(pageProps)

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])

  return (
    <>
      <Head>
        <title>Journeys Admin</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </ThemeProvider>
    </>
  )
}

export default JourneysAdminApp
