import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'

export const { getClient } = registerApolloClient(() => {
  const authLink = setContext(async (_, { headers }) => {
    // If this is SSR, DO NOT PASS THE REQUEST HEADERS.
    // Just send along the authorization headers.
    // The **correct** headers will be supplied by the `getServerSideProps` invocation of the query
    return {
      headers: {
        ...(!isSsrMode ? headers : []),
        Authorization: token ?? ''
      }
    }
  })
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
      uri: 'http://example.com/api/graphql'
      // you can disable result caching here if you want to
      // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
      // fetchOptions: { cache: "no-store" },
    })
  })
})
