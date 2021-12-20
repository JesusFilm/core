import { AppProps } from 'next/app'
import Head from 'next/head'
import { ReactElement, useCallback, useEffect } from 'react'
import { ApolloProvider } from '@apollo/client'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { createApolloClient } from '../src/libs/client'
import { firebaseClient } from '../src/libs/firebaseClient'

export function CustomApp({ Component, pageProps }: AppProps): ReactElement {
  const auth = getAuth(firebaseClient)
  const [user] = useAuthState(auth)
  const client = createApolloClient(user?.accessToken)
  const signIn = useCallback(async (): Promise<void> => {
    await signInAnonymously(auth)
  }, [auth])

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
        <title>My page</title>
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
