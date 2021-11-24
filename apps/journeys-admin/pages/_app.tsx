import { useEffect, useCallback, ReactElement } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth } from 'firebase/auth'
import { AuthProvider, firebaseClient } from '../src/libs/firebaseClient'
import { ApolloProvider } from '@apollo/client'
import { createApolloClient } from '../src/libs/client'

function CustomApp({ Component, pageProps }: AppProps): ReactElement {
  const auth = getAuth(firebaseClient)
  const [user] = useAuthState(auth)
  const client = createApolloClient(user?.accessToken)
  const signIn = useCallback(async (): Promise<void> => {
    // 
  }, [])

  useEffect(() => {
    void signIn()
  }, [signIn])

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
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ApolloProvider>
    </>
  )
}

export default CustomApp
