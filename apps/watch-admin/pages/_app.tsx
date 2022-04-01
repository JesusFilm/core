import { useEffect, ReactElement } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ApolloProvider } from '@apollo/client'
import { SnackbarProvider } from 'notistack'
import { DefaultSeo } from 'next-seo'
import { useApollo } from '../src/libs/apolloClient'
import { ThemeProvider } from '../src/components/ThemeProvider'
import { initAuth } from '../src/libs/firebaseClient/initAuth'

initAuth()

function JourneysAdminApp({ Component, pageProps }: AppProps): ReactElement {
  const apolloClient = useApollo(
    pageProps.AuthUserSerialized != null
      ? JSON.parse(pageProps.AuthUserSerialized)._token
      : '',
    pageProps
  )

  useEffect(() => {
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
