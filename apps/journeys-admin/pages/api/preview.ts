import { gql } from '@apollo/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'

import { createApolloClient } from '../../src/libs/apolloClient'
import { authConfig } from '../../src/libs/auth/config'
import { toUser } from '../../src/libs/auth/getAuthTokens'

export const GET_PRIVATE_PREVIEW_ID = gql`
  query GetPrivatePreviewId($slug: ID!) {
    adminJourney(id: $slug, idType: slug) {
      id
    }
  }
`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  res.setHeader('Vary', 'Cookie')
  if (req.method !== 'GET' || typeof req.query.slug !== 'string') {
    res.status(400).json({ error: 'Preview unavailable' })
    return
  }
  try {
    const tokens = await getApiRequestTokens(req, authConfig)
    if (!tokens || toUser(tokens).isAnonymous) throw new Error('Unauthorized')
    const client = createApolloClient(tokens.token)
    const { data } = await client.query<{ adminJourney: { id: string } }>({
      query: GET_PRIVATE_PREVIEW_ID,
      variables: { slug: req.query.slug },
      fetchPolicy: 'no-cache'
    })
    if (!data) throw new Error('Unauthorized')
    res.redirect(
      307,
      `/journeys/${encodeURIComponent(data.adminJourney.id)}/preview`
    )
  } catch {
    res.status(403).json({ error: 'Preview unavailable' })
  }
}
