import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { getApolloClient } from '../../../lib/apolloClient'

import { GET_SHORT_LINK_QUERY } from './getShortLinkQuery'

export const fetchCache = 'force-no-store'

export default async function PathnamePage({
  params
}: {
  params: Promise<{ hostname: string; pathname: string[] }>
}): Promise<ReactElement> {
  const { pathname, hostname } = await params
  const client = getApolloClient()

  const { data } = await client.query({
    query: GET_SHORT_LINK_QUERY,
    variables: {
      hostname,
      pathname: pathname.join('/')
    }
  })

  switch (data.shortLink.__typename) {
    case 'QueryShortLinkByPathSuccess':
      return redirect(data.shortLink.data.to)
    default:
      return notFound()
  }
}
