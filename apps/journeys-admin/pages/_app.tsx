import { useEffect, ReactElement } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth } from 'firebase/auth'
import { AuthProvider, firebaseClient } from '../src/libs/firebaseClient'
import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { createApolloClient } from '../src/libs/client'
import { setContext } from '@apollo/client/link/context'

function CustomApp({ Component, pageProps }: AppProps): ReactElement {
  const auth = getAuth(firebaseClient)
  const [user] = useAuthState(auth)
  const firebaseToken = createApolloClient(user?.accessToken)
  console.log('this is the firebase token', firebaseToken)

  const httpLink = createHttpLink({
    uri: '/',
  })

  const authLink = setContext((_, { headers }) => {
    const token = firebaseToken
    // const token = localStorage.getItem('token')
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  })

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  })

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
