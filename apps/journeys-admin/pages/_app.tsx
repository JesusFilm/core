import { useEffect, ReactElement } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useFirebase } from '../src/libs/firebaseClient'
import { ApolloProvider } from '@apollo/client'
import { createApolloClient } from '../src/libs/client'
import { ThemeProvider } from '../src/components'

function CustomApp({ Component, pageProps }: AppProps): ReactElement {
  const { user } = useFirebase()
  const client = createApolloClient(user?.accessToken)

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
        <ApolloProvider client={client}>
          <Component {...pageProps} />
        </ApolloProvider>
      </ThemeProvider>
    </>
  )
}

export default CustomApp
