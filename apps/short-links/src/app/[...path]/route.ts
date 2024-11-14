import { graphql } from 'gql.tada'
import { notFound, redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { getApolloClient } from '../../lib/apolloClient'

const GET_SHORT_LINK = graphql(`
  query GetShortLink($hostname: String!, $pathname: String!) {
    shortLink: shortLinkByPath(hostname: $hostname, pathname: $pathname) {
      ... on QueryShortLinkByPathSuccess {
        data {
          to
        }
      }
    }
  }
`)

export async function GET(request: NextRequest): Promise<void> {
  const hostname = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname
  const client = await getApolloClient()

  const { data } = await client.query({
    query: GET_SHORT_LINK,
    variables: { hostname, pathname }
  })

  switch (data.shortLink.__typename) {
    case 'QueryShortLinkByPathSuccess':
      return redirect(data.shortLink.data.to)
    case 'NotFoundError':
      return notFound()
  }
}
