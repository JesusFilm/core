import { notFound, redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { getApolloClient } from '../../lib/apolloClient'

import { GET_SHORT_LINK_QUERY } from './getShortLinkQuery'

export async function GET(request: NextRequest): Promise<void> {
  const hostname = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname
  const client = getApolloClient()

  const { data } = await client.query({
    query: GET_SHORT_LINK_QUERY,
    variables: {
      hostname,
      pathname: pathname.substring(1)
    }
  })

  switch (data.shortLink.__typename) {
    case 'QueryShortLinkByPathSuccess':
      return redirect(data.shortLink.data.to)
    case 'NotFoundError':
      return notFound()
  }
}
