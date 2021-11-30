import { useEffect, ReactElement } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { UseFirebase } from '../src/libs/firebaseClient'
import { ApolloProvider } from '@apollo/client'
import { createApolloClient } from '../src/libs/client'

function CustomApp({ Component, pageProps }: AppProps): ReactElement {
  const { user } = UseFirebase()
  const client = createApolloClient(user?.accessToken)
  console.log(user)

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
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </>
  )
}

export default CustomApp
