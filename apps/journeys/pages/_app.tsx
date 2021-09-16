import { AppProps } from 'next/app'
import Head from 'next/head'
import { JourneysThemeProvider } from '../src/components/JourneysThemeProvider'
import { ReactElement, useEffect } from 'react'
import { ApolloProvider } from '@apollo/client'
import client from '../src/libs/client'

function CustomApp({ Component, pageProps }: AppProps): ReactElement {
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
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ApolloProvider client={client}>
        <JourneysThemeProvider>
          <Component {...pageProps} />
        </JourneysThemeProvider>
      </ApolloProvider>
    </>
  )
}

export default CustomApp
