import { ApolloClient, HttpLink, NormalizedCacheObject } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { isPast } from 'date-fns'
import jwtDecode, { JwtPayload } from 'jwt-decode'

import { cache as createCache } from './cache'

const ssrMode = typeof window === 'undefined'
const cache = ssrMode ? undefined : createCache()

export function createApolloClient(
  token?: string
): ApolloClient<NormalizedCacheObject> {
  let _token = token
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  const authLink = setContext(async (_, { headers }) => {
    if (!ssrMode && _token != null) {
      const exp = jwtDecode<JwtPayload>(_token).exp
      if (exp == null || isPast(new Date(exp * 1000))) {
        const { getAuth } = await import(
          /* webpackChunkName: "firebase/auth" */
          'firebase/auth'
        )
        _token = await getAuth().currentUser?.getIdToken()
      }
    }

    return {
      headers: {
        ...(!ssrMode ? headers : []),
        Authorization: _token
      }
    }
  })

  return new ApolloClient({
    ssrMode,
    link: authLink.concat(httpLink),
    cache: cache ?? createCache(),
    name: 'journeys-admin',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools: true
  })
}
